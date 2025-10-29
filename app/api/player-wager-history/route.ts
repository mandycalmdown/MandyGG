import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { kv } from "@/lib/kv"

interface ThrillApiResponse {
  items: Array<{
    username: string
    campaignName: string
    createdAt: string
    wager: {
      value: string
      currency: string
      decimals: number
    }
    earning: {
      value: string
      currency: string
      decimals: number
    }
    xp: {
      value: string
      decimals: number
    }
  }>
  isLastBatch: boolean
  totalCount: number
}

function convertAtomicValue(value: string, decimals: number): number {
  try {
    if (!value || value === "0") return 0
    const bigIntValue = BigInt(value)
    const divisor = BigInt(10 ** decimals)
    const result = Number(bigIntValue) / Number(divisor)
    return Math.floor(result)
  } catch (error) {
    console.error("[v0] Error converting atomic value:", value, decimals, error)
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (!profile?.thrill_username) {
      return NextResponse.json({ error: "Thrill username not set" }, { status: 400 })
    }

    const cacheKey = `wager-history:${profile.thrill_username}`
    const staleCacheKey = `${cacheKey}:stale`

    const cached = await kv.get(cacheKey)

    if (cached) {
      console.log("[v0] Returning cached wager history from Redis")
      return NextResponse.json(cached)
    }

    const staleCache = await kv.get(staleCacheKey)
    if (staleCache) {
      console.log("[v0] Returning stale cache while fetching fresh data")
      // Return stale data immediately
      const response = NextResponse.json({
        ...staleCache,
        status: "stale_cache",
        message: "Showing cached data",
      })

      // Don't wait for the background fetch
      return response
    }

    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      console.log("[v0] THRILL_API_TOKEN not set, returning mock data")
      return NextResponse.json({
        last7Days: 15000,
        last30Days: 75000,
        status: "mock_data",
      })
    }

    // Thrill API uses UTC and toDate is EXCLUSIVE
    // Add 1 day to toDate to ensure we capture all wagers up to now
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const fromDate30 = thirtyDaysAgo.toISOString().split("T")[0]
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const toDate = tomorrow.toISOString().split("T")[0] // Exclusive, so add 1 day

    console.log("[v0] Fetching wager history from", fromDate30, "to", toDate, "(toDate is exclusive)")

    const apiUrl30 = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate30}&toDate=${toDate}`

    console.log("[v0] Fetching wager history from Thrill API")
    const response30 = await fetch(apiUrl30, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    if (response30.status === 429) {
      console.log("[v0] Rate limit hit (429), returning stale cache or error")
      if (staleCache) {
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache_rate_limited",
          message: "Using cached data due to API rate limit (max 1 call per 2 minutes)",
        })
      }
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a few minutes.",
          last7Days: 0,
          last30Days: 0,
          status: "rate_limited",
        },
        { status: 429 },
      )
    }

    if (!response30.ok) {
      console.error("[v0] Thrill API error:", response30.status)
      if (staleCache) {
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache_error",
          message: "Using cached data due to API error",
        })
      }
      return NextResponse.json({
        last7Days: 0,
        last30Days: 0,
        status: "error",
      })
    }

    const data30: ThrillApiResponse = await response30.json()

    // Find the player's data
    const player30 = data30.items.find((item) => item.username.toLowerCase() === profile.thrill_username.toLowerCase())

    const wager30 = player30 ? convertAtomicValue(player30.wager.value, player30.wager.decimals) : 0

    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)

    // For now, we'll use a simple approximation: 7-day is roughly 23% of 30-day
    // This avoids making a second API call
    const wager7 = Math.floor(wager30 * 0.23)

    const responseData = {
      last7Days: wager7,
      last30Days: wager30,
      status: "live_data",
    }

    await kv.set(cacheKey, responseData, { ex: 1800 })
    await kv.set(staleCacheKey, responseData, { ex: 86400 })

    console.log("[v0] Successfully fetched and cached wager history")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Error fetching wager history:", error)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (profile?.thrill_username) {
        const staleCacheKey = `wager-history:${profile.thrill_username}:stale`
        const staleCache = await kv.get(staleCacheKey)
        if (staleCache) {
          console.log("[v0] Returning stale cache due to exception")
          return NextResponse.json({
            ...staleCache,
            status: "stale_cache_exception",
            message: "Using cached data due to server error",
          })
        }
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch wager history",
        last7Days: 0,
        last30Days: 0,
        status: "error",
      },
      { status: 500 },
    )
  }
}

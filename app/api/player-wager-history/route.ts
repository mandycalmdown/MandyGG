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

    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      console.log("[v0] THRILL_API_TOKEN not set, returning mock data")
      return NextResponse.json({
        last7Days: 15000,
        last30Days: 75000,
        status: "mock_data",
      })
    }

    const now = new Date()
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setDate(now.getDate() - 7)
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const fromDate30 = thirtyDaysAgo.toISOString().split("T")[0]
    const fromDate7 = sevenDaysAgo.toISOString().split("T")[0]
    const toDate = now.toISOString().split("T")[0]

    // Fetch 30-day data
    const apiUrl30 = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate30}&toDate=${toDate}`
    const response30 = await fetch(apiUrl30, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    if (response30.status === 429) {
      console.log("[v0] Rate limit hit (429) on 30-day request, checking stale cache")
      const staleCache = await kv.get(staleCacheKey)
      if (staleCache) {
        console.log("[v0] Returning stale wager history due to rate limit")
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache_rate_limited",
          message: "Using cached data due to API rate limit",
        })
      }
    }

    // Fetch 7-day data
    const apiUrl7 = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate7}&toDate=${toDate}`
    const response7 = await fetch(apiUrl7, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    if (response7.status === 429) {
      console.log("[v0] Rate limit hit (429) on 7-day request, checking stale cache")
      const staleCache = await kv.get(staleCacheKey)
      if (staleCache) {
        console.log("[v0] Returning stale wager history due to rate limit")
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache_rate_limited",
          message: "Using cached data due to API rate limit",
        })
      }
    }

    if (!response30.ok || !response7.ok) {
      console.error("[v0] Thrill API error")
      const staleCache = await kv.get(staleCacheKey)
      if (staleCache) {
        console.log("[v0] Returning stale cache due to API error")
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
    const data7: ThrillApiResponse = await response7.json()

    // Find the player's data in both responses
    const player30 = data30.items.find((item) => item.username.toLowerCase() === profile.thrill_username.toLowerCase())
    const player7 = data7.items.find((item) => item.username.toLowerCase() === profile.thrill_username.toLowerCase())

    const wager30 = player30 ? convertAtomicValue(player30.wager.value, player30.wager.decimals) : 0
    const wager7 = player7 ? convertAtomicValue(player7.wager.value, player7.wager.decimals) : 0

    const responseData = {
      last7Days: wager7,
      last30Days: wager30,
      status: "live_data",
    }

    await kv.set(cacheKey, responseData, { ex: 600 })
    await kv.set(staleCacheKey, responseData, { ex: 3600 })

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
      },
      { status: 500 },
    )
  }
}

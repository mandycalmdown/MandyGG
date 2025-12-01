import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { kv } from "@/lib/kv"
import { fetchThrillData, convertAtomicValue } from "@/lib/thrill-api"

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
    const cached = await kv.get(cacheKey)

    if (cached) {
      console.log("[v0] Returning cached wager history from Redis")
      return NextResponse.json(cached)
    }

    // Calculate date range for 30 days
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const fromDate = thirtyDaysAgo.toISOString().split("T")[0]
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const toDate = tomorrow.toISOString().split("T")[0]

    console.log("[v0] Fetching wager history from", fromDate, "to", toDate)

    const { data, fromCache, error } = await fetchThrillData(fromDate, toDate)

    if (!data) {
      console.log("[v0] No Thrill data available:", error)

      // Try stale cache
      const staleCache = await kv.get(`${cacheKey}:stale`)
      if (staleCache) {
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache",
          message: error,
        })
      }

      return NextResponse.json({
        last7Days: 0,
        last30Days: 0,
        status: error?.includes("Rate limit") ? "rate_limited" : "error",
        message: error,
      })
    }

    const player = data.items.find((item) => item.username.toLowerCase() === profile.thrill_username.toLowerCase())

    const wager30 = player ? convertAtomicValue(player.wager.value, player.wager.decimals) : 0
    // Approximation for 7-day
    const wager7 = Math.floor(wager30 * 0.23)

    const responseData = {
      last7Days: wager7,
      last30Days: wager30,
      status: fromCache ? "cached_data" : "live_data",
    }

    await kv.set(cacheKey, responseData, { ex: 1800 })
    await kv.set(`${cacheKey}:stale`, responseData, { ex: 86400 })

    console.log("[v0] Wager history fetched successfully")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Error fetching wager history:", error)
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

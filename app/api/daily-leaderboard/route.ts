import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { fetchThrillData, convertAtomicValue, get24HourDateRange } from "@/lib/thrill-api"

export const dynamic = 'force-dynamic'

interface LeaderboardEntry {
  id: number
  username: string
  wager: number
  rank: number
}

function censorUsername(username: string): string {
  if (!username || username.length <= 2) return username
  const first = username[0]
  const last = username[username.length - 1]
  const middle = "*".repeat(Math.min(username.length - 2, 6))
  return `${first}${middle}${last}`
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get("force") === "true"
    const uncensored = searchParams.get("uncensored") === "true"

    const customFromDate = searchParams.get("fromDate")
    const customToDate = searchParams.get("toDate")

    let fromDate: string
    let toDate: string

    if (customFromDate && customToDate) {
      fromDate = customFromDate
      toDate = customToDate
      console.log("[v0] Daily Leaderboard: Using custom date range", fromDate, "to", toDate)
    } else {
      const dateRange = get24HourDateRange()
      fromDate = dateRange.fromDate
      toDate = dateRange.toDate
      console.log("[v0] Daily Leaderboard: Using 24hr date range", fromDate, "to", toDate)
    }

    const cacheKey = customFromDate ? `daily-lb:${fromDate}:${toDate}` : "daily-leaderboard:today"

    if (!forceRefresh) {
      // Check local cache first (short TTL of 2 minutes)
      const cached = await kv.get<{ leaderboard: LeaderboardEntry[]; timestamp: number }>(cacheKey)
      if (cached && Date.now() - cached.timestamp < 120000) {
        // 2 minutes
        console.log(
          "[v0] Daily Leaderboard: Returning local cache, age:",
          Math.floor((Date.now() - cached.timestamp) / 1000),
          "s",
        )
        return NextResponse.json({
          leaderboard: cached.leaderboard,
          fromCache: true,
          cacheAge: Math.floor((Date.now() - cached.timestamp) / 1000),
          dateRange: { fromDate, toDate },
          lastUpdated: cached.timestamp,
        })
      }
    }

    const { data, fromCache, error } = await fetchThrillData(fromDate, toDate, forceRefresh)

    if (error && !data) {
      // Return stale cache if available
      const staleCache = await kv.get<{ leaderboard: LeaderboardEntry[]; timestamp: number }>(`${cacheKey}:stale`)
      if (staleCache) {
        return NextResponse.json({
          leaderboard: staleCache.leaderboard,
          fromCache: true,
          stale: true,
          dateRange: { fromDate, toDate },
          lastUpdated: staleCache.timestamp,
          warning: error,
        })
      }
      return NextResponse.json({ error, leaderboard: [] }, { status: 503 })
    }

    if (!data || !data.items || data.items.length === 0) {
      return NextResponse.json({
        leaderboard: [],
        fromCache,
        dateRange: { fromDate, toDate },
        lastUpdated: Date.now(),
        message: "No wager data for this period yet",
      })
    }

    // Aggregate wagers by username
    const playerWagers: Record<string, number> = {}

    for (const item of data.items) {
      const wager = convertAtomicValue(item.wager.value, item.wager.decimals)
      const username = item.username.toLowerCase()
      playerWagers[username] = (playerWagers[username] || 0) + wager
    }

    // Sort by wager and create leaderboard
    const sortedPlayers = Object.entries(playerWagers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, customFromDate ? 100 : 20)

    const leaderboard: LeaderboardEntry[] = sortedPlayers.map(([username, wager], index) => ({
      id: index + 1,
      username: uncensored ? username : censorUsername(username),
      wager,
      rank: index + 1,
    }))

    const now = Date.now()

    const cacheData = { leaderboard, timestamp: now }
    await kv.set(cacheKey, cacheData, { ex: 120 }) // 2 minute cache
    await kv.set(`${cacheKey}:stale`, cacheData, { ex: 3600 }) // 1 hour stale backup

    return NextResponse.json({
      leaderboard,
      fromCache,
      dateRange: { fromDate, toDate },
      totalPlayers: Object.keys(playerWagers).length,
      lastUpdated: now,
    })
  } catch (error) {
    console.error("[v0] Daily Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch daily leaderboard", leaderboard: [] }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { fetchThrillData, convertAtomicValue, get24HourDateRange } from "@/lib/thrill-api"

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

    // Get 24-hour date range (midnight UTC to midnight UTC)
    const { fromDate, toDate } = get24HourDateRange()

    console.log("[v0] Daily Leaderboard: Fetching", fromDate, "to", toDate)

    const { data, fromCache, error } = await fetchThrillData(fromDate, toDate, forceRefresh)

    if (error && !data) {
      // Try to get cached data
      const cachedLeaderboard = await kv.get<LeaderboardEntry[]>("daily-leaderboard:cache")
      if (cachedLeaderboard) {
        return NextResponse.json({
          leaderboard: cachedLeaderboard,
          fromCache: true,
          dateRange: { fromDate, toDate },
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
        message: "No wager data for today yet",
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
      .slice(0, 20) // Top 20 for daily

    const leaderboard: LeaderboardEntry[] = sortedPlayers.map(([username, wager], index) => ({
      id: index + 1,
      username: uncensored ? username : censorUsername(username),
      wager,
      rank: index + 1,
    }))

    // Cache the leaderboard
    await kv.set("daily-leaderboard:cache", leaderboard, { ex: 300 }) // 5 min cache

    return NextResponse.json({
      leaderboard,
      fromCache,
      dateRange: { fromDate, toDate },
      totalPlayers: Object.keys(playerWagers).length,
    })
  } catch (error) {
    console.error("[v0] Daily Leaderboard error:", error)
    return NextResponse.json({ error: "Failed to fetch daily leaderboard", leaderboard: [] }, { status: 500 })
  }
}

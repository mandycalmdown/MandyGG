import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { kv } from "@/lib/kv"

interface LeaderboardEntry {
  id: number
  username: string
  wager: number
  prize: number
  rank: number
  xp: number
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting player stats API request")

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] User not authenticated")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("thrill_username")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.thrill_username) {
      console.log("[v0] User has no Thrill username linked")
      return NextResponse.json(
        {
          error: "No Thrill username linked",
          message: "Please link your Thrill username in your profile settings",
        },
        { status: 404 },
      )
    }

    const thrillUsername = profile.thrill_username
    console.log("[v0] Looking up stats for Thrill username:", thrillUsername)

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current"

    const uncensoredCacheKey = `leaderboard:${period}:uncensored`
    let uncensoredData = await kv.get<LeaderboardEntry[]>(uncensoredCacheKey)

    if (!uncensoredData) {
      console.log("[v0] No cached data, fetching fresh leaderboard data")

      try {
        // Trigger the leaderboard API to fetch and cache data
        const leaderboardUrl = new URL("/api/leaderboard", request.url)
        leaderboardUrl.searchParams.set("period", period)

        const leaderboardResponse = await fetch(leaderboardUrl.toString())

        if (leaderboardResponse.ok) {
          console.log("[v0] Leaderboard data fetched successfully")
          // Try to get the cached data again
          uncensoredData = await kv.get<LeaderboardEntry[]>(uncensoredCacheKey)
        }
      } catch (fetchError) {
        console.error("[v0] Error fetching leaderboard data:", fetchError)
      }

      // If still no data after fetch attempt, return 503
      if (!uncensoredData) {
        console.log("[v0] No leaderboard data available after fetch attempt")
        return NextResponse.json(
          {
            error: "Leaderboard data not available",
            message: "Unable to fetch leaderboard data. Please try again in a moment.",
          },
          { status: 503 },
        )
      }
    }

    const playerStats = uncensoredData.find((entry) => entry.username.toLowerCase() === thrillUsername.toLowerCase())

    if (!playerStats) {
      console.log("[v0] Player not found in leaderboard")
      return NextResponse.json(
        {
          error: "Player not found",
          message: "You are not currently on the leaderboard for this period",
          thrillUsername,
        },
        { status: 404 },
      )
    }

    console.log("[v0] Found player stats:", playerStats)

    return NextResponse.json({
      stats: playerStats,
      period,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Player stats API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

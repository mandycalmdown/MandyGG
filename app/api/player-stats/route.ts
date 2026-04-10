import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { kv } from "@/lib/kv"

export const dynamic = 'force-dynamic'

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
      console.log("[v0] No cached leaderboard data, triggering fetch")

      try {
        const baseUrl = request.headers.get("host") || "localhost:3000"
        const protocol = baseUrl.includes("localhost") ? "http" : "https"
        const leaderboardUrl = `${protocol}://${baseUrl}/api/leaderboard?period=${period}`

        console.log("[v0] Fetching leaderboard from:", leaderboardUrl)

        const leaderboardResponse = await fetch(leaderboardUrl, {
          headers: {
            // Pass through cookies for auth if needed
            cookie: request.headers.get("cookie") || "",
          },
        })

        if (leaderboardResponse.ok) {
          console.log("[v0] Leaderboard data fetched successfully")
          // Wait a moment for cache to be set
          await new Promise((resolve) => setTimeout(resolve, 500))
          uncensoredData = await kv.get<LeaderboardEntry[]>(uncensoredCacheKey)
        } else {
          console.log("[v0] Leaderboard fetch failed:", leaderboardResponse.status)
        }
      } catch (fetchError) {
        console.error("[v0] Error fetching leaderboard data:", fetchError)
      }

      if (!uncensoredData) {
        console.log("[v0] No leaderboard data available after fetch attempt")
        return NextResponse.json(
          {
            error: "Leaderboard data not available",
            message: "Data is being refreshed. Please try again in a moment.",
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

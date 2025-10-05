import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - Fetch qualified players for the next poker night
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the next poker night date (first Sunday of next month at 6 PM CST)
    const now = new Date()
    const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))

    const currentMonth = centralTime.getMonth()
    const currentYear = centralTime.getFullYear()

    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1)
    const firstSundayOfCurrentMonth = new Date(firstDayOfCurrentMonth)
    while (firstSundayOfCurrentMonth.getDay() !== 0) {
      firstSundayOfCurrentMonth.setDate(firstSundayOfCurrentMonth.getDate() + 1)
    }
    firstSundayOfCurrentMonth.setHours(18, 0, 0, 0)

    let nextMonth = currentMonth + 1
    let nextYear = currentYear
    if (nextMonth > 11) {
      nextMonth = 0
      nextYear++
    }

    const firstDayOfNextMonth = new Date(nextYear, nextMonth, 1)
    const firstSundayOfNextMonth = new Date(firstDayOfNextMonth)
    while (firstSundayOfNextMonth.getDay() !== 0) {
      firstSundayOfNextMonth.setDate(firstSundayOfNextMonth.getDate() + 1)
    }
    firstSundayOfNextMonth.setHours(18, 0, 0, 0)

    const targetPokerNight =
      centralTime < firstSundayOfCurrentMonth ? firstSundayOfCurrentMonth : firstSundayOfNextMonth

    // Fetch qualified players for this poker night
    const { data: qualifiers, error } = await supabase
      .from("poker_qualifiers")
      .select("*")
      .eq("poker_night_date", targetPokerNight.toISOString())
      .order("monthly_wager", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching poker qualifiers:", error)
      return NextResponse.json({ error: "Failed to fetch qualifiers" }, { status: 500 })
    }

    return NextResponse.json({
      qualifiers: qualifiers || [],
      pokerNightDate: targetPokerNight.toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in poker qualifiers API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Capture qualified players at deadline (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (you can add admin check logic here)
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // For now, we'll allow any authenticated user to trigger this
    // In production, you should add proper admin verification

    const body = await request.json()
    const { adminKey } = body

    // Verify admin key
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 403 })
    }

    // Get all users with their monthly wager
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .not("thrill_username", "is", null)

    if (profilesError) {
      console.error("[v0] Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Calculate the poker night date
    const now = new Date()
    const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))

    const currentMonth = centralTime.getMonth()
    const currentYear = centralTime.getFullYear()

    const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1)
    const firstSundayOfCurrentMonth = new Date(firstDayOfCurrentMonth)
    while (firstSundayOfCurrentMonth.getDay() !== 0) {
      firstSundayOfCurrentMonth.setDate(firstSundayOfCurrentMonth.getDate() + 1)
    }
    firstSundayOfCurrentMonth.setHours(18, 0, 0, 0)

    const pokerNightDate = firstSundayOfCurrentMonth

    // Fetch wager data for each user and filter qualified players
    const qualifiedPlayers = []
    const POKER_REQUIREMENT = 50000

    for (const profile of profiles || []) {
      try {
        // Fetch monthly wager from the API
        const wagerResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/player-wager-history`,
          {
            headers: {
              Cookie: request.headers.get("cookie") || "",
            },
          },
        )

        if (wagerResponse.ok) {
          const wagerData = await wagerResponse.json()
          const monthlyWager = wagerData.last30Days || 0

          if (monthlyWager >= POKER_REQUIREMENT) {
            qualifiedPlayers.push({
              user_id: profile.id,
              thrill_username: profile.thrill_username,
              display_name: profile.display_name,
              monthly_wager: monthlyWager,
              qualification_date: new Date().toISOString(),
              poker_night_date: pokerNightDate.toISOString(),
            })
          }
        }
      } catch (error) {
        console.error(`[v0] Error fetching wager for ${profile.thrill_username}:`, error)
      }
    }

    // Insert qualified players into the database
    if (qualifiedPlayers.length > 0) {
      const { error: insertError } = await supabase.from("poker_qualifiers").upsert(qualifiedPlayers, {
        onConflict: "user_id,poker_night_date",
      })

      if (insertError) {
        console.error("[v0] Error inserting qualified players:", insertError)
        return NextResponse.json({ error: "Failed to save qualified players" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      count: qualifiedPlayers.length,
      qualifiers: qualifiedPlayers,
    })
  } catch (error) {
    console.error("[v0] Error capturing poker qualifiers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

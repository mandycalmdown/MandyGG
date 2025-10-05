import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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

function calculateNextPokerNight(): Date {
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

  const targetPokerNight = centralTime < firstSundayOfCurrentMonth ? firstSundayOfCurrentMonth : firstSundayOfNextMonth

  return targetPokerNight
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const targetPokerNight = calculateNextPokerNight()
    const POKER_REQUIREMENT = 50000

    // Fetch from Thrill API to get ALL qualified players
    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      console.error("[v0] THRILL_API_TOKEN not set")
      return NextResponse.json({ error: "Thrill API token not configured" }, { status: 500 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString().split("T")[0]
    const toDate = now.toISOString().split("T")[0]

    const apiUrl = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate}&toDate=${toDate}`
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    if (!response.ok) {
      console.error("[v0] Thrill API error:", response.status)
      return NextResponse.json({ error: "Failed to fetch data from Thrill API" }, { status: 500 })
    }

    const data: ThrillApiResponse = await response.json()

    // Get profiles to match display names
    const adminClient = createAdminClient()
    const { data: profiles } = await adminClient.from("profiles").select("*")

    // Filter qualified players from Thrill API
    const qualifiedPlayers = data.items
      .map((item) => {
        const monthlyWager = convertAtomicValue(item.wager.value, item.wager.decimals)
        if (monthlyWager >= POKER_REQUIREMENT) {
          const profile = profiles?.find((p) => p.thrill_username?.toLowerCase() === item.username.toLowerCase())
          return {
            id: profile?.id || item.username,
            user_id: profile?.id || null,
            thrill_username: item.username,
            display_name: profile?.display_name || null,
            monthly_wager: monthlyWager,
            qualification_date: new Date().toISOString(),
            poker_night_date: targetPokerNight.toISOString(),
            created_at: new Date().toISOString(),
          }
        }
        return null
      })
      .filter((p) => p !== null)

    console.log("[v0] Found", qualifiedPlayers.length, "qualified players from Thrill API")

    return NextResponse.json({
      qualifiers: qualifiedPlayers,
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

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { adminKey } = body

    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 403 })
    }

    const adminClient = createAdminClient()
    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("*")
      .not("thrill_username", "is", null)

    if (profilesError) {
      console.error("[v0] Error fetching profiles:", profilesError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    console.log("[v0] Found profiles with Thrill usernames:", profiles?.length || 0)

    const pokerNightDate = calculateNextPokerNight()
    console.log("[v0] Capturing qualifiers for poker night:", pokerNightDate.toISOString())

    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      console.error("[v0] THRILL_API_TOKEN not set")
      return NextResponse.json({ error: "Thrill API token not configured" }, { status: 500 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)
    const fromDate = thirtyDaysAgo.toISOString().split("T")[0]
    const toDate = now.toISOString().split("T")[0]

    console.log("[v0] Fetching wager data from Thrill API for date range:", fromDate, "to", toDate)

    const apiUrl = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate}&toDate=${toDate}`
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    if (!response.ok) {
      console.error("[v0] Thrill API error:", response.status)
      return NextResponse.json({ error: "Failed to fetch wager data from Thrill API" }, { status: 500 })
    }

    const data: ThrillApiResponse = await response.json()
    console.log("[v0] Thrill API returned", data.items?.length || 0, "players")

    const qualifiedPlayers = []
    const POKER_REQUIREMENT = 50000

    for (const profile of profiles || []) {
      const thrillPlayer = data.items.find(
        (item) => item.username.toLowerCase() === profile.thrill_username.toLowerCase(),
      )

      if (thrillPlayer) {
        const monthlyWager = convertAtomicValue(thrillPlayer.wager.value, thrillPlayer.wager.decimals)
        console.log("[v0] Player", profile.thrill_username, "has wager:", monthlyWager)

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
    }

    console.log("[v0] Found", qualifiedPlayers.length, "qualified players")

    if (qualifiedPlayers.length > 0) {
      const { error: insertError } = await adminClient.from("poker_qualifiers").upsert(qualifiedPlayers, {
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
      pokerNightDate: pokerNightDate.toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error capturing poker qualifiers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

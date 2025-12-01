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

export interface ChristmasRaffleData {
  username: string
  wager: number
  raffleTickets: number
  status: string
}

// Christmas raffle period: December 1, 2025 00:00:00 UTC to December 26, 2025 00:00:00 UTC
const CHRISTMAS_FROM_DATE = "2025-12-01"
const CHRISTMAS_TO_DATE = "2025-12-26" // Exclusive, captures through end of Dec 25

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const requestedUsername = searchParams.get("username")

    let thrillUsername: string | null = null

    if (requestedUsername) {
      thrillUsername = requestedUsername
    } else {
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

      thrillUsername = profile.thrill_username
    }

    const userCacheKey = `christmas-raffle:${thrillUsername.toLowerCase()}`
    const cached = await kv.get<ChristmasRaffleData>(userCacheKey)

    if (cached) {
      console.log("[v0] Returning cached Christmas raffle data for", thrillUsername)
      return NextResponse.json(cached)
    }

    const { data: thrillData, fromCache, error } = await fetchThrillData(CHRISTMAS_FROM_DATE, CHRISTMAS_TO_DATE)

    if (!thrillData) {
      console.log("[v0] No Thrill data available:", error)
      return NextResponse.json({
        username: thrillUsername,
        wager: 0,
        raffleTickets: 0,
        status: error?.includes("Rate limit") ? "rate_limited" : "error",
        message: error,
      })
    }

    const player = thrillData.items.find((item) => item.username.toLowerCase() === thrillUsername!.toLowerCase())

    const wager = player ? convertAtomicValue(player.wager.value, player.wager.decimals) : 0
    const raffleTickets = Math.floor(wager / 1000)

    const responseData: ChristmasRaffleData = {
      username: thrillUsername,
      wager,
      raffleTickets,
      status: fromCache ? "cached_data" : "live_data",
    }

    // Cache user-specific data for 30 minutes
    await kv.set(userCacheKey, responseData, { ex: 1800 })

    console.log("[v0] Christmas raffle data:", responseData)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Error fetching Christmas raffle data:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch raffle data",
        wager: 0,
        raffleTickets: 0,
        status: "error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cacheKey = "christmas-raffle:all"
    const cached = await kv.get<ChristmasRaffleData[]>(cacheKey)

    if (cached) {
      console.log("[v0] Returning cached all Christmas raffle data")
      return NextResponse.json({ players: cached })
    }

    const { data: thrillData, error } = await fetchThrillData(CHRISTMAS_FROM_DATE, CHRISTMAS_TO_DATE)

    if (!thrillData) {
      console.log("[v0] No Thrill data available:", error)
      return NextResponse.json({ players: [], status: "error", message: error })
    }

    const players: ChristmasRaffleData[] = thrillData.items
      .map((item) => {
        const wager = convertAtomicValue(item.wager.value, item.wager.decimals)
        return {
          username: item.username,
          wager,
          raffleTickets: Math.floor(wager / 1000),
          status: "live_data",
        }
      })
      .filter((p) => p.raffleTickets > 0)
      .sort((a, b) => b.raffleTickets - a.raffleTickets)

    await kv.set(cacheKey, players, { ex: 1800 })

    return NextResponse.json({ players })
  } catch (error) {
    console.error("[v0] Error fetching all Christmas raffle data:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch raffle data",
        players: [],
      },
      { status: 500 },
    )
  }
}

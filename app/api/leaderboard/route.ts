import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"
import { fetchThrillData, convertAtomicValue } from "@/lib/thrill-api"

export const dynamic = 'force-dynamic'

// Updated:hi me again

interface LeaderboardEntry {
  id: number
  username: string
  wager: number
  prize: number
  rank: number
  xp: number
}

// Prize structure based on rank
function getPrizeForRank(rank: number): number {
  const prizeMap: { [key: number]: number } = {
    1: 1200,
    2: 900,
    3: 600,
    4: 300,
    5: 200,
    6: 120,
    7: 80,
    8: 50,
    9: 30,
    10: 20,
  }
  return prizeMap[rank] || 0
}

// The Thrill API uses UTC and toDate is EXCLUSIVE
// Contest runs Thursday 10am CST to Thursday 10am CST
// We adjust dates to compensate for timezone difference
function getThursdayRaceStart(): Date {
  // Get current time in Central Time (handles DST automatically)
  const now = new Date()
  const centralTimeString = now.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  const [datePart, timePart] = centralTimeString.split(", ")
  const [month, day, year] = datePart.split("/")
  const [hour, minute, second] = timePart.split(":")

  const centralTime = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day),
    Number.parseInt(hour),
    Number.parseInt(minute),
    Number.parseInt(second),
  )

  console.log("[v0] Current Central Time:", centralTime.toISOString())

  const currentDay = centralTime.getDay()
  const currentHour = centralTime.getHours()

  console.log("[v0] Current day of week:", currentDay, "Current hour:", currentHour)

  let daysToSubtract: number

  if (currentDay >= 5) {
    daysToSubtract = currentDay - 5
    console.log("[v0] Fri–Sat: subtract", daysToSubtract)
  } else {
    daysToSubtract = currentDay + 2
    console.log("[v0] Sun–Thu: subtract", daysToSubtract)
  }

  const thursdayStart = new Date(centralTime)
  thursdayStart.setDate(centralTime.getDate() - daysToSubtract)
  thursdayStart.setHours(0, 0, 0, 0)

  console.log("[v0] Calculated Friday start:", thursdayStart.toString())
  return thursdayStart
}

function getNextThursdayRaceEnd(thursdayStart: Date): Date {
  const nextThursdayEnd = new Date(thursdayStart)
  nextThursdayEnd.setDate(thursdayStart.getDate() + 7)
  nextThursdayEnd.setHours(0, 0, 0, 0)

  console.log("[v0] Calculated next Friday end:", nextThursdayEnd.toString())
  return nextThursdayEnd
}

function censorUsername(username: string): string {
  if (!username || username.length <= 2) return username
  const first = username[0]
  const last = username[username.length - 1]
  const middle = "*".repeat(Math.max(1, username.length - 2))
  return `${first}${middle}${last}`
}

function getMockEntries(): LeaderboardEntry[] {
  return [
    { id: 1, username: censorUsername("cryptoking"), wager: 125000, xp: 15000, prize: 1200, rank: 1 },
    { id: 2, username: censorUsername("slotmaster"), wager: 98000, xp: 12500, prize: 900, rank: 2 },
    { id: 3, username: censorUsername("pokerpro"), wager: 87000, xp: 11200, prize: 600, rank: 3 },
    { id: 4, username: censorUsername("roulettequeen"), wager: 76000, xp: 9800, prize: 300, rank: 4 },
    { id: 5, username: censorUsername("blackjackboss"), wager: 65000, xp: 8500, prize: 200, rank: 5 },
    { id: 6, username: censorUsername("diceplayer"), wager: 54000, xp: 7200, prize: 120, rank: 6 },
    { id: 7, username: censorUsername("cardshark"), wager: 43000, xp: 6100, prize: 80, rank: 7 },
    { id: 8, username: censorUsername("spinmaster"), wager: 32000, xp: 5000, prize: 50, rank: 8 },
    { id: 9, username: censorUsername("betking"), wager: 21000, xp: 3900, prize: 30, rank: 9 },
    { id: 10, username: censorUsername("gambler"), wager: 10000, xp: 2800, prize: 20, rank: 10 },
  ]
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting leaderboard API request")
    console.log("[v0] Current server time (UTC):", new Date().toISOString())
    console.log("[v0] Current Central time:", new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }))

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current"
    const forceRefresh = searchParams.get("refresh") === "true"

    const cacheKey = `leaderboard:${period}`

    if (!forceRefresh) {
      const cached = await kv.get(cacheKey)
      if (cached) {
        console.log(`[v0] Returning cached ${period} leaderboard data from Redis`)
        return NextResponse.json(cached)
      }
    } else {
      console.log("[v0] Force refresh requested, bypassing cache")
    }

    const currentThursdayStart = getThursdayRaceStart()
    const currentThursdayEnd = getNextThursdayRaceEnd(currentThursdayStart)

    let fromDate: string
    let toDate: string

    if (period === "past") {
      const pastThursdayStart = new Date(currentThursdayStart)
      pastThursdayStart.setDate(currentThursdayStart.getDate() - 7)
      const pastThursdayEnd = new Date(currentThursdayEnd)
      pastThursdayEnd.setDate(currentThursdayEnd.getDate() - 7)

      fromDate = pastThursdayStart.toISOString().split("T")[0]
      const adjustedPastEnd = new Date(pastThursdayEnd)
      adjustedPastEnd.setDate(pastThursdayEnd.getDate() + 1)
      toDate = adjustedPastEnd.toISOString().split("T")[0]

      console.log("[v0] ===== PAST WEEK PERIOD =====")
      console.log("[v0] API fromDate:", fromDate, "toDate:", toDate)
    } else {
      fromDate = currentThursdayStart.toISOString().split("T")[0]
      const adjustedCurrentEnd = new Date(currentThursdayEnd)
      adjustedCurrentEnd.setDate(currentThursdayEnd.getDate() + 1)
      toDate = adjustedCurrentEnd.toISOString().split("T")[0]

      console.log("[v0] ===== CURRENT WEEK PERIOD =====")
      console.log("[v0] API fromDate:", fromDate, "toDate:", toDate)
    }

    const { data, fromCache, error } = await fetchThrillData(fromDate, toDate, forceRefresh)

    if (!data || !data.items || data.items.length === 0) {
      console.log("[v0] No data from Thrill API, using mock data. Error:", error)
      const mockResponse = {
        entries: getMockEntries(),
        totalCount: 10,
        lastUpdated: new Date().toISOString(),
        status: error ? "error_mock_data" : "mock_data_no_results",
        message: error || "No data available",
        period,
      }
      await kv.set(cacheKey, mockResponse, { ex: 300 })
      return NextResponse.json(mockResponse)
    }

    const uncensoredCacheKey = `leaderboard:${period}:uncensored`
    const uncensoredEntries = data.items
      .map((item, index) => {
        const wager = convertAtomicValue(item.wager.value, item.wager.decimals)
        const xp = convertAtomicValue(item.xp.value, item.xp.decimals)

        return {
          id: index + 1,
          username: item.username,
          wager,
          xp,
          prize: 0,
          rank: 0,
        }
      })
      .sort((a, b) => {
        if (b.wager !== a.wager) {
          return b.wager - a.wager
        }
        return b.xp - a.xp
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
        prize: getPrizeForRank(index + 1),
      }))

    await kv.set(uncensoredCacheKey, uncensoredEntries, { ex: 600 })

    const transformedEntries: LeaderboardEntry[] = uncensoredEntries
      .map((entry) => ({
        ...entry,
        username: censorUsername(entry.username),
      }))
      .slice(0, 10)

    console.log("[v0] Transformed entries:", transformedEntries.length)

    const responseData = {
      entries: transformedEntries,
      totalCount: data.totalCount,
      lastUpdated: new Date().toISOString(),
      status: fromCache ? "cached_data" : "live_data",
      period,
      raceStart: fromDate,
      raceEnd: toDate,
    }

    await kv.set(cacheKey, responseData, { ex: 600 })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] API Error:", error)

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current"

    return NextResponse.json({
      entries: getMockEntries(),
      totalCount: 10,
      lastUpdated: new Date().toISOString(),
      status: "mock_data_error",
      error: error instanceof Error ? error.message : "Unknown error",
      period,
    })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"

// Updated:hi

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
    }>
  isLastBatch: boolean
  totalCount: number
}

interface LeaderboardEntry {
  id: number
  username: string
  wager: number
  prize: number
  rank: number
  xp: number
}

// Convert atomic units to readable numbers
function convertAtomicValue(value: string, decimals: number): number {
  try {
    if (!value || value === "0") return 0
    const bigIntValue = BigInt(value)
    const divisor = BigInt(10 ** decimals)
    const result = Number(bigIntValue) / Number(divisor)
    return Math.floor(result) // Round down to avoid decimals
  } catch (error) {
    console.error("[v0] Error converting atomic value:", value, decimals, error)
    return 0
  }
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

  if (currentDay === 4 && currentHour >= 10) {
    daysToSubtract = 0
    console.log("[v0] Thursday after 10am - current race period")
  } else if (currentDay === 4 && currentHour < 10) {
    daysToSubtract = 7
    console.log("[v0] Thursday before 10am - last week's race period")
  } else if (currentDay > 4) {
    daysToSubtract = currentDay - 4
    console.log("[v0] Friday/Saturday - going back", daysToSubtract, "days")
  } else {
    daysToSubtract = currentDay + 3
    console.log("[v0] Sunday-Wednesday - going back", daysToSubtract, "days")
  }

  const thursdayStart = new Date(centralTime)
  thursdayStart.setDate(centralTime.getDate() - daysToSubtract)
  thursdayStart.setHours(18, 0, 0, 0)

  console.log("[v0] Calculated Thursday race start (Central):", thursdayStart.toString())
  console.log("[v0] Race start date:", thursdayStart.toLocaleDateString("en-US", { timeZone: "America/Chicago" }))

  return thursdayStart
}

function getNextThursdayRaceEnd(thursdayStart: Date): Date {
  const nextThursdayEnd = new Date(thursdayStart)
  nextThursdayEnd.setDate(thursdayStart.getDate() + 7)
  nextThursdayEnd.setHours(18, 0, 0, 0)

  console.log("[v0] Calculated Thursday race end (Central):", nextThursdayEnd.toString())

  return nextThursdayEnd
}

function censorUsername(username: string): string {
  if (!username || username.length <= 2) return username
  const first = username[0]
  const last = username[username.length - 1]
  const middle = "*".repeat(Math.max(1, username.length - 2))
  return `${first}${middle}${last}`
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Starting leaderboard API request")
    console.log("[v0] Current server time (UTC):", new Date().toISOString())
    console.log("[v0] Current Central time:", new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }))

    // TODO: Replace THRILL_API_TOKEN cookie every 30 days
    // Last updated: ~2 weeks ago (mid-October 2025)
    // Next update due: ~mid-November 2025
    // Cookie expires after 30 days per Thrill API documentation

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current"
    const forceRefresh = searchParams.get("refresh") === "true"

    const cacheKey = `leaderboard:${period}`
    const staleCacheKey = `${cacheKey}:stale`

    if (!forceRefresh) {
      const cached = await kv.get(cacheKey)
      if (cached) {
        console.log(`[v0] Returning cached ${period} leaderboard data from Redis`)
        return NextResponse.json(cached)
      }
    } else {
      console.log("[v0] Force refresh requested, bypassing cache")
    }

    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      console.log("[v0] THRILL_API_TOKEN environment variable not set, returning mock data")
      const mockEntries: LeaderboardEntry[] = [
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
      ].slice(0, 10)

      const mockResponse = {
        entries: mockEntries,
        totalCount: mockEntries.length,
        lastUpdated: new Date().toISOString(),
        status: "mock_data_no_token",
        message: "Using mock data - THRILL_API_TOKEN not configured",
        period,
      }

      await kv.set(cacheKey, mockResponse, { ex: 600 })

      return NextResponse.json(mockResponse)
    }

    console.log("[v0] Token found, length:", token.length)

    const currentThursdayStart = getThursdayRaceStart() + 1
    const currentThursdayEnd = getNextThursdayRaceEnd(currentThursdayStart) + 1

    let fromDate: string
    let toDate: string

    if (period === "past") {
      const pastThursdayStart = new Date(currentThursdayStart)
      pastThursdayStart.setDate(currentThursdayStart.getDate() - 6)
      const pastThursdayEnd = new Date(currentThursdayEnd)
      pastThursdayEnd.setDate(currentThursdayEnd.getDate() - 6)

      // Thrill API uses UTC and toDate is EXCLUSIVE
      // Contest: Oct 16 10am CST to Oct 23 10am CST
      // Oct 16 10am CST = Oct 16 15:00 UTC (CDT) or 16:00 UTC (CST)
      // We send Oct 16 as fromDate (includes from 00:00 UTC = 7pm previous day CST)
      // We send Oct 24 as toDate (exclusive, so includes up to Oct 23 23:59:59 UTC = 6:59pm CST)
      // This is slightly imperfect but ensures we don't miss wagers
      fromDate = pastThursdayStart.toISOString().split("T")[0]
      const adjustedPastEnd = new Date(pastThursdayEnd)
      adjustedPastEnd.setDate(pastThursdayEnd.getDate() + 1) // Add 1 day since toDate is exclusive
      toDate = adjustedPastEnd.toISOString().split("T")[0]

      console.log("[v0] ===== PAST WEEK PERIOD =====")
      console.log("[v0] Past week start (Central):", pastThursdayStart.toString())
      console.log("[v0] Past week end (Central):", pastThursdayEnd.toString())
      console.log("[v0] API fromDate:", fromDate, "(inclusive, UTC midnight)")
      console.log("[v0] API toDate:", toDate, "(exclusive, UTC midnight)")
      console.log("[v0] Expected: Oct 16 10am - Oct 23 10am CST")
      console.log("[v0] Note: Thrill API uses UTC, toDate is EXCLUSIVE")
    } else {
      // Contest: Oct 23 10am CST to Oct 30 10am CST
      // We send Oct 23 as fromDate and Oct 31 as toDate (exclusive)
      fromDate = currentThursdayStart.toISOString().split("T")[0]
      const adjustedCurrentEnd = new Date(currentThursdayEnd)
      adjustedCurrentEnd.setDate(currentThursdayEnd.getDate() + 1) // Add 1 day since toDate is exclusive
      toDate = adjustedCurrentEnd.toISOString().split("T")[0]

      console.log("[v0] ===== CURRENT WEEK PERIOD =====")
      console.log("[v0] Current week start (Central):", currentThursdayStart.toString())
      console.log("[v0] Current week end (Central):", currentThursdayEnd.toString())
      console.log("[v0] API fromDate:", fromDate, "(inclusive, UTC midnight)")
      console.log("[v0] API toDate:", toDate, "(exclusive, UTC midnight)")
      console.log("[v0] Expected: Oct 23 10am - Oct 30 10am CST")
      console.log("[v0] Note: Thrill API uses UTC, toDate is EXCLUSIVE")
    }

    const apiUrl = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate}&toDate=${toDate}`

    console.log("[v0] Calling Thrill API with URL:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    console.log("[v0] Thrill API response status:", response.status)

    if (response.status === 429) {
      console.log("[v0] Rate limit hit (429), checking for stale cache")
      const staleCache = await kv.get(staleCacheKey)

      if (staleCache) {
        console.log("[v0] Returning stale cached data due to rate limit")
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache_rate_limited",
          message: "Using cached data due to API rate limit (max 1 call per 2 minutes)",
        })
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Thrill API error response:", errorText)

      const staleCache = await kv.get(staleCacheKey)
      if (staleCache) {
        console.log("[v0] Returning stale cache due to API error")
        return NextResponse.json({
          ...staleCache,
          status: "stale_cache_error",
          message: `Using cached data due to API error: ${response.status}`,
        })
      }

      console.log("[v0] API failed, returning mock data")
      const mockEntries: LeaderboardEntry[] = [
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
      ].slice(0, 10)

      const errorResponse = {
        entries: mockEntries,
        totalCount: mockEntries.length,
        lastUpdated: new Date().toISOString(),
        status: "mock_data",
        error: `API Error: ${response.status} - ${errorText}`,
        period,
      }

      await kv.set(staleCacheKey, errorResponse, { ex: 3600 })

      return NextResponse.json(errorResponse)
    }

    const data: ThrillApiResponse = await response.json()
    console.log("[v0] Thrill API response data:", JSON.stringify(data, null, 2))

    if (!data.items || data.items.length === 0) {
      console.log("[v0] No data returned from API, using mock data")
      const mockEntries: LeaderboardEntry[] = [
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
      ].slice(0, 10)

      const noResultsResponse = {
        entries: mockEntries,
        totalCount: mockEntries.length,
        lastUpdated: new Date().toISOString(),
        status: "mock_data_no_results",
        period,
      }

      await kv.set(cacheKey, noResultsResponse, { ex: 600 })

      return NextResponse.json(noResultsResponse)
    }

    const uncensoredCacheKey = `leaderboard:${period}:uncensored`
    const uncensoredEntries = data.items
      .map((item, index) => {
        const wager = convertAtomicValue(item.wager.value, item.wager.decimals)
        const xp = convertAtomicValue(item.xp.value, item.xp.decimals)

        return {
          id: index + 1,
          username: item.username, // Keep uncensored for player stats
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

    // Transform the data with censored usernames for public leaderboard
    const transformedEntries: LeaderboardEntry[] = uncensoredEntries
      .map((entry) => ({
        ...entry,
        username: censorUsername(entry.username),
      }))
      .slice(0, 10)

    console.log("[v0] Transformed entries:", transformedEntries)

    const responseData = {
      entries: transformedEntries,
      totalCount: data.totalCount,
      lastUpdated: new Date().toISOString(),
      status: "live_data",
      period,
      raceStart: fromDate,
      raceEnd: toDate,
    }

    await kv.set(cacheKey, responseData, { ex: 600 })
    await kv.set(staleCacheKey, responseData, { ex: 3600 }) // Keep stale cache for 1 hour

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] API Error:", error)

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "current"
    const staleCacheKey = `leaderboard:${period}:stale`
    const staleCache = await kv.get(staleCacheKey)

    if (staleCache) {
      console.log("[v0] Returning stale cache due to exception")
      return NextResponse.json({
        ...staleCache,
        status: "stale_cache_exception",
        message: "Using cached data due to server error",
      })
    }

    const mockEntries: LeaderboardEntry[] = [
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
    ].slice(0, 10)

    return NextResponse.json({
      entries: mockEntries,
      totalCount: mockEntries.length,
      lastUpdated: new Date().toISOString(),
      status: "mock_data_error",
      error: error instanceof Error ? error.message : "Unknown error",
      period: "current",
    })
  }
}

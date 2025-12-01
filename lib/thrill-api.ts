import { kv } from "@/lib/kv"

// Thrill API rate limit: max 1 call per 2 minutes
const RATE_LIMIT_SECONDS = 120
const LOCK_KEY = "thrill-api:lock"
const LAST_CALL_KEY = "thrill-api:last-call"
const UNIFIED_CACHE_KEY = "thrill-api:unified-data"

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

interface CachedThrillData {
  data: ThrillApiResponse
  timestamp: number
  fromDate: string
  toDate: string
}

interface UnifiedPlayerData {
  username: string
  totalWager: number
  totalEarnings: number
  totalXP: number
  createdAt: string
  campaignName: string
}

interface UnifiedCache {
  players: Record<string, UnifiedPlayerData>
  lastUpdated: number
  dateRanges: Record<string, ThrillApiResponse>
}

async function getUnifiedCache(): Promise<UnifiedCache | null> {
  return await kv.get<UnifiedCache>(UNIFIED_CACHE_KEY)
}

async function updateUnifiedCache(fromDate: string, toDate: string, data: ThrillApiResponse): Promise<void> {
  let cache = await getUnifiedCache()

  if (!cache) {
    cache = {
      players: {},
      lastUpdated: Date.now(),
      dateRanges: {},
    }
  }

  // Store the raw response for this date range
  cache.dateRanges[`${fromDate}:${toDate}`] = data

  // Update player aggregates
  for (const item of data.items || []) {
    const wager = convertAtomicValue(item.wager.value, item.wager.decimals)
    const earnings = convertAtomicValue(item.earning.value, item.earning.decimals)
    const xp = convertAtomicValue(item.xp.value, item.xp.decimals)

    if (!cache.players[item.username]) {
      cache.players[item.username] = {
        username: item.username,
        totalWager: 0,
        totalEarnings: 0,
        totalXP: 0,
        createdAt: item.createdAt,
        campaignName: item.campaignName,
      }
    }

    // Update with latest data (don't accumulate, replace for the same date range)
    cache.players[item.username] = {
      ...cache.players[item.username],
      totalWager: wager,
      totalEarnings: earnings,
      totalXP: xp,
    }
  }

  cache.lastUpdated = Date.now()

  // Cache for 30 minutes
  await kv.set(UNIFIED_CACHE_KEY, cache, { ex: 1800 })
}

export async function getCachedDateRange(fromDate: string, toDate: string): Promise<ThrillApiResponse | null> {
  const cache = await getUnifiedCache()
  if (!cache) return null

  const key = `${fromDate}:${toDate}`
  return cache.dateRanges[key] || null
}

export async function getCachedPlayers(): Promise<Record<string, UnifiedPlayerData> | null> {
  const cache = await getUnifiedCache()
  return cache?.players || null
}

export async function fetchThrillData(
  fromDate: string,
  toDate: string,
  forceRefresh = false,
): Promise<{ data: ThrillApiResponse | null; fromCache: boolean; error?: string }> {
  const cacheKey = `thrill-api:data:${fromDate}:${toDate}`

  // Check unified cache first
  if (!forceRefresh) {
    const cachedRange = await getCachedDateRange(fromDate, toDate)
    if (cachedRange) {
      console.log("[v0] Thrill API: Returning unified cached data for", fromDate, "-", toDate)
      return { data: cachedRange, fromCache: true }
    }

    // Also check individual cache
    const cached = await kv.get<CachedThrillData>(cacheKey)
    if (cached) {
      console.log("[v0] Thrill API: Returning cached data for", fromDate, "-", toDate)
      return { data: cached.data, fromCache: true }
    }
  }

  // Check if we're rate limited (called within last 2 minutes)
  const lastCall = await kv.get<number>(LAST_CALL_KEY)
  const now = Date.now()

  if (lastCall && now - lastCall < RATE_LIMIT_SECONDS * 1000) {
    const waitTime = Math.ceil((RATE_LIMIT_SECONDS * 1000 - (now - lastCall)) / 1000)
    console.log("[v0] Thrill API: Rate limited, must wait", waitTime, "seconds")

    // Try to return any cached data for this date range
    const cached = await kv.get<CachedThrillData>(cacheKey)
    if (cached) {
      return { data: cached.data, fromCache: true }
    }

    // Try to find any recent cached data as fallback
    const staleCached = await kv.get<CachedThrillData>(`${cacheKey}:stale`)
    if (staleCached) {
      return { data: staleCached.data, fromCache: true }
    }

    return { data: null, fromCache: false, error: `Rate limited. Try again in ${waitTime} seconds.` }
  }

  // Try to acquire lock to prevent parallel calls
  const lockAcquired = await kv.set(LOCK_KEY, "locked", { ex: 30, nx: true })

  if (!lockAcquired) {
    console.log("[v0] Thrill API: Another request in progress, waiting for cache")
    // Another request is in progress, wait a bit and check cache
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const cached = await kv.get<CachedThrillData>(cacheKey)
    if (cached) {
      return { data: cached.data, fromCache: true }
    }

    return { data: null, fromCache: false, error: "Request in progress, please try again." }
  }

  try {
    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      console.log("[v0] Thrill API: No token configured")
      await kv.del(LOCK_KEY)
      return { data: null, fromCache: false, error: "THRILL_API_TOKEN not configured" }
    }

    const apiUrl = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate}&toDate=${toDate}`
    console.log("[v0] Thrill API: Calling", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    // Record this call time regardless of success/failure
    await kv.set(LAST_CALL_KEY, Date.now(), { ex: RATE_LIMIT_SECONDS })

    if (response.status === 429) {
      console.log("[v0] Thrill API: Rate limit hit (429)")
      await kv.del(LOCK_KEY)

      const staleCached = await kv.get<CachedThrillData>(`${cacheKey}:stale`)
      if (staleCached) {
        return { data: staleCached.data, fromCache: true }
      }

      return { data: null, fromCache: false, error: "Rate limit exceeded" }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Thrill API: Error", response.status, errorText)
      await kv.del(LOCK_KEY)

      const staleCached = await kv.get<CachedThrillData>(`${cacheKey}:stale`)
      if (staleCached) {
        return { data: staleCached.data, fromCache: true }
      }

      return { data: null, fromCache: false, error: `API Error: ${response.status}` }
    }

    const data: ThrillApiResponse = await response.json()
    console.log("[v0] Thrill API: Success, got", data.items?.length || 0, "items")

    // Cache the data
    const cacheData: CachedThrillData = {
      data,
      timestamp: Date.now(),
      fromDate,
      toDate,
    }

    // Cache for 10 minutes, stale cache for 24 hours
    await kv.set(cacheKey, cacheData, { ex: 600 })
    await kv.set(`${cacheKey}:stale`, cacheData, { ex: 86400 })

    await updateUnifiedCache(fromDate, toDate, data)

    await kv.del(LOCK_KEY)
    return { data, fromCache: false }
  } catch (error) {
    console.error("[v0] Thrill API: Exception", error)
    await kv.del(LOCK_KEY)

    const staleCached = await kv.get<CachedThrillData>(`${cacheKey}:stale`)
    if (staleCached) {
      return { data: staleCached.data, fromCache: true }
    }

    return { data: null, fromCache: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Helper to convert atomic values
export function convertAtomicValue(value: string, decimals: number): number {
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

export async function prefetchCommonRanges(): Promise<void> {
  const now = new Date()

  // Get current week range (Thursday to Thursday)
  const getCurrentWeekRange = () => {
    const today = new Date(now)
    const dayOfWeek = today.getUTCDay()
    const hourOfDay = today.getUTCHours()

    // Thursday is day 4, contest resets at 3pm UTC (10am CST)
    let daysToLastThursday = (dayOfWeek - 4 + 7) % 7
    if (dayOfWeek === 4 && hourOfDay < 15) {
      daysToLastThursday = 7
    }
    if (daysToLastThursday === 0 && hourOfDay >= 15) {
      daysToLastThursday = 0
    }

    const startDate = new Date(today)
    startDate.setUTCDate(today.getUTCDate() - daysToLastThursday)
    startDate.setUTCHours(15, 0, 0, 0)

    const endDate = new Date(now)
    endDate.setUTCDate(endDate.getUTCDate() + 1)

    return {
      fromDate: startDate.toISOString().split("T")[0],
      toDate: endDate.toISOString().split("T")[0],
    }
  }

  // Prefetch current week
  const { fromDate, toDate } = getCurrentWeekRange()
  await fetchThrillData(fromDate, toDate)
}

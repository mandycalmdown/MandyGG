"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { SiteNavigation } from "@/components/site-navigation"
import { isAdminSessionValid } from "@/lib/admin-session"
import { clearLeaderboardCacheAction } from "@/app/actions/admin-actions"

interface LeaderboardEntry {
  id: number
  username: string
  wager: number
  prize: number
  rank: number
  xp?: number
}

interface ApiResponse {
  entries: LeaderboardEntry[]
  totalCount: number
  lastUpdated: string
  period?: string
  status?: string
}

interface CachedData {
  data: LeaderboardEntry[]
  timestamp: number
}

const getPrizeAmount = (rank: number): number => {
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

const mockData: LeaderboardEntry[] = [
  { id: 1, username: "Y*****M", wager: 3000000, prize: 1200, rank: 1 },
  { id: 2, username: "N*********S", wager: 90000, prize: 900, rank: 2 },
  { id: 3, username: "S*****Y", wager: 30000, prize: 600, rank: 3 },
  { id: 4, username: "G*******3", wager: 25000, prize: 300, rank: 4 },
  { id: 5, username: "H*******R", wager: 20000, prize: 200, rank: 5 },
  { id: 6, username: "C*****G", wager: 15000, prize: 120, rank: 6 },
  { id: 7, username: "P*****O", wager: 12000, prize: 80, rank: 7 },
  { id: 8, username: "S*****R", wager: 10000, prize: 50, rank: 8 },
  { id: 9, username: "B*****S", wager: 8000, prize: 30, rank: 9 },
  { id: 10, username: "R*****N", wager: 6000, prize: 20, rank: 10 },
]

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(mockData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"current" | "past">("current")
  const currentDataCache = useRef<CachedData | null>(null)
  const pastDataCache = useRef<CachedData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [scrollY, setScrollY] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [dataStatus, setDataStatus] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    setIsAdmin(isAdminSessionValid())
  }, [])

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date()
      const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))

      const currentDay = centralTime.getDay() // 0 = Sunday, 4 = Thursday
      const daysUntilNextThursday = currentDay <= 4 ? 4 - currentDay : 11 - currentDay // Days until next Thursday

      const nextThursday = new Date(centralTime)
      nextThursday.setDate(centralTime.getDate() + daysUntilNextThursday)
      nextThursday.setHours(10, 0, 0, 0) // 10:00 AM

      // If it's Thursday and past 10 AM, target next Thursday
      if (currentDay === 4 && centralTime.getHours() >= 10) {
        nextThursday.setDate(nextThursday.getDate() + 7)
      }

      const timeDiff = nextThursday.getTime() - centralTime.getTime()

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

        setCountdown({ days, hours, minutes, seconds })
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const cache = activeTab === "current" ? currentDataCache.current : pastDataCache.current
        const now = Date.now()
        const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds

        if (cache && now - cache.timestamp < CACHE_DURATION) {
          console.log(`[v0] Using cached ${activeTab} data (${Math.round((now - cache.timestamp) / 1000)}s old)`)
          setEntries(cache.data)
          setIsLoading(false)
          setDataStatus("Cached Data")
          return
        }

        setIsLoading(true)
        setError(null)

        console.log(`[v0] Fetching ${activeTab} leaderboard data...`)
        const response = await fetch(`/api/leaderboard?period=${activeTab}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        console.log(`[v0] Received ${activeTab} leaderboard data:`, data)
        console.log(`[v0] Data status: ${data.status}`)
        console.log(`[v0] Last updated: ${data.lastUpdated}`)

        setDataStatus(data.status || "Unknown")
        setLastUpdated(data.lastUpdated || "")

        if (data.entries && data.entries.length > 0) {
          setEntries(data.entries)
          if (activeTab === "current") {
            currentDataCache.current = { data: data.entries, timestamp: now }
          } else {
            pastDataCache.current = { data: data.entries, timestamp: now }
          }
        } else {
          console.log("[v0] No entries received, using mock data")
          setEntries(mockData)
          setDataStatus("Mock Data - No Results")
        }
      } catch (err) {
        console.error("[v0] Error fetching leaderboard:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        setDataStatus("Error - Using Fallback")
        const cache = activeTab === "current" ? currentDataCache.current : pastDataCache.current
        if (cache) {
          console.log(`[v0] Using stale cached ${activeTab} data due to fetch error`)
          setEntries(cache.data)
        } else {
          setEntries(mockData)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboardData()

    const refreshInterval = setInterval(fetchLeaderboardData, 2 * 60 * 1000)
    return () => clearInterval(refreshInterval)
  }, [activeTab]) // Re-fetch when tab changes

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const topThree = entries.slice(0, 3)
  const remainingEntries = entries.slice(3)

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      console.log(`[v0] ========== MANUAL REFRESH STARTED ==========`)
      console.log(`[v0] Admin status: ${isAdmin}`)
      console.log(`[v0] Active tab: ${activeTab}`)

      if (isAdmin) {
        console.log("[v0] Admin refresh - clearing cache first")
        const result = await clearLeaderboardCacheAction()
        console.log("[v0] Cache clear result:", result)
        if (result.success) {
          console.log("[v0] Cache cleared successfully:", result.data)
        } else {
          console.error("[v0] Error clearing cache:", result.error)
        }
      }

      console.log(`[v0] Fetching fresh data with refresh=true parameter`)
      const response = await fetch(`/api/leaderboard?period=${activeTab}&refresh=true`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(`[v0] Refresh API response status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      console.log(`[v0] Received fresh ${activeTab} leaderboard data:`, data)
      console.log(`[v0] Data status: ${data.status}`)
      console.log(`[v0] Entry count: ${data.entries?.length || 0}`)
      console.log(`[v0] ========== MANUAL REFRESH COMPLETED ==========`)

      setDataStatus(data.status || "Unknown")
      setLastUpdated(data.lastUpdated || "")

      if (data.entries && data.entries.length > 0) {
        setEntries(data.entries)
        const now = Date.now()
        if (activeTab === "current") {
          currentDataCache.current = { data: data.entries, timestamp: now }
        } else {
          pastDataCache.current = { data: data.entries, timestamp: now }
        }
      }
    } catch (err) {
      console.error("[v0] Error during manual refresh:", err)
      setError(err instanceof Error ? err.message : "Failed to refresh data")
      setDataStatus("Refresh Failed")
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status.includes("live")) return "text-green-400"
    if (status.includes("mock") || status.includes("Mock")) return "text-yellow-400"
    if (status.includes("cache") || status.includes("Cached")) return "text-blue-400"
    if (status.includes("error") || status.includes("Error")) return "text-red-400"
    return "text-gray-400"
  }

  const getStatusLabel = (status: string) => {
    if (status === "live_data") return "Live Data"
    if (status === "mock_data_no_token") return "Mock Data (No API Token)"
    if (status === "mock_data") return "Mock Data (API Error)"
    if (status === "mock_data_no_results") return "Mock Data (No Results)"
    if (status === "stale_cache_rate_limited") return "Cached (Rate Limited)"
    if (status === "stale_cache_error") return "Cached (API Error)"
    if (status === "stale_cache_exception") return "Cached (Server Error)"
    if (status === "Cached Data") return "Cached Data"
    return status
  }

  return (
    <div className="min-h-screen bg-black font-sans">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 90% 90%, rgba(0, 255, 159, ${0.1 + scrollY * 0.0002}) 0%, transparent 40%),
            radial-gradient(circle at 30% 70%, rgba(0, 255, 159, ${0.08 + scrollY * 0.0001}) 0%, transparent 30%),
            radial-gradient(circle at 70% 30%, rgba(0, 255, 159, ${0.06 + scrollY * 0.0001}) 0%, transparent 35%)
          `,
          transition: "background 0.3s ease",
        }}
      />

      <div className="relative z-10">
        <SiteNavigation currentPage="leaderboard" />

        <section className="relative w-full mb-2">
          <div className="w-full max-w-6xl mx-auto relative px-2 md:px-0">
            {/* Desktop Banner */}
            <Image
              src="/images/thrill-mandy-banner-static-leaderboard.webp"
              alt="Thrill Mandy Leaderboard - $3500 Weekly Crypto Casino Competition"
              width={1200}
              height={300}
              className="hidden md:block w-full h-auto max-h-[40vh] lg:max-h-[50vh] object-contain"
              priority
            />

            {/* Mobile Banner */}
            <Image
              src="/images/mobile-static-leaderboard.webp"
              alt="Mobile Leaderboard - Weekly Crypto Casino Battle"
              width={400}
              height={400}
              className="md:hidden w-full h-auto max-w-sm mx-auto object-contain rounded-lg"
              priority
            />
          </div>
        </section>

        <div className="text-center mb-4 md:mb-6 lg:mb-8 px-4">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-indigo-400 mb-3 uppercase md:mb-[-20px]">
            THIS BATTLE ENDS IN
          </h3>
          <div className="flex justify-center gap-3 md:gap-6 lg:gap-8 py-[25px]">
            <div className="text-center">
              <div className="text-xs md:text-sm lg:text-base text-gray-400 uppercase font-bold mb-1">DAYS</div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono">
                {countdown.days.toString().padStart(2, "0")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm lg:text-base text-gray-400 uppercase font-bold mb-1">HOURS</div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono">
                {countdown.hours.toString().padStart(2, "0")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm lg:text-base text-gray-400 uppercase font-bold mb-1">MINUTES</div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono">
                {countdown.minutes.toString().padStart(2, "0")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs md:text-sm lg:text-base text-gray-400 uppercase font-bold mb-1">SECONDS</div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono">
                {countdown.seconds.toString().padStart(2, "0")}
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="flex bg-gray-800/50 rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setActiveTab("current")}
                className={`px-4 py-2 rounded-md font-bold uppercase text-sm transition-all duration-200 ${
                  activeTab === "current"
                    ? "bg-primary text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                Current Week
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-4 py-2 rounded-md font-bold uppercase text-sm transition-all duration-200 ${
                  activeTab === "past"
                    ? "bg-primary text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                Past Week
              </button>
            </div>
          </div>

          {isAdmin && dataStatus && (
            <div className="flex justify-center mb-2">
              <div className="px-3 py-1 bg-gray-900/80 border border-white/10 rounded-lg text-xs flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <span className={`font-bold ${getStatusColor(dataStatus)}`}>{getStatusLabel(dataStatus)}</span>
                {lastUpdated && (
                  <>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400">Updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="flex justify-center mb-4">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white rounded-lg font-bold uppercase text-sm transition-all duration-200 flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh Data
                  </>
                )}
              </button>
            </div>
          )}

          {!isAdmin && (
            <div className="flex justify-center mb-4">
              <div className="px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-xs md:text-sm text-gray-400 flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Leaderboard updates every 10 minutes</span>
              </div>
            </div>
          )}

          {isLoading && <p className="text-sm text-gray-400 mt-2">Loading {activeTab} leaderboard data...</p>}
          {error && <p className="text-sm text-red-400 mt-2">Using cached data - API temporarily unavailable</p>}
        </div>

        <div className="px-2 md:px-4">
          <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-3 md:gap-4 mb-6 md:mb-8 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <Card
              className={`p-3 md:p-4 text-center relative rounded-xl md:rounded-2xl border border-white/30 overflow-visible w-full max-w-xs transition-all duration-300 ${
                hoveredCard === 2 ? "transform scale-105" : ""
              }`}
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  hoveredCard === 2
                    ? "0 20px 40px rgba(20, 184, 166, 0.4), 0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(20, 184, 166, 0.2)"
                    : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
              onMouseEnter={() => setHoveredCard(2)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 z-30">
                <div className="hidden md:block">
                  <video autoPlay loop muted className="w-32 h-32 md:w-36 md:h-36" style={{ objectFit: "contain" }}>
                    <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/silver_mandy-QLwCilpDVX7yYn5lwHX2x55OPkDBZZ.webm" type="video/webm" />
                  </video>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center h-full pt-3 md:pt-4 pb-2">
                <h3 className="text-sm md:text-base lg:text-lg font-bold text-white mb-1">{topThree[1]?.username}</h3>
                <p className="text-lg md:text-xl lg:text-2xl font-bold mb-1 text-primary">
                  {formatCurrency(topThree[1]?.wager || 0)}
                </p>
                <p className="text-xs md:text-sm text-gray-300">PRIZE: {formatCurrency(topThree[1]?.prize || 0)}</p>
              </div>
            </Card>

            {/* 1st Place */}
            <Card
              className={`p-3 md:p-4 lg:p-6 text-center relative transform md:scale-110 rounded-xl md:rounded-2xl border border-white/30 overflow-visible w-full max-w-xs order-first md:order-none transition-all duration-300 ${
                hoveredCard === 1 ? "md:scale-125" : ""
              }`}
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  hoveredCard === 1
                    ? "0 20px 40px rgba(99, 102, 241, 0.4), 0 0 30px rgba(20, 184, 166, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)"
                    : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
              onMouseEnter={() => setHoveredCard(1)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 z-30">
                <div className="hidden md:block">
                  <video autoPlay loop muted className="w-32 h-32 md:w-40 md:h-40" style={{ objectFit: "contain" }}>
                    <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold_mandy-9pX50BDoGrYOwjdjBgvDsA81XNnbzS.webm" type="video/webm" />
                  </video>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center h-full pt-3 md:pt-6 pb-2">
                <h3 className="text-base md:text-lg lg:text-xl font-bold text-white mb-1">{topThree[0]?.username}</h3>
                <p className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-primary">
                  {formatCurrency(topThree[0]?.wager || 0)}
                </p>
                <p className="text-xs md:text-sm text-gray-300">PRIZE: {formatCurrency(topThree[0]?.prize || 0)}</p>
              </div>
            </Card>

            {/* 3rd Place */}
            <Card
              className={`p-3 md:p-4 text-center relative rounded-xl md:rounded-2xl border border-white/30 overflow-visible w-full max-w-xs transition-all duration-300 ${
                hoveredCard === 3 ? "transform scale-105" : ""
              }`}
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  hoveredCard === 3
                    ? "0 20px 40px rgba(20, 184, 166, 0.4), 0 0 30px rgba(99, 102, 241, 0.3), 0 0 60px rgba(20, 184, 166, 0.2)"
                    : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
              onMouseEnter={() => setHoveredCard(3)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="absolute -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 z-30">
                <div className="hidden md:block">
                  <video autoPlay loop muted className="w-32 h-32 md:w-36 md:h-36" style={{ objectFit: "contain" }}>
                    <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-ezgif.com-gif-to-webm-converter-RoLVPGw8RXwCgrEfDo86QZ9Kvc24J7.webm" type="video/webm" />
                  </video>
                </div>
              </div>
              <div className="flex flex-col justify-center items-center h-full pt-3 md:pt-4 pb-2">
                <h3 className="text-sm md:text-base lg:text-lg font-bold text-white mb-1">{topThree[2]?.username}</h3>
                <p className="text-lg md:text-xl lg:text-2xl font-bold mb-1 text-primary">
                  {formatCurrency(topThree[2]?.wager || 0)}
                </p>
                <p className="text-xs md:text-sm text-gray-300">PRIZE: {formatCurrency(topThree[2]?.prize || 0)}</p>
              </div>
            </Card>
          </div>

          <Card
            className="max-w-4xl mx-auto border border-white/30 overflow-hidden transition-all duration-300 hover:shadow-2xl rounded-xl md:rounded-2xl hover:scale-[1.01]"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div className="p-3 md:p-6">
              <div className="grid grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm font-bold text-gray-400 uppercase">
                <div>RANK</div>
                <div>USERNAME</div>
                <div>WAGER</div>
                <div>PRIZE</div>
              </div>

              {remainingEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="grid grid-cols-4 gap-2 md:gap-4 py-2 md:py-3 border-t border-white/10 text-white"
                >
                  <div className="font-bold text-sm md:text-base">{entry.rank}</div>
                  <div className="font-semibold text-sm md:text-base truncate">{entry.username}</div>
                  <div className="font-bold text-sm md:text-base">{formatCurrency(entry.wager)}</div>
                  <div className="font-bold text-sm md:text-base text-primary">{formatCurrency(entry.prize)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <footer className="px-4 mt-6 md:mt-8 pb-4">
          <Card
            className="max-w-6xl mx-auto p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/30 transition-all duration-300 hover:scale-[1.01]"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/mandy-logo-menu-icon-white.svg"
                  alt="Mandy.gg + Thrill Casino - Premier Crypto Casino Partnership"
                  width={500}
                  height={200}
                  className="h-16 md:h-20 w-auto"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-sm md:text-lg text-gray-200 mb-3 md:mb-4">
                <Link href="/privacy" className="hover:text-primary transition-colors uppercase">
                  PRIVACY POLICY
                </Link>
                <Link href="/terms" className="hover:text-primary transition-colors uppercase">
                  TERMS OF SERVICE
                </Link>
                <Link
                  href="https://t.me/mandysupport_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors uppercase"
                >
                  SUPPORT
                </Link>
              </div>
              <p className="text-sm md:text-base text-gray-300 mb-2 uppercase leading-relaxed">
                © 2025 MANDY.GG. ALL RIGHTS RESERVED.
              </p>
              <p className="text-sm md:text-base text-gray-300 uppercase leading-relaxed">
                PLAY RESPONSIBLY. CRYPTOCURRENCY GAMBLING INVOLVES RISK. MUST BE 18+ TO PARTICIPATE.
              </p>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  )
}

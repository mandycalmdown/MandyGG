"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"
import { LeaderboardLiveFeed } from "@/components/leaderboard-live-feed"
import { DailyRaffle } from "@/components/leaderboard-daily-raffle"
import { AnnouncementsTicker } from "@/components/announcements-ticker"
import { isAdminSessionValid } from "@/lib/admin-session"
import { clearLeaderboardCacheAction } from "@/app/actions/admin-actions"
import MailingListForm from "@/components/MailingListForm"

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
  const [previousEntries, setPreviousEntries] = useState<LeaderboardEntry[]>([])
  const [raffleWinners, setRaffleWinners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"current" | "past">("current")
  const currentDataCache = useRef<CachedData | null>(null)
  const pastDataCache = useRef<CachedData | null>(null)
  const raffleCache = useRef<{ data: any[]; timestamp: number } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [dataStatus, setDataStatus] = useState<string>("")
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    setIsAdmin(isAdminSessionValid())
  }, [])

  useEffect(() => {
    const calculateCountdown = () => {
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

      const currentDay = centralTime.getDay()
      const currentHour = centralTime.getHours()

      let daysUntilNextThursday: number

      if (currentDay === 4 && currentHour < 18) {
        daysUntilNextThursday = 0
      } else if (currentDay === 4 && currentHour >= 18) {
        daysUntilNextThursday = 7
      } else if (currentDay > 4) {
        daysUntilNextThursday = 7 - (currentDay - 4)
      } else {
        daysUntilNextThursday = 4 - currentDay
      }

      const nextThursday = new Date(centralTime)
      nextThursday.setDate(centralTime.getDate() + daysUntilNextThursday)
      nextThursday.setHours(18, 0, 0, 0)

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
        const CACHE_DURATION = 2 * 60 * 1000

        if (cache && now - cache.timestamp < CACHE_DURATION) {
          setEntries(cache.data)
          setIsLoading(false)
          setDataStatus("Cached Data")
          return
        }

        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/leaderboard?period=${activeTab}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: ApiResponse = await response.json()
        setDataStatus(data.status || "Unknown")
        setLastUpdated(data.lastUpdated || "")

        if (data.entries && data.entries.length > 0) {
          setPreviousEntries(entries)
          setEntries(data.entries)
          if (activeTab === "current") {
            currentDataCache.current = { data: data.entries, timestamp: now }
          } else {
            pastDataCache.current = { data: data.entries, timestamp: now }
          }
        } else {
          setEntries(mockData)
          setDataStatus("Mock Data - No Results")
        }

        // Also fetch raffle winners in same cycle, using cache
        const raffleCacheAge = raffleCache.current ? now - raffleCache.current.timestamp : Infinity
        if (raffleCacheAge >= 2 * 60 * 1000) {
          try {
            const raffleRes = await fetch("/api/raffle/winners")
            const raffleData = await raffleRes.json()
            if (raffleData.winners) {
              setRaffleWinners(raffleData.winners)
              raffleCache.current = { data: raffleData.winners, timestamp: now }
            }
          } catch (raffleErr) {
            // Use cached raffle data if available
            if (raffleCache.current) setRaffleWinners(raffleCache.current.data)
          }
        } else if (raffleCache.current) {
          setRaffleWinners(raffleCache.current.data)
        }
      } catch (err) {
        console.error("[v0] Error fetching leaderboard:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
        setDataStatus("Error - Using Fallback")
        const cache = activeTab === "current" ? currentDataCache.current : pastDataCache.current
        if (cache) {
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
  }, [activeTab])

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
      if (isAdmin) {
        const result = await clearLeaderboardCacheAction()
        if (!result.success) {
          console.error("[v0] Error clearing cache:", result.error)
        }
      }

      const response = await fetch(`/api/leaderboard?period=${activeTab}&refresh=true`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      setDataStatus(data.status || "Unknown")
      setLastUpdated(data.lastUpdated || "")

      if (data.entries && data.entries.length > 0) {
        setPreviousEntries(entries)
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

  return (
    <div className="min-h-screen bg-[#000000] relative">
      {/* Fixed holographic background */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-mobile-ZwOFt65iGL74bPv4mX15f9MezlKFZP.webp"
          />
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-KuTV174iSOVIJGQHzXHDyVA96RnXCn.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Ticker 1 */}
      <div className="relative z-10">
        <AnnouncementsTicker tickerKey="ticker_1_text" />
      </div>

      <div className="relative z-10">
        <SiteNavigation currentPage="leaderboard" />
      </div>

      {/* Black section: banner + countdown + button */}
      <div className="relative z-10 bg-[#000000]">
      {/* Banner Video */}
      <section className="w-full">
        <div className="w-full relative">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto object-cover"
          >
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-leaderboard-header-banner-b693AAvhq4kfJGiTD6o3xHvpVTK5zS.webm"
              type="video/webm"
            />
          </video>
        </div>
      </section>

      {/* Countdown */}
      <div className="text-center mb-4 md:mb-6 lg:mb-8 px-4">
        <h3
          className="text-xl md:text-2xl lg:text-3xl text-[#CCFF00] mb-1 uppercase"
          style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
        >
          THIS RACE ENDS IN
        </h3>
        <div className="flex justify-center items-center gap-1 md:gap-2 lg:gap-3 py-3">
          {[
            { label: "DAYS", value: countdown.days },
            { label: "HOURS", value: countdown.hours },
            { label: "MINUTES", value: countdown.minutes },
            { label: "SECONDS", value: countdown.seconds },
          ].map((item, idx) => (
            <div key={item.label} className="flex items-center">
              <div className="text-center">
                <div
                  className="text-xs md:text-sm lg:text-base text-[#FFFFFF] uppercase mb-1"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                >
                  {item.label}
                </div>
                <div
                  className="text-3xl md:text-5xl lg:text-6xl text-[#FFFFFF]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                >
                  {item.value.toString().padStart(2, "0")}
                </div>
              </div>
              {idx < 3 && (
                <span
                  className="text-2xl md:text-4xl lg:text-5xl text-[#FFFFFF]/50 mx-1 md:mx-3 mt-4"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-2 md:gap-4 mb-6 md:mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab("current")}
            className={`px-3 md:px-6 py-2 md:py-3 rounded uppercase text-xs md:text-sm transition-all duration-300 ${
              activeTab === "current"
                ? "bg-[#CCFF00] text-[#000000] shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                : "bg-[#1a1a1a] text-[#FFFFFF] hover:bg-[#333] border border-[#333]"
            }`}
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            Current Week
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-3 md:px-6 py-2 md:py-3 rounded uppercase text-xs md:text-sm transition-all duration-300 ${
              activeTab === "past"
                ? "bg-[#CCFF00] text-[#000000] shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                : "bg-[#1a1a1a] text-[#FFFFFF] hover:bg-[#333] border border-[#333]"
            }`}
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            Past Week
          </button>
        </div>

        <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer">
          <button
            className="bg-[#CCFF00] text-[#000000] px-8 md:px-12 py-3 md:py-4 rounded uppercase text-sm md:text-base mb-4 transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-105"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700, letterSpacing: "0.1em" }}
          >
            JOIN THE ACTION
          </button>
        </a>

        {isLoading && (
          <p className="text-sm text-[#888888] mt-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            Loading {activeTab} leaderboard data...
          </p>
        )}
        {error && (
          <p className="text-sm text-[#FF2FBF] mt-2" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            Using cached data - API temporarily unavailable
          </p>
        )}
      </div>
      {/* Gradient fade from black into holographic */}
      <div className="h-6 md:h-8 bg-gradient-to-b from-[#000000] to-transparent" />
      </div>{/* end black section */}

      {/* Top 3 Podium */}
      <div className="relative z-10 px-2 md:px-4">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-3 md:gap-4 mb-6 md:mb-8 max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div
            className={`bg-[#000000] rounded-xl border transition-all duration-500 p-3 md:p-4 text-center relative overflow-visible w-full max-w-xs ${
              hoveredCard === 2 ? "transform scale-105 border-[#CCFF00]/60" : "border-white/20"
            }`}
            style={{
              boxShadow: hoveredCard === 2
                ? "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(204,255,0,0.15)"
                : "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 z-30">
              <div className="hidden md:block">
                <video autoPlay loop muted playsInline disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="w-32 h-32 md:w-36 md:h-36 pointer-events-none" style={{ objectFit: "contain" }}>
                  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/silver_mandy-QLwCilpDVX7yYn5lwHX2x55OPkDBZZ.webm" type="video/webm" />
                </video>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center h-full pt-3 md:pt-4 pb-2">
              <h3
                className="text-sm md:text-base lg:text-lg text-[#FFFFFF] mb-1"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                {topThree[1]?.username}
              </h3>
              <p
                className="text-lg md:text-xl lg:text-2xl text-[#CCFF00] mb-1"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
              >
                {formatCurrency(topThree[1]?.wager || 0)}
              </p>
              <p
                className="text-xs md:text-sm text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                PRIZE: {formatCurrency(topThree[1]?.prize || 0)}
              </p>
            </div>
          </div>

          {/* 1st Place */}
          <div
            className={`bg-[#000000] rounded-xl border transition-all duration-500 p-3 md:p-4 lg:p-6 text-center relative transform md:scale-110 overflow-visible w-full max-w-xs order-first md:order-none ${
              hoveredCard === 1 ? "md:scale-125 border-[#CCFF00]/60" : "border-white/20"
            }`}
            style={{
              boxShadow: hoveredCard === 1
                ? "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(204,255,0,0.2)"
                : "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 z-30">
              <div className="hidden md:block">
                <video autoPlay loop muted playsInline disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="w-32 h-32 md:w-40 md:h-40 pointer-events-none" style={{ objectFit: "contain" }}>
                  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold_mandy-9pX50BDoGrYOwjdjBgvDsA81XNnbzS.webm" type="video/webm" />
                </video>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center h-full pt-3 md:pt-6 pb-2">
              <h3
                className="text-base md:text-lg lg:text-xl text-[#FFFFFF] mb-1"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                {topThree[0]?.username}
              </h3>
              <p
                className="text-xl md:text-2xl lg:text-3xl text-[#CCFF00] mb-1"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
              >
                {formatCurrency(topThree[0]?.wager || 0)}
              </p>
              <p
                className="text-xs md:text-sm text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                PRIZE: {formatCurrency(topThree[0]?.prize || 0)}
              </p>
            </div>
          </div>

          {/* 3rd Place */}
          <div
            className={`bg-[#000000] rounded-xl border transition-all duration-500 p-3 md:p-4 text-center relative overflow-visible w-full max-w-xs ${
              hoveredCard === 3 ? "transform scale-105 border-[#CCFF00]/60" : "border-white/20"
            }`}
            style={{
              boxShadow: hoveredCard === 3
                ? "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(204,255,0,0.15)"
                : "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
            onMouseEnter={() => setHoveredCard(3)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="absolute -top-12 md:-top-16 left-1/2 transform -translate-x-1/2 z-30">
              <div className="hidden md:block">
                <video autoPlay loop muted playsInline disablePictureInPicture disableRemotePlayback controlsList="nodownload nofullscreen noremoteplayback" className="w-32 h-32 md:w-36 md:h-36 pointer-events-none" style={{ objectFit: "contain" }}>
                  <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-ezgif.com-gif-to-webm-converter-RoLVPGw8RXwCgrEfDo86QZ9Kvc24J7.webm" type="video/webm" />
                </video>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center h-full pt-3 md:pt-4 pb-2">
              <h3
                className="text-sm md:text-base lg:text-lg text-[#FFFFFF] mb-1"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                {topThree[2]?.username}
              </h3>
              <p
                className="text-lg md:text-xl lg:text-2xl text-[#CCFF00] mb-1"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
              >
                {formatCurrency(topThree[2]?.wager || 0)}
              </p>
              <p
                className="text-xs md:text-sm text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                PRIZE: {formatCurrency(topThree[2]?.prize || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Ranks 4-10 Table */}
        <div
          className="max-w-4xl mx-auto bg-[#000000] rounded-xl border border-white/20 overflow-hidden transition-all duration-500 hover:border-[#CCFF00]/40"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)" }}
        >
          <div className="p-3 md:p-6">
            <div
              className="grid grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm text-[#CCFF00] uppercase"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
            >
              <div>RANK</div>
              <div>USERNAME</div>
              <div>WAGER</div>
              <div>PRIZE</div>
            </div>

            {remainingEntries.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-4 gap-2 md:gap-4 py-2 md:py-3 border-t border-white/10 text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                <div className="text-sm md:text-base" style={{ fontWeight: 700 }}>{entry.rank}</div>
                <div className="text-sm md:text-base truncate" style={{ fontWeight: 600 }}>{entry.username}</div>
                <div className="text-sm md:text-base" style={{ fontWeight: 700 }}>{formatCurrency(entry.wager)}</div>
                <div className="text-sm md:text-base text-[#CCFF00]" style={{ fontWeight: 700 }}>{formatCurrency(entry.prize)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="relative z-10">
        <LeaderboardLiveFeed entries={entries} previousEntries={previousEntries} />
      </div>

      {/* Daily Raffle */}
      <div className="relative z-10">
        <DailyRaffle winners={raffleWinners} />
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-[#000000] py-10 md:py-14 px-4 mt-10 md:mt-14">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-logo-small-REJQ74xYMktKwzxz1LsyZINIDXNKJs.webp"
              alt="Mandy.gg logo"
              width={120}
              height={48}
              className="h-10 md:h-12 w-auto"
            />
          </div>

          <div
            className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-[#FFFFFF] mb-6"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            <Link href="/privacy" className="hover:text-[#CCFF00] transition-colors uppercase">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="hover:text-[#CCFF00] transition-colors uppercase">
              TERMS OF SERVICE
            </Link>
            <a
              href="https://t.me/mandysupport_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#CCFF00] transition-colors uppercase"
            >
              SUPPORT
            </a>
          </div>

          <MailingListForm />

          <p
            className="text-xs text-[#888888] mt-8 uppercase leading-relaxed"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {"© 2025 MANDY.GG. ALL RIGHTS RESERVED. PLAY RESPONSIBLY. CRYPTOCURRENCY GAMBLING INVOLVES RISK. MUST BE 18+ TO PARTICIPATE."}
          </p>
        </div>
      </footer>
    </div>
  )
}

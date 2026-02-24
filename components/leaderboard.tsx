"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { SiteNavigation } from "@/components/site-navigation"
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
    <div className="min-h-screen bg-[#000000]">
      {/* Ticker 1 */}
      <AnnouncementsTicker tickerKey="ticker_1_text" />

      <SiteNavigation currentPage="leaderboard" />

      {/* Banner */}
      <section className="relative w-full mb-2">
        <div className="w-full max-w-6xl mx-auto relative px-2 md:px-0">
          <Image
            src="/images/thrill-mandy-banner-static-leaderboard.webp"
            alt="Thrill Mandy Leaderboard - $3500 Weekly Crypto Casino Competition"
            width={1200}
            height={300}
            className="hidden md:block w-full h-auto max-h-[40vh] lg:max-h-[50vh] object-contain"
            priority
          />
          <Image
            src="/images/mobile-static-leaderboard.webp"
            alt="Mobile Leaderboard - Weekly Crypto Casino Battle"
            width={400}
            height={400}
            className="md:hidden w-full h-auto max-w-sm mx-auto object-contain rounded"
            priority
          />
        </div>
      </section>

      {/* Countdown */}
      <div className="text-center mb-4 md:mb-6 lg:mb-8 px-4">
        <h3
          className="text-xl md:text-2xl lg:text-3xl text-[#3C7BFF] mb-3 uppercase"
          style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
        >
          THIS BATTLE ENDS IN
        </h3>
        <div className="flex justify-center gap-3 md:gap-6 lg:gap-8 py-6">
          {[
            { label: "DAYS", value: countdown.days },
            { label: "HOURS", value: countdown.hours },
            { label: "MINUTES", value: countdown.minutes },
            { label: "SECONDS", value: countdown.seconds },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div
                className="text-xs md:text-sm lg:text-base text-[#888888] uppercase mb-1"
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
          {isAdmin && (
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3 md:px-6 py-2 md:py-3 bg-[#3C7BFF] hover:bg-[#3C7BFF]/80 disabled:bg-[#333] text-[#FFFFFF] rounded uppercase text-xs md:text-sm transition-all duration-300 flex items-center gap-2 z-50"
              style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
            >
              {isRefreshing ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refreshing...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Admin Refresh
                </>
              )}
            </button>
          )}
        </div>

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

      {/* Top 3 Podium */}
      <div className="px-2 md:px-4">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-3 md:gap-4 mb-6 md:mb-8 max-w-4xl mx-auto">
          {/* 2nd Place */}
          <div
            className={`bg-[#050505] rounded border border-[#333] p-3 md:p-4 text-center relative overflow-visible w-full max-w-xs transition-all duration-300 ${
              hoveredCard === 2 ? "transform scale-105" : ""
            }`}
            style={{
              boxShadow: hoveredCard === 2
                ? "0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(60,123,255,0.4)"
                : "0 25px 50px rgba(0,0,0,0.8), 0 0 15px rgba(60,123,255,0.15)",
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
                className="text-xs md:text-sm text-[#888888]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                PRIZE: {formatCurrency(topThree[1]?.prize || 0)}
              </p>
            </div>
          </div>

          {/* 1st Place */}
          <div
            className={`bg-[#050505] rounded border border-[#333] p-3 md:p-4 lg:p-6 text-center relative transform md:scale-110 overflow-visible w-full max-w-xs order-first md:order-none transition-all duration-300 ${
              hoveredCard === 1 ? "md:scale-125" : ""
            }`}
            style={{
              boxShadow: hoveredCard === 1
                ? "0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(204,255,0,0.4)"
                : "0 25px 50px rgba(0,0,0,0.8), 0 0 15px rgba(204,255,0,0.15)",
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
                className="text-xs md:text-sm text-[#888888]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                PRIZE: {formatCurrency(topThree[0]?.prize || 0)}
              </p>
            </div>
          </div>

          {/* 3rd Place */}
          <div
            className={`bg-[#050505] rounded border border-[#333] p-3 md:p-4 text-center relative overflow-visible w-full max-w-xs transition-all duration-300 ${
              hoveredCard === 3 ? "transform scale-105" : ""
            }`}
            style={{
              boxShadow: hoveredCard === 3
                ? "0 20px 40px rgba(0,0,0,0.8), 0 0 30px rgba(165,56,255,0.4)"
                : "0 25px 50px rgba(0,0,0,0.8), 0 0 15px rgba(165,56,255,0.15)",
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
                className="text-xs md:text-sm text-[#888888]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                PRIZE: {formatCurrency(topThree[2]?.prize || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Ranks 4-10 Table */}
        <div
          className="max-w-4xl mx-auto bg-[#050505] rounded border border-[#333] overflow-hidden transition-all duration-300 hover:shadow-2xl"
          style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.8)" }}
        >
          <div className="p-3 md:p-6">
            <div
              className="grid grid-cols-4 gap-2 md:gap-4 mb-3 md:mb-4 text-xs md:text-sm text-[#888888] uppercase"
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
                className="grid grid-cols-4 gap-2 md:gap-4 py-2 md:py-3 border-t border-[#333] text-[#FFFFFF]"
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

      {/* Footer */}
      <footer className="bg-[#000000] border-t border-[#CCFF00] py-10 md:py-14 px-4 mt-6 md:mt-8">
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

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Lock, ArrowLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { SiteNavigation } from "@/components/site-navigation"
import { useRouter } from "next/navigation"

interface Profile {
  id: string
  thrill_username: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  thrill_username_verified: boolean
  thrill_username_locked: boolean
  pokernow_username: string | null
  telegram_username: string | null
}

interface PlayerStats {
  id: number
  username: string
  wager: number
  prize: number
  rank: number
  xp: number
}

interface WagerHistory {
  last7Days: number
  last30Days: number
  status: string
}

interface AdminUserDashboardProps {
  profile: Profile
}

export function AdminUserDashboard({ profile }: AdminUserDashboardProps) {
  const router = useRouter()
  const [userStats, setUserStats] = useState<PlayerStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [wagerHistory, setWagerHistory] = useState<WagerHistory | null>(null)
  const [isLoadingWagerHistory, setIsLoadingWagerHistory] = useState(false)
  const [monthlyWager, setMonthlyWager] = useState<number>(0)
  const [isLoadingMonthlyWager, setIsLoadingMonthlyWager] = useState(false)
  const POKER_REQUIREMENT = 50000

  const [pokerCountdown, setPokerCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculatePokerCountdown = () => {
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

      let targetDeadline: Date
      if (centralTime < firstSundayOfCurrentMonth) {
        targetDeadline = firstSundayOfCurrentMonth
      } else {
        targetDeadline = firstSundayOfNextMonth
      }

      const timeDiff = targetDeadline.getTime() - centralTime.getTime()

      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

        setPokerCountdown({ days, hours, minutes, seconds })
      } else {
        setPokerCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculatePokerCountdown()
    const timer = setInterval(calculatePokerCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchUserStats() {
      if (!profile?.thrill_username) {
        setUserStats(null)
        setStatsError(null)
        return
      }

      setIsLoadingStats(true)
      setStatsError(null)
      try {
        const response = await fetch(`/api/player-stats?period=current&username=${profile.thrill_username}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            setStatsError(data.message || "User is not currently on the leaderboard")
            setUserStats(null)
          } else if (response.status === 503) {
            setStatsError("Leaderboard data is loading. Please wait a moment and refresh.")
            setUserStats(null)
          } else {
            throw new Error(data.error || "Failed to fetch stats")
          }
        } else {
          setUserStats(data.stats)
          setStatsError(null)
        }
      } catch (err) {
        console.error("[v0] Error fetching user stats:", err)
        setStatsError(err instanceof Error ? err.message : "Failed to load stats")
        setUserStats(null)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchUserStats()
  }, [profile?.thrill_username])

  useEffect(() => {
    async function fetchWagerHistory() {
      if (!profile?.thrill_username) {
        setWagerHistory(null)
        return
      }

      setIsLoadingWagerHistory(true)
      try {
        const response = await fetch(`/api/player-wager-history?username=${profile.thrill_username}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch wager history")
        }

        setWagerHistory(data)
      } catch (err) {
        console.error("[v0] Error fetching wager history:", err)
        setWagerHistory(null)
      } finally {
        setIsLoadingWagerHistory(false)
      }
    }

    fetchWagerHistory()
  }, [profile?.thrill_username])

  useEffect(() => {
    async function fetchMonthlyWager() {
      if (!profile?.thrill_username) {
        setMonthlyWager(0)
        return
      }

      setIsLoadingMonthlyWager(true)
      try {
        const response = await fetch(`/api/player-wager-history?username=${profile.thrill_username}`)
        const data = await response.json()

        if (response.ok) {
          setMonthlyWager(data.last30Days || 0)
        }
      } catch (err) {
        console.error("[v0] Error fetching monthly wager:", err)
        setMonthlyWager(0)
      } finally {
        setIsLoadingMonthlyWager(false)
      }
    }

    fetchMonthlyWager()
  }, [profile?.thrill_username])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="relative z-10">
        <SiteNavigation currentPage="admin" />

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              onClick={() => router.push("/admin")}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-indigo-400 mb-8 uppercase text-center">
            User Dashboard (Admin View)
          </h1>

          {/* Profile Section */}
          <Card
            className="p-6 md:p-8 mb-6 rounded-xl border border-indigo-400/50"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
            }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-2 border-indigo-400">
                <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                <AvatarFallback className="bg-[#1a1a1a] text-indigo-400 text-2xl font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{profile?.display_name || "No display name"}</h2>
                {profile?.thrill_username && (
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <p className="text-indigo-400 font-semibold">Thrill: @{profile.thrill_username}</p>
                    {profile.thrill_username_verified && (
                      <div className="flex items-center gap-1 bg-indigo-500/20 px-2 py-1 rounded-md">
                        <CheckCircle className="h-4 w-4 text-indigo-400" />
                        <span className="text-xs text-indigo-400 font-bold">VERIFIED</span>
                      </div>
                    )}
                    {profile.thrill_username_locked && (
                      <Lock className="h-4 w-4 text-indigo-400" title="Account locked" />
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                  {profile.pokernow_username && (
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">PokerNow:</span> {profile.pokernow_username}
                    </p>
                  )}
                  {profile.telegram_username && (
                    <p className="text-sm text-gray-400">
                      <span className="text-gray-500">Telegram:</span> @{profile.telegram_username}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">Joined {formatDate(profile.created_at)}</p>
              </div>
            </div>
          </Card>

          {profile?.thrill_username ? (
            <>
              {/* Monthly Poker Night Progress */}
              <Card
                className="p-6 rounded-xl border border-indigo-400/50 mb-6"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 uppercase text-center">
                  Monthly Poker Night Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Progress to Poker Night Qualification</span>
                    <span className="font-bold text-indigo-400">
                      {isLoadingMonthlyWager
                        ? "..."
                        : `${formatCurrency(monthlyWager)} / ${formatCurrency(POKER_REQUIREMENT)}`}
                    </span>
                  </div>
                  <Progress
                    value={Math.min((monthlyWager / POKER_REQUIREMENT) * 100, 100)}
                    className="h-4 bg-gray-800"
                  />
                  <p className="text-xs text-gray-400 text-center">
                    {monthlyWager >= POKER_REQUIREMENT
                      ? "🎉 Qualified for this month's poker tournament!"
                      : `Wager ${formatCurrency(POKER_REQUIREMENT - monthlyWager)} more to qualify`}
                  </p>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-400 mb-2">Next Poker Night:</p>
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{pokerCountdown.days}</div>
                        <div className="text-xs text-gray-400">DAYS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{pokerCountdown.hours}</div>
                        <div className="text-xs text-gray-400">HRS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{pokerCountdown.minutes}</div>
                        <div className="text-xs text-gray-400">MIN</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-indigo-400">{pokerCountdown.seconds}</div>
                        <div className="text-xs text-gray-400">SEC</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Wager Stats */}
              <Card
                className="p-6 rounded-xl border border-indigo-400/50 mb-6"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 uppercase text-center">Wager Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-sm uppercase mb-2">7 Day Wager (USD)</p>
                    <p className="text-3xl font-bold text-indigo-400">
                      {isLoadingWagerHistory ? "..." : wagerHistory ? formatCurrency(wagerHistory.last7Days) : "$0"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-sm uppercase mb-2">30 Day Wager (USD)</p>
                    <p className="text-3xl font-bold text-indigo-400">
                      {isLoadingWagerHistory ? "..." : wagerHistory ? formatCurrency(wagerHistory.last30Days) : "$0"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Stats Error */}
              {statsError && (
                <Card
                  className="p-6 rounded-xl border border-[#3C7BFF]/30 mb-6"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(60,123,255,0.12)",
                  }}
                >
                  <p className="text-[#3C7BFF] text-center">{statsError}</p>
                </Card>
              )}

              {/* Leaderboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card
                  className="p-6 rounded-xl border border-indigo-400/50"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-400 text-sm uppercase mb-2">Current Leaderboard Rank</p>
                    <p className="text-3xl font-bold text-indigo-400">
                      {isLoadingStats ? "..." : userStats ? `#${userStats.rank}` : "N/A"}
                    </p>
                  </div>
                </Card>

                <Card
                  className="p-6 rounded-xl border border-indigo-400/50"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-400 text-sm uppercase mb-2">Total Prizes</p>
                    <p className="text-3xl font-bold text-indigo-400">
                      {isLoadingStats ? "..." : userStats ? formatCurrency(userStats.prize) : "N/A"}
                    </p>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card
              className="p-8 rounded-xl border border-indigo-400/50 mb-6 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
              }}
            >
              <p className="text-gray-300 text-lg">This user has not linked their Thrill username yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

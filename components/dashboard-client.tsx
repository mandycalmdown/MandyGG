"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Camera, AlertCircle, CheckCircle, Lock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { SiteNavigation } from "@/components/site-navigation"

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

interface DashboardClientProps {
  user: User
  profile: Profile | null
}

export function DashboardClient({ user, profile: initialProfile }: DashboardClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [thrillUsername, setThrillUsername] = useState(initialProfile?.thrill_username || "")
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "")
  const [pokernowUsername, setPokernowUsername] = useState(initialProfile?.pokernow_username || "")
  const [telegramUsername, setTelegramUsername] = useState(initialProfile?.telegram_username || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<PlayerStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState<"current" | "past">("current")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [isLinking, setIsLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null)
  const [wagerHistory, setWagerHistory] = useState<WagerHistory | null>(null)
  const [isLoadingWagerHistory, setIsLoadingWagerHistory] = useState(false)

  const [monthlyWager, setMonthlyWager] = useState<number>(0)
  const [isLoadingMonthlyWager, setIsLoadingMonthlyWager] = useState(false)
  const POKER_REQUIREMENT = 50000 // $50,000 requirement for poker night

  const [dailyWager, setDailyWager] = useState<number>(0)
  const [isLoadingDailyWager, setIsLoadingDailyWager] = useState(false)

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

      // Find the first Sunday of the current month
      const currentMonth = centralTime.getMonth()
      const currentYear = centralTime.getFullYear()

      const firstDayOfCurrentMonth = new Date(currentYear, currentMonth, 1)
      const firstSundayOfCurrentMonth = new Date(firstDayOfCurrentMonth)
      while (firstSundayOfCurrentMonth.getDay() !== 0) {
        firstSundayOfCurrentMonth.setDate(firstSundayOfCurrentMonth.getDate() + 1)
      }
      firstSundayOfCurrentMonth.setHours(18, 0, 0, 0) // 6 PM CST

      // Find the first Sunday of next month
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
      firstSundayOfNextMonth.setHours(18, 0, 0, 0) // 6 PM CST

      // Determine which deadline to count down to
      let targetDeadline: Date
      if (centralTime < firstSundayOfCurrentMonth) {
        // Before this month's deadline
        targetDeadline = firstSundayOfCurrentMonth
      } else {
        // After this month's deadline, count down to next month
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
        const response = await fetch(`/api/player-stats?period=${activeTab}`)
        const data = await response.json()

        if (!response.ok) {
          if (response.status === 404) {
            setStatsError(data.message || "You are not currently on the leaderboard")
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
  }, [profile?.thrill_username, activeTab])

  useEffect(() => {
    async function checkEmailVerification() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      // Removed emailVerified state usage
    }
    checkEmailVerification()
  }, [supabase])

  useEffect(() => {
    async function fetchWagerHistory() {
      if (!profile?.thrill_username) {
        setWagerHistory(null)
        return
      }

      setIsLoadingWagerHistory(true)
      try {
        const response = await fetch("/api/player-wager-history")
        const data = await response.json()

        if (response.status === 429) {
          console.log("[v0] Rate limited, using cached data if available")
          if (data.last7Days !== undefined && data.last30Days !== undefined) {
            setWagerHistory(data)
          } else {
            setWagerHistory({ last7Days: 0, last30Days: 0, status: "rate_limited" })
          }
          return
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch wager history")
        }

        setWagerHistory(data)
      } catch (err) {
        console.error("[v0] Error fetching wager history:", err)
        if (!wagerHistory) {
          setWagerHistory({ last7Days: 0, last30Days: 0, status: "error" })
        }
      } finally {
        setIsLoadingWagerHistory(false)
      }
    }

    fetchWagerHistory()
  }, [])

  useEffect(() => {
    async function fetchMonthlyWager() {
      if (!profile?.thrill_username) {
        setMonthlyWager(0)
        return
      }

      setIsLoadingMonthlyWager(true)
      try {
        const response = await fetch("/api/player-wager-history")
        const data = await response.json()

        if (response.status === 429) {
          console.log("[v0] Rate limited for monthly wager")
          if (data.last30Days !== undefined) {
            setMonthlyWager(data.last30Days)
          }
          return
        }

        if (response.ok) {
          setMonthlyWager(data.last30Days || 0)
        }
      } catch (err) {
        console.error("[v0] Error fetching monthly wager:", err)
      } finally {
        setIsLoadingMonthlyWager(false)
      }
    }

    fetchMonthlyWager()
  }, [])

  useEffect(() => {
    async function fetchDailyWager() {
      if (!profile?.thrill_username) {
        setDailyWager(0)
        return
      }

      setIsLoadingDailyWager(true)
      try {
        const response = await fetch("/api/daily-leaderboard?uncensored=true")
        const data = await response.json()

        if (response.ok && data.leaderboard) {
          const userEntry = data.leaderboard.find(
            (entry: { username: string; wager: number }) =>
              entry.username.toLowerCase() === profile.thrill_username?.toLowerCase(),
          )
          setDailyWager(userEntry?.wager || 0)
        }
      } catch (err) {
        console.error("[v0] Error fetching daily wager:", err)
      } finally {
        setIsLoadingDailyWager(false)
      }
    }

    fetchDailyWager()
  }, [profile?.thrill_username])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          thrill_username: thrillUsername || null,
          display_name: displayName || null,
          pokernow_username: pokernowUsername || null,
          telegram_username: telegramUsername || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setProfile(data.profile)
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setProfile((prev) => (prev ? { ...prev, avatar_url: data.url } : null))
      setSuccess("Profile photo updated successfully!")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Removed unused verification functions

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="relative z-10">
        {/* Navigation */}
        <SiteNavigation currentPage="dashboard" />

        {/* Dashboard Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-500 mb-8 uppercase text-center">DEGEN DASHBOARD</h1>

          {/* Profile Section */}
          <Card
            className="p-6 md:p-8 mb-6 rounded-xl border border-white/30"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-2 border-teal-500">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                  <AvatarFallback className="bg-[#1a1a1a] text-teal-500 text-2xl font-bold">
                    {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Upload profile photo"
                >
                  <Camera className="h-8 w-8 text-teal-500" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile?.display_name || "Set your display name"}
                </h2>
                <p className="text-gray-400 mb-1">{user.email}</p>
                {profile?.thrill_username && (
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <p className="text-teal-500 font-semibold">Thrill: @{profile.thrill_username}</p>
                    {profile.thrill_username_verified && (
                      <div className="flex items-center gap-1 bg-teal-500/20 px-2 py-1 rounded-md">
                        <CheckCircle className="h-4 w-4 text-teal-500" />
                        <span className="text-xs text-teal-500 font-bold">VERIFIED</span>
                      </div>
                    )}
                    {profile.thrill_username_locked && (
                      <Lock className="h-4 w-4 text-teal-500" title="Account locked" />
                    )}
                  </div>
                )}
                {isUploadingPhoto && <p className="text-sm text-gray-400 mt-2">Uploading photo...</p>}
              </div>

              {!profile?.thrill_username_locked && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-teal-500 text-black hover:bg-teal-400 font-bold rounded-xl"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              )}
              {profile?.thrill_username_locked && (
                <div className="text-center md:text-right">
                  <div className="flex items-center gap-2 text-teal-500 mb-1">
                    <Lock className="h-5 w-5" />
                    <span className="font-bold">Account Locked</span>
                  </div>
                  <p className="text-xs text-gray-400">Contact support to change username</p>
                </div>
              )}
            </div>

            {isEditing && !profile?.thrill_username_locked && (
              <div className="mt-6 pt-6 border-t border-white/20 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-gray-300">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                    className="bg-[#1a1a1a] border-[#333] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thrillUsername" className="text-gray-300">
                    Thrill Username
                  </Label>
                  <Input
                    id="thrillUsername"
                    value={thrillUsername}
                    onChange={(e) => setThrillUsername(e.target.value)}
                    placeholder="Your Thrill username (without @)"
                    className="bg-[#1a1a1a] border-[#333] text-white"
                    disabled={profile?.thrill_username_locked}
                  />
                  {!profile?.thrill_username && (
                    <p className="text-sm text-gray-400">
                      Enter your Thrill username to link your account and track your stats.
                    </p>
                  )}
                  {profile?.thrill_username && !profile?.thrill_username_locked && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                      <p className="text-sm text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        To unlink your Thrill username, please contact admin support. This process may take a few days.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pokernowUsername" className="text-gray-300">
                    PokerNow Username
                  </Label>
                  <Input
                    id="pokernowUsername"
                    value={pokernowUsername}
                    onChange={(e) => setPokernowUsername(e.target.value)}
                    placeholder="Your PokerNow username (optional)"
                    className="bg-[#1a1a1a] border-[#333] text-white"
                  />
                  <p className="text-sm text-gray-400">
                    Add your PokerNow username so admins can identify you for poker tournaments.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegramUsername" className="text-gray-300">
                    Telegram Username
                  </Label>
                  <Input
                    id="telegramUsername"
                    value={telegramUsername}
                    onChange={(e) => setTelegramUsername(e.target.value)}
                    placeholder="Your Telegram username (without @)"
                    className="bg-[#1a1a1a] border-[#333] text-white"
                  />
                  <p className="text-sm text-gray-400">
                    Add your Telegram username for direct communication and updates.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-md">
                    <p className="text-sm text-teal-500">{success}</p>
                  </div>
                )}

                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-indigo-400 hover:bg-indigo-500 text-black font-bold rounded-xl"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </Card>

          {profile?.thrill_username ? (
            <>
              <Card
                className="p-6 rounded-xl border border-white/30 mb-6"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 uppercase text-center">
                  Monthly Poker Night Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Progress to Poker Night Qualification</span>
                    <span className="font-bold text-teal-500">
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
                      : `Wager ${formatCurrency(POKER_REQUIREMENT - monthlyWager)} more to qualify for the $1,000 poker tournament`}
                  </p>
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-400 mb-2">Next Poker Night:</p>
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-500">{pokerCountdown.days}</div>
                        <div className="text-xs text-gray-400">DAYS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-500">{pokerCountdown.hours}</div>
                        <div className="text-xs text-gray-400">HRS</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-500">{pokerCountdown.minutes}</div>
                        <div className="text-xs text-gray-400">MIN</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-teal-500">{pokerCountdown.seconds}</div>
                        <div className="text-xs text-gray-400">SEC</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center italic">
                    Resets on the 1st Sunday of each month at 6 PM CST
                  </p>
                </div>
              </Card>

              {/* Wager Stats Card */}
              <Card
                className="p-6 rounded-xl border border-white/30 mb-6"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                }}
              >
                <h3 className="text-2xl font-bold text-white mb-4 uppercase text-center">Wager Stats</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-sm uppercase mb-2">24 Hour Wager (USD)</p>
                    <p className="text-3xl font-bold text-amber-500">
                      {isLoadingDailyWager ? "..." : formatCurrency(dailyWager)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Midnight UTC - Midnight UTC</p>
                  </div>
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-sm uppercase mb-2">7 Day Wager (USD)</p>
                    <p className="text-3xl font-bold text-teal-500">
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

              {statsError && (
                <Card
                  className="p-6 rounded-xl border border-yellow-500/30 mb-6"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(234, 179, 8, 0.15)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-500 font-semibold mb-1">Stats Not Available</p>
                      <p className="text-gray-300 text-sm">{statsError}</p>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card
                  className="p-6 rounded-xl border border-white/30"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-400 text-sm uppercase mb-2">Current Leaderboard Rank</p>
                    <p className="text-3xl font-bold text-teal-500">
                      {isLoadingStats ? "..." : userStats ? `#${userStats.rank}` : "N/A"}
                    </p>
                  </div>
                </Card>

                <Card
                  className="p-6 rounded-xl border border-white/30"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-400 text-sm uppercase mb-2">Total Prizes</p>
                    <p className="text-3xl font-bold text-teal-500">
                      {isLoadingStats ? "..." : userStats ? formatCurrency(userStats.prize) : "N/A"}
                    </p>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <Card
              className="p-8 rounded-xl border border-white/30 mb-6 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
            >
              <p className="text-gray-300 text-lg mb-4">
                Add your Thrill username to see your stats and leaderboard position!
              </p>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-teal-500 text-black hover:bg-teal-400 font-bold rounded-xl"
              >
                Add Thrill Username
              </Button>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              className="p-6 rounded-xl border border-white/30 hover:scale-105 transition-transform"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-2 uppercase">View Top 10</h3>
              <p className="text-gray-400 mb-4">Check out the top players on the leaderboard</p>
              <Link href="/leaderboard">
                <Button className="w-full bg-indigo-400 hover:bg-indigo-500 text-black font-bold rounded-xl uppercase">
                  Go to Leaderboard
                </Button>
              </Link>
            </Card>

            <Card
              className="p-6 rounded-xl border border-white/30 hover:scale-105 transition-transform"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
            >
              <h3 className="text-xl font-bold text-white mb-2 uppercase">Rewards</h3>
              <p className="text-gray-400 mb-4">
                {profile?.thrill_username && monthlyWager >= POKER_REQUIREMENT
                  ? "🎉 You qualify for poker night!"
                  : profile?.thrill_username
                    ? "Keep wagering to qualify for poker night"
                    : "Link your account to track rewards"}
              </p>
              <Link href="/rewards">
                <Button className="w-full bg-indigo-400 hover:bg-indigo-500 text-black font-bold rounded-xl uppercase">
                  View Rewards
                </Button>
              </Link>
            </Card>

            <Card
              className="p-6 rounded-xl border border-teal-500/50 hover:scale-105 transition-all duration-300 relative overflow-hidden"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  "0 8px 32px rgba(20, 184, 166, 0.3), 0 0 40px rgba(20, 184, 166, 0.2), 0 0 60px rgba(20, 184, 166, 0.1)",
              }}
            >
              {/* Metallic gradient overlay */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(20, 184, 166, 0.4) 0%, rgba(20, 184, 166, 0.4) 50%, rgba(20, 184, 166, 0.4) 100%)",
                  backgroundSize: "200% 200%",
                  animation: "shimmer 3s ease-in-out infinite",
                }}
              />

              {/* Blur overlay with "wen?" text */}
              <div className="absolute inset-0 backdrop-blur-sm bg-black/40 flex items-center justify-center z-10">
                <div className="text-center">
                  <p
                    className="text-6xl font-black text-teal-500 mb-2"
                    style={{ textShadow: "0 0 20px rgba(20, 184, 166, 0.8)" }}
                  >
                    wen?
                  </p>
                  <p className="text-sm text-teal-500/80 uppercase tracking-wider">Something awesome is coming</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 uppercase">Mystery Feature</h3>
              <p className="text-gray-400 mb-4">Stay tuned for something special...</p>
              <Button
                disabled
                className="w-full bg-teal-500/20 text-teal-500 font-bold rounded-xl uppercase cursor-not-allowed"
              >
                Locked
              </Button>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 mt-6 md:mt-8 pb-4">
          <Card
            className="max-w-6xl mx-auto p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/30 transition-all duration-300 hover:scale-[1.01] md:py-[23px] my-[11px]"
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
                  alt="Mandy.gg"
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

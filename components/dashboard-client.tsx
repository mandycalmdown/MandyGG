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
import "@/styles/mandy-home.css"

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"
const RAFFLE_IMAGE = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_RAFFLE_ELEMENT-5nXhltypJsyT8gSS71VtOLkfrz07HQ.webp"

// Holographic accent colors from video overlay
const HOLO_BLUE    = "#3C7BFF"
const HOLO_CYAN    = "#5ac3ff"
const HOLO_PURPLE  = "#a855f7"
const HOLO_PINK    = "#ff94b4"
const HOLO_GREEN   = "#4ade80"
const HOLO_YELLOW  = "#fbbf24"
const ACCENT = HOLO_BLUE  // Primary accent

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

interface RaffleTicket {
  id: string
  ticket_number: number
  raffle_date: string
  wager_amount: number
  created_at: string
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
}

interface RaffleCountdown {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function DashboardClient({ user, profile: initialProfile }: DashboardClientProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [thrillUsername, setThrillUsername] = useState(initialProfile?.thrill_username || "")
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "")
  const [telegramUsername, setTelegramUsername] = useState(initialProfile?.telegram_username || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<PlayerStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [wagerHistory, setWagerHistory] = useState<WagerHistory | null>(null)
  const [isLoadingWagerHistory, setIsLoadingWagerHistory] = useState(false)

  const [monthlyWager, setMonthlyWager] = useState<number>(0)
  const [isLoadingMonthlyWager, setIsLoadingMonthlyWager] = useState(false)
  const POKER_REQUIREMENT = 50000

  const [dailyWager, setDailyWager] = useState<number>(0)
  const [isLoadingDailyWager, setIsLoadingDailyWager] = useState(false)

  const [raffleTickets, setRaffleTickets] = useState<RaffleTicket[]>([])
  const [isLoadingRaffle, setIsLoadingRaffle] = useState(false)

  const [raffleCountdown, setRaffleCountdown] = useState<RaffleCountdown>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const [pokerCountdown, setPokerCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  // Calculate raffle countdown (weekly - Friday)
  useEffect(() => {
    const calculateRaffleCountdown = () => {
      const now = new Date()
      const currentDay = now.getDay()
      const currentHour = now.getHours()
      
      // Find next Friday at midnight UTC
      let daysUntilFriday = (5 - currentDay + 7) % 7
      if (daysUntilFriday === 0 && currentHour >= 0) {
        // It's Friday and past midnight, so next Friday
        daysUntilFriday = 7
      }
      
      const nextFriday = new Date(now)
      nextFriday.setDate(now.getDate() + daysUntilFriday)
      nextFriday.setUTCHours(0, 0, 0, 0)
      
      const timeDiff = nextFriday.getTime() - now.getTime()
      
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)
        
        setRaffleCountdown({ days, hours, minutes, seconds })
      } else {
        setRaffleCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }
    
    calculateRaffleCountdown()
    const timer = setInterval(calculateRaffleCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

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
        const response = await fetch(`/api/player-stats?period=current`)
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
        console.error("Error fetching user stats:", err)
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
        const response = await fetch("/api/player-wager-history")
        const data = await response.json()

        if (response.status === 429) {
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
        console.error("Error fetching wager history:", err)
        if (!wagerHistory) {
          setWagerHistory({ last7Days: 0, last30Days: 0, status: "error" })
        }
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
        const response = await fetch("/api/player-wager-history")
        const data = await response.json()

        if (response.status === 429) {
          if (data.last30Days !== undefined) {
            setMonthlyWager(data.last30Days)
          }
          return
        }

        if (response.ok) {
          setMonthlyWager(data.last30Days || 0)
        }
      } catch (err) {
        console.error("Error fetching monthly wager:", err)
      } finally {
        setIsLoadingMonthlyWager(false)
      }
    }

    fetchMonthlyWager()
  }, [profile?.thrill_username])

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
        console.error("Error fetching daily wager:", err)
      } finally {
        setIsLoadingDailyWager(false)
      }
    }

    fetchDailyWager()
  }, [profile?.thrill_username])

  useEffect(() => {
    async function fetchRaffleTickets() {
      setIsLoadingRaffle(true)
      try {
        const res = await fetch("/api/raffle/tickets")
        const data = await res.json()
        if (data.tickets) setRaffleTickets(data.tickets)
      } catch (err) {
        console.error("Error fetching raffle tickets:", err)
      } finally {
        setIsLoadingRaffle(false)
      }
    }
    fetchRaffleTickets()
  }, [])

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

  // Calculate wager progress to next raffle ticket (every $500)
  const TICKET_INTERVAL = 500
  const currentWager = wagerHistory?.last7Days || 0
  const ticketsEarned = Math.floor(currentWager / TICKET_INTERVAL)
  const wagerTowardNext = currentWager % TICKET_INTERVAL
  const progressPercent = (wagerTowardNext / TICKET_INTERVAL) * 100

  return (
    <>
      <SiteNavigation currentPage="dashboard" />
      <div className="mandy-home min-h-screen bg-black font-sans">
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {/* Holo Header */}
            <div className="holo-mask mb-6" style={{ textAlign: "center" }}>
              <h1
                className="holo-mask__letters"
                style={{
                  fontSize: "clamp(2rem, 7vw, 3.5rem)",
                  fontFamily: "Poppins, var(--font-poppins), sans-serif",
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                }}
              >
                DEGEN DASHBOARD
              </h1>
              <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
                <source src={HOLO_TEXT_SRC} type="video/mp4" />
              </video>
              <span className="holo-sheen" aria-hidden="true" />
            </div>

            {/* Profile Section */}
            <Card
              className="p-5 mb-5 rounded-xl transition-all duration-300"
              style={{
                backgroundColor: "#010101",
                border: "0.5px solid rgba(255,255,255,0.5)",
                boxShadow: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 32px rgba(60, 123, 255, 0.15)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-[#3C7BFF]">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.display_name || "User"} />
                    <AvatarFallback className="bg-[#010101] text-[#3C7BFF] text-xl font-bold">
                      {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Upload profile photo"
                  >
                    <Camera className="h-6 w-6 text-[#3C7BFF]" />
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
                  <h2 className="text-xl font-bold text-white mb-1">
                    {profile?.display_name || "Set your display name"}
                  </h2>
                  <p className="text-white/60 text-sm mb-1">{user.email}</p>
                  {profile?.thrill_username && (
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                      <p className="text-[#3C7BFF] font-semibold text-sm">Thrill: @{profile.thrill_username}</p>
                      {profile.thrill_username_verified && (
                        <div className="flex items-center gap-1 bg-[#3C7BFF]/20 px-2 py-0.5 rounded-md">
                          <CheckCircle className="h-3 w-3 text-[#3C7BFF]" />
                          <span className="text-xs text-[#3C7BFF] font-bold">VERIFIED</span>
                        </div>
                      )}
                    </div>
                  )}
                  {profile?.telegram_username && (
                    <p className="text-white/60 text-sm">Telegram: @{profile.telegram_username}</p>
                  )}
                  {isUploadingPhoto && <p className="text-xs text-white/60 mt-1">Uploading...</p>}
                </div>

                {!profile?.thrill_username_locked && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-[#3C7BFF] text-black hover:bg-[#5A93FF] font-bold rounded-xl text-sm px-4 py-2"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                )}
              </div>

              {isEditing && !profile?.thrill_username_locked && (
                <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="displayName" className="text-white/80 text-sm">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-[#010101] border-white/30 text-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="thrillUsername" className="text-white/80 text-sm">
                      Thrill Username
                    </Label>
                    <Input
                      id="thrillUsername"
                      value={thrillUsername}
                      onChange={(e) => setThrillUsername(e.target.value)}
                      placeholder="Your Thrill username (without @)"
                      className="bg-[#010101] border-white/30 text-white text-sm"
                      disabled={profile?.thrill_username_locked}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="telegramUsername" className="text-white/80 text-sm">
                      Telegram Username (optional)
                    </Label>
                    <Input
                      id="telegramUsername"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value)}
                      placeholder="Your Telegram username (without @)"
                      className="bg-[#010101] border-white/30 text-white text-sm"
                    />
                    <p className="text-xs text-white/50">Add your Telegram for support and community access</p>
                  </div>

                  {error && (
                    <div className="p-2 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-2 bg-green-900/20 border border-green-500/30 rounded text-green-400 text-sm">
                      {success}
                    </div>
                  )}

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full bg-[#3C7BFF] text-black hover:bg-[#5A93FF] font-bold rounded-xl"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </Card>

            {/* Main Bento Grid */}
            {profile?.thrill_username ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">

                {/* Wager Stats - spans 2 columns */}
                <Card
                  className="lg:col-span-2 p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-3 uppercase">Wager Stats</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-lg" style={{ background: "#010101", border: "0.5px solid rgba(255,255,255,0.3)" }}>
                      <p className="text-white/60 text-xs uppercase mb-1">24H</p>
                      <p className="text-xl font-bold" style={{ color: HOLO_CYAN }}>
                        {isLoadingDailyWager ? "..." : formatCurrency(dailyWager)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: "#010101", border: "0.5px solid rgba(255,255,255,0.3)" }}>
                      <p className="text-white/60 text-xs uppercase mb-1">7 Days</p>
                      <p className="text-xl font-bold" style={{ color: HOLO_PINK }}>
                        {isLoadingWagerHistory ? "..." : wagerHistory ? formatCurrency(wagerHistory.last7Days) : "$0"}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: "#010101", border: "0.5px solid rgba(255,255,255,0.3)" }}>
                      <p className="text-white/60 text-xs uppercase mb-1">30 Days</p>
                      <p className="text-xl font-bold" style={{ color: HOLO_GREEN }}>
                        {isLoadingWagerHistory ? "..." : wagerHistory ? formatCurrency(wagerHistory.last30Days) : "$0"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Leaderboard Stats */}
                <Card
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-3 uppercase">Leaderboard</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 text-sm">Your Rank:</span>
                      <span className="font-bold text-lg" style={{ color: HOLO_BLUE }}>
                        {isLoadingStats ? "..." : userStats ? `#${userStats.rank}` : "N/A"}
                      </span>
                    </div>
                    {userStats && userStats.rank > 1 && (
                      <div className="text-xs text-white/50">Keep wagering to move up!</div>
                    )}
                    {userStats && userStats.rank === 1 && (
                      <div className="text-xs font-bold" style={{ color: HOLO_YELLOW }}>You&apos;re #1!</div>
                    )}
                  </div>
                </Card>

                {/* Poker Night - spans 1 column */}
                <Card
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-2 uppercase">Poker Night</h3>
                  <p className="text-xs text-white/55 mb-3">Wager ${POKER_REQUIREMENT.toLocaleString()} monthly to qualify for the $1,000 tournament</p>
                  <Progress
                    value={Math.min((monthlyWager / POKER_REQUIREMENT) * 100, 100)}
                    className="h-3 mb-2"
                    style={{ background: "#1a1a1a" }}
                  />
                  <div className="flex justify-between text-xs">
                    <span className="text-white/55">
                      {formatCurrency(monthlyWager)} / {formatCurrency(POKER_REQUIREMENT)}
                    </span>
                    <span className="font-bold" style={{ color: HOLO_PURPLE }}>
                      {Math.min(Math.floor((monthlyWager / POKER_REQUIREMENT) * 100), 100)}%
                    </span>
                  </div>
                  {monthlyWager >= POKER_REQUIREMENT && (
                    <div className="mt-2 p-2 rounded text-xs text-center font-bold" style={{ background: `${HOLO_GREEN}15`, border: `1px solid ${HOLO_GREEN}40`, color: HOLO_GREEN }}>
                      QUALIFIED FOR THIS MONTH
                    </div>
                  )}
                  <div className="flex justify-center gap-3 mt-3">
                    {[
                      { label: "DAYS", value: pokerCountdown.days },
                      { label: "HRS",  value: pokerCountdown.hours },
                      { label: "MIN",  value: pokerCountdown.minutes },
                      { label: "SEC",  value: pokerCountdown.seconds },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-lg font-bold" style={{ color: HOLO_CYAN }}>{String(item.value).padStart(2, "0")}</div>
                        <div className="text-xs text-white/50">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Social Links Card - next to Poker card */}
                <Card
                  className="lg:col-span-2 p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-4 uppercase">Find Mandy</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Telegram Channel",    href: "https://t.me/mandygg",             color: HOLO_CYAN,   desc: "Announcements & updates" },
                      { label: "Telegram Group",       href: "https://t.me/mandyggchat",          color: HOLO_BLUE,   desc: "Community chat" },
                      { label: "Discord",              href: "https://discord.gg/mandygg",        color: HOLO_PURPLE, desc: "Gaming & hangouts" },
                      { label: "Kick",                 href: "https://kick.com/mandycalmdown",    color: HOLO_GREEN,  desc: "Live streams" },
                      { label: "Twitter / X",          href: "https://twitter.com/mandycalmdown", color: HOLO_PINK,   desc: "Hot takes & degen content" },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-200 no-underline"
                        style={{ background: "#010101", border: `0.5px solid ${link.color}40` }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.color; e.currentTarget.style.boxShadow = `0 0 8px ${link.color}25` }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${link.color}40`; e.currentTarget.style.boxShadow = "none" }}
                      >
                        <div>
                          <span className="text-sm font-bold text-white block">{link.label}</span>
                          <span className="text-xs text-white/50">{link.desc}</span>
                        </div>
                        <span className="text-xs font-bold ml-2" style={{ color: link.color }}>→</span>
                      </a>
                    ))}
                  </div>
                </Card>

                {/* Raffle Section - full width */}
                <Card
                  className="lg:col-span-3 p-4 rounded-xl transition-all duration-300 relative overflow-hidden"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Left side - Info and Stats */}
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2 uppercase">
                        Weekly $250 Raffle
                      </h3>
                      <p className="text-xs text-white/55 mb-3">Wager $500 = 1 ticket. Drawing every Friday at midnight UTC.</p>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/55">Your Tickets:</span>
                          <span className="font-bold" style={{ color: HOLO_PINK }}>{raffleTickets.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/55">Progress to Next:</span>
                          <span className="font-bold" style={{ color: HOLO_CYAN }}>
                            {formatCurrency(wagerTowardNext)} / {formatCurrency(TICKET_INTERVAL)}
                          </span>
                        </div>
                      </div>

                      <Progress value={progressPercent} className="h-2 mb-3" style={{ background: "#1a1a1a" }} />

                      {/* Countdown */}
                      <div className="mb-3">
                        <p className="text-xs text-white/50 mb-2 text-center">Next Drawing:</p>
                        <div className="flex justify-center gap-3">
                          {[
                            { label: "D", value: raffleCountdown.days },
                            { label: "H", value: raffleCountdown.hours },
                            { label: "M", value: raffleCountdown.minutes },
                            { label: "S", value: raffleCountdown.seconds },
                          ].map((item) => (
                            <div key={item.label} className="text-center rounded px-2 py-1" style={{ background: "#010101", border: "0.5px solid rgba(255,255,255,0.3)" }}>
                              <div className="text-base font-bold" style={{ color: HOLO_PURPLE }}>{String(item.value).padStart(2, "0")}</div>
                              <div className="text-xs text-white/50">{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Holo Button */}
                      <Link href="/raffle" className="block">
                        <button className="holo-button w-full">
                          <video autoPlay loop muted playsInline aria-hidden="true" className="holo-btn__video">
                            <source src={HOLO_BTN_WEBM} type="video/webm" />
                            <source src={HOLO_BTN_MP4} type="video/mp4" />
                          </video>
                          <span className="holo-btn__label">VIEW RAFFLE PAGE</span>
                        </button>
                      </Link>
                    </div>

                    {/* Right side - Raffle Tickets Image (no glow) */}
                    <div className="flex items-center justify-center">
                      <img
                        src={RAFFLE_IMAGE}
                        alt="Raffle Tickets"
                        className="w-full max-w-xs h-auto"
                      />
                    </div>
                  </div>
                </Card>

                {/* Need Help Box */}
                <Card
                  className="p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-2 uppercase">Need Help?</h3>
                  <p className="text-sm text-white/55 mb-3">Get instant support from our Telegram bot</p>
                  <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="block">
                    <button className="holo-button w-full">
                      <video autoPlay loop muted playsInline aria-hidden="true" className="holo-btn__video">
                        <source src={HOLO_BTN_WEBM} type="video/webm" />
                        <source src={HOLO_BTN_MP4} type="video/mp4" />
                      </video>
                      <span className="holo-btn__label">GET SUPPORT</span>
                    </button>
                  </a>
                </Card>

                {/* Chat with Community */}
                <Card
                  className="lg:col-span-2 p-4 rounded-xl transition-all duration-300"
                  style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)", boxShadow: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite" }}
                  onMouseLeave={(e) => { e.currentTarget.style.animation = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-2 uppercase">Join the Community</h3>
                  <p className="text-sm text-white/55 mb-3">Come chat with likeminded weirdos in the MandyGG Telegram</p>
                  <a href="https://t.me/mandyggchat" target="_blank" rel="noopener noreferrer" className="block">
                    <button className="holo-button w-full">
                      <video autoPlay loop muted playsInline aria-hidden="true" className="holo-btn__video">
                        <source src={HOLO_BTN_WEBM} type="video/webm" />
                        <source src={HOLO_BTN_MP4} type="video/mp4" />
                      </video>
                      <span className="holo-btn__label">JOIN TELEGRAM</span>
                    </button>
                  </a>
                </Card>
              </div>
            ) : (
              <Card
                className="p-6 rounded-xl mb-5 text-center"
                style={{ backgroundColor: "#010101", border: "0.5px solid rgba(255,255,255,0.5)" }}
              >
                  <p className="text-white/80 text-base mb-3">
                  Add your Thrill username to see your stats and leaderboard position!
                </p>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-[#3C7BFF] text-black hover:bg-[#5A93FF] font-bold rounded-xl"
                >
                  Add Thrill Username
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

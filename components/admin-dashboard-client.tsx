"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import {
  CheckCircle,
  Search,
  Trophy,
  AlertTriangle,
  Users,
  Gift,
  Settings,
  Bell,
  Gamepad2,
  RefreshCw,
  Calendar,
  Clock,
  Calculator,
  Ticket,
} from "lucide-react"
import { SiteNavigation } from "@/components/site-navigation"
import { UserManagementSection } from "@/components/user-management-section"
import { RewardsManagementSection } from "@/components/rewards-management-section"
import { captureQualifiersAction, unlinkAllAccountsAction } from "@/app/actions/admin-actions"

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

interface PokerQualifier {
  id: string
  user_id: string | null
  thrill_username: string
  display_name: string | null
  monthly_wager: number
  qualification_date: string
  poker_night_date: string
  created_at: string
}

interface TickerSettings {
  text_color: string
  background_color: string
  background_gradient: string
  speed: number
  font_family: string
  font_size: string
  font_weight: string
  ticker_1_text: string
  ticker_2_text: string
  ticker_3_text: string
  }

interface Announcement {
  id: string
  message: string
  is_active: boolean
  created_at: string
}

interface AdminDashboardClientProps {
  user: User
  profiles: Profile[]
}

export function AdminDashboardClient({ user, profiles: initialProfiles }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "users" | "daily" | "custom" | "rewards" | "announcements" | "poker" | "raffle" | "settings"
  >("users")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [searchQuery, setSearchQuery] = useState("")
  const [userStats, setUserStats] = useState<Record<string, PlayerStats>>({})
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"current">("current")
  const [isUnlinkingAll, setIsUnlinkingAll] = useState(false)
  const [pokerQualifiers, setPokerQualifiers] = useState<PokerQualifier[]>([])
  const [isLoadingQualifiers, setIsLoadingQualifiers] = useState(false)
  const [pokerNightDate, setPokerNightDate] = useState<string>("")
  const [isCapturingQualifiers, setIsCapturingQualifiers] = useState(false)

  // Raffle state
  const [raffleDate, setRaffleDate] = useState(new Date().toISOString().split("T")[0])
  const [raffleTickets, setRaffleTickets] = useState<any[]>([])
  const [raffleWinner, setRaffleWinner] = useState<any>(null)
  const [recentRaffleWinners, setRecentRaffleWinners] = useState<any[]>([])
  const [isLoadingRaffle, setIsLoadingRaffle] = useState(false)
  const [raffleIssueUserId, setRaffleIssueUserId] = useState("")
  const [raffleIssueCount, setRaffleIssueCount] = useState("")
  const [winnerTicketNumber, setWinnerTicketNumber] = useState("")
  const [prizeAmount, setPrizeAmount] = useState("")
  const [prizeDescription, setPrizeDescription] = useState("Weekly Raffle Prize — $250")
  const [raffleSettings, setRaffleSettings] = useState({ prize_amount: 250, tickets_per_wager: 500, is_active: true })
  const [isSavingRaffleSettings, setIsSavingRaffleSettings] = useState(false)
  const [raffleWagerAmount, setRaffleWagerAmount] = useState("")
  const [raffleStatus, setRaffleStatus] = useState<string | null>(null)
  const [tickerSettings, setTickerSettings] = useState<TickerSettings>({
    text_color: "#ffffff",
    background_color: "#6366f1",
    background_gradient: "linear-gradient(to right, #6366f1, #a855f7, #6366f1)",
    speed: 8000,
    font_family: "inherit",
    font_size: "1rem",
    font_weight: "bold",
    ticker_1_text: "",
    ticker_2_text: "",
    ticker_3_text: "",
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [tickerTableExists, setTickerTableExists] = useState(true)
  const [dailyLeaderboard, setDailyLeaderboard] = useState<Array<{ username: string; wager: number; rank: number }>>([])
  const [isLoadingDailyLeaderboard, setIsLoadingDailyLeaderboard] = useState(false)
  const [dailyDateRange, setDailyDateRange] = useState<{ fromDate: string; toDate: string } | null>(null)
  const [dailyLastUpdated, setDailyLastUpdated] = useState<number | null>(null)

  const [isForceRefreshing, setIsForceRefreshing] = useState(false)
  const [forceRefreshStatus, setForceRefreshStatus] = useState<string | null>(null)

  const [customFromDate, setCustomFromDate] = useState("")
  const [customToDate, setCustomToDate] = useState("")
  const [customStats, setCustomStats] = useState<any[]>([])
  const [isLoadingCustomStats, setIsLoadingCustomStats] = useState(false)
  const [customStatsError, setCustomStatsError] = useState<string | null>(null)
  const [customStatsDateRange, setCustomStatsDateRange] = useState<{ fromDate: string; toDate: string } | null>(null)

  const [cstDate, setCstDate] = useState("")
  const [cstTime, setCstTime] = useState("")
  const [cstAmPm, setCstAmPm] = useState<"AM" | "PM">("AM")
  const [convertedUtc, setConvertedUtc] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Fetch user stats
  useEffect(() => {
    async function fetchAllUserStats() {
      const usersWithThrill = profiles.filter((p) => p.thrill_username)
      if (usersWithThrill.length === 0) return

      setIsLoadingStats(true)
      const statsMap: Record<string, PlayerStats> = {}

      try {
        const response = await fetch(`/api/leaderboard?period=${selectedPeriod}`)
        const data = await response.json()

        if (response.ok && data.leaderboard) {
          data.leaderboard.forEach((player: PlayerStats) => {
            statsMap[player.username.toLowerCase()] = player
          })
        }

        setUserStats(statsMap)
      } catch (error) {
        console.error("[v0] Error fetching user stats:", error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchAllUserStats()
  }, [profiles, selectedPeriod])

  // Fetch poker qualifiers
  useEffect(() => {
    async function fetchPokerQualifiers() {
      setIsLoadingQualifiers(true)
      try {
        const response = await fetch("/api/poker-qualifiers")
        const data = await response.json()

        if (response.ok) {
          setPokerQualifiers(data.qualifiers || [])
          setPokerNightDate(data.pokerNightDate || "")
        }
      } catch (error) {
        console.error("[v0] Error fetching poker qualifiers:", error)
      } finally {
        setIsLoadingQualifiers(false)
      }
    }

    fetchPokerQualifiers()
  }, [])

  // Fetch ticker settings and announcements on mount
  useEffect(() => {
    fetchTickerSettings()
    // fetchAllAnnouncements() // Moved to below

  }, [])

  const fetchDailyLeaderboard = async (force = false) => {
    setIsLoadingDailyLeaderboard(true)
    try {
      const response = await fetch(`/api/daily-leaderboard?uncensored=true${force ? "&force=true" : ""}`)
      const data = await response.json()

      if (response.ok && data.leaderboard) {
        setDailyLeaderboard(data.leaderboard)
        setDailyDateRange(data.dateRange)
        setDailyLastUpdated(data.lastUpdated || Date.now())
      }
    } catch (error) {
      console.error("[v0] Error fetching daily leaderboard:", error)
    } finally {
      setIsLoadingDailyLeaderboard(false)
    }
  }

  useEffect(() => {
    // fetchDailyLeaderboard() // Moved to below

    const interval = setInterval(() => {
      if (activeTab === "daily") {
        fetchDailyLeaderboard()
      }
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [activeTab])

  // Fetch raffle data when raffle tab is active or date changes
  useEffect(() => {
    if (activeTab === "raffle") {
      fetchRaffleData()
    }
  }, [activeTab, raffleDate])

  async function fetchRaffleData() {
    setIsLoadingRaffle(true)
    try {
      const res = await fetch(`/api/admin/raffle?week=${raffleDate}`)
      const data = await res.json()
      setRaffleTickets(data.stats?.entries || [])
      setRaffleWinner(data.winner || null)
      setRecentRaffleWinners(data.recentWinners || [])
      if (data.settings) setRaffleSettings(data.settings)
    } catch (err) {
      console.error("[v0] Error fetching raffle data:", err)
    } finally {
      setIsLoadingRaffle(false)
    }
  }

  async function handleIssueTickets() {
    if (!raffleIssueUserId || (!raffleIssueCount && !raffleWagerAmount)) return
    setRaffleStatus(null)
    try {
      const body: Record<string, any> = {
        action: "issue_tickets",
        userId: raffleIssueUserId,
        raffleWeek: raffleDate,
      }
      if (raffleWagerAmount) {
        body.wagerAmount = parseFloat(raffleWagerAmount)
      } else {
        body.ticketCount = parseInt(raffleIssueCount)
        body.wagerAmount = parseInt(raffleIssueCount) * 500 // derive wager from tickets
      }
      const res = await fetch("/api/admin/raffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.success) {
        setRaffleStatus(`Issued ${data.ticketCount} ticket(s) for week of ${data.weekFriday}!`)
        setRaffleIssueUserId("")
        setRaffleIssueCount("")
        setRaffleWagerAmount("")
        fetchRaffleData()
      } else {
        setRaffleStatus(`Error: ${data.error}`)
      }
    } catch (err) {
      setRaffleStatus("Error issuing tickets")
    }
  }

  async function handlePickWinner() {
    setRaffleStatus(null)
    try {
      // Use run_draw for auto-random, or pick_winner for manual
      const isManual = winnerTicketNumber.trim() !== ""
      const res = await fetch("/api/admin/raffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isManual ? "pick_winner" : "run_draw",
          raffle_week: raffleDate,
          winnerTicketNumber: isManual ? parseInt(winnerTicketNumber) : undefined,
          prizeAmount: parseFloat(prizeAmount) || raffleSettings.prize_amount,
          prizeDescription,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRaffleStatus(isManual ? `Winner set: Ticket #${winnerTicketNumber}` : `Draw complete! Winner: ${data.winner?.thrill_username || "unknown"}`)
        setWinnerTicketNumber("")
        setPrizeAmount("")
        fetchRaffleData()
      } else {
        setRaffleStatus(`Error: ${data.error}`)
      }
    } catch (err) {
      setRaffleStatus("Error running draw")
    }
  }

  async function handleRaffleSettingsSave() {
    setIsSavingRaffleSettings(true)
    setRaffleStatus(null)
    try {
      const res = await fetch("/api/admin/raffle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prize_amount:      raffleSettings.prize_amount,
          tickets_per_wager: raffleSettings.tickets_per_wager,
          is_active:         raffleSettings.is_active,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRaffleStatus("Settings saved!")
      } else {
        setRaffleStatus(`Error: ${data.error}`)
      }
    } catch {
      setRaffleStatus("Error saving settings")
    } finally {
      setIsSavingRaffleSettings(false)
    }
  }

  async function handleMarkClaimed() {
    setRaffleStatus(null)
    try {
      const res = await fetch("/api/admin/raffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_claimed", raffleDate }),
      })
      const data = await res.json()
      if (data.success) {
        setRaffleStatus("Prize marked as claimed!")
        fetchRaffleData()
      } else {
        setRaffleStatus(`Error: ${data.error}`)
      }
    } catch {
      setRaffleStatus("Error marking claimed")
    }
  }

  useEffect(() => {
    fetchTickerSettings()
    fetchAllAnnouncements()
    fetchDailyLeaderboard() // Fetch initial daily leaderboard data
  }, [])

  const fetchTickerSettings = async () => {
    try {
      const response = await fetch("/api/ticker-settings")
      const data = await response.json()
      if (data.settings) {
        setTickerSettings(data.settings)
      }
      if (data.tableExists === false) {
        setTickerTableExists(false)
      }
    } catch (error) {
      console.error("[v0] Error fetching ticker settings:", error)
    }
  }

  const fetchAllAnnouncements = async () => {
    setIsLoadingAnnouncements(true)
    try {
      const response = await fetch("/api/announcements/all")
      const data = await response.json()
      if (data.announcements) {
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      console.error("[v0] Error fetching announcements:", error)
    } finally {
      setIsLoadingAnnouncements(false)
    }
  }

  const handleForceRefresh = async () => {
    setIsForceRefreshing(true)
    setForceRefreshStatus("Refreshing...")

    try {
      const response = await fetch("/api/admin/force-refresh", { method: "POST" })
      const data = await response.json()

      if (response.ok && data.success) {
        setForceRefreshStatus("Stats refreshed successfully!")
        // Reload all data
        window.location.reload()
      } else {
        setForceRefreshStatus(data.message || "Failed to refresh stats")
      }
    } catch (error) {
      console.error("[v0] Force refresh error:", error)
      setForceRefreshStatus("Error refreshing stats")
    } finally {
      setIsForceRefreshing(false)
      setTimeout(() => setForceRefreshStatus(null), 5000)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleCaptureQualifiers = async () => {
    if (
      !confirm(
        "This will capture all players who have met the $50,000 wagering requirement for the upcoming poker night. Continue?",
      )
    ) {
      return
    }

    setIsCapturingQualifiers(true)

    try {
      const result = await captureQualifiersAction()

      if (result.success) {
        alert(`Success! Captured ${result.data.count} qualified players for poker night.`)
        setPokerQualifiers(result.data.qualifiers || [])
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Error capturing qualifiers:", error)
      alert("An error occurred while capturing qualifiers.")
    } finally {
      setIsCapturingQualifiers(false)
    }
  }

  const handleUnlinkAll = async () => {
    if (!confirm("Are you sure you want to unlink ALL Thrill accounts? This action cannot be undone.")) {
      return
    }

    setIsUnlinkingAll(true)

    try {
      const result = await unlinkAllAccountsAction()

      if (result.success) {
        alert(`Success! Unlinked ${result.data.count} accounts.`)
        router.refresh()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Error unlinking all accounts:", error)
      alert("An error occurred while unlinking accounts.")
    } finally {
      setIsUnlinkingAll(false)
    }
  }

  const handleSaveTickerSettings = async () => {
    if (!tickerTableExists) {
      alert(
        "Cannot save settings: ticker_settings table not found. Please run scripts/004_add_ticker_settings.sql first.",
      )
      return
    }

    setIsSavingSettings(true)
    try {
      const response = await fetch("/api/ticker-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tickerSettings),
      })

      const data = await response.json()

      if (data.tableExists === false) {
        setTickerTableExists(false)
        alert(
          "Cannot save settings: ticker_settings table not found. Please run the SQL script{" +
            " scripts/004_add_ticker_settings.sql" +
            "} to enable customization.",
        )
        return
      }

      if (response.ok) {
        alert("Ticker settings saved successfully!")
      } else {
        alert("Failed to save ticker settings")
      }
    } catch (error) {
      console.error("[v0] Error saving ticker settings:", error)
      alert("An error occurred while saving settings")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      alert("Please enter an announcement message")
      return
    }

    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newAnnouncement }),
      })

      if (response.ok) {
        setNewAnnouncement("")
        fetchAllAnnouncements()
        alert("Announcement created successfully!")
      } else {
        alert("Failed to create announcement")
      }
    } catch (error) {
      console.error("[v0] Error creating announcement:", error)
      alert("An error occurred while creating announcement")
    }
  }

  const handleToggleAnnouncement = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/announcements/toggle", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      })

      if (response.ok) {
        fetchAllAnnouncements()
      } else {
        alert("Failed to toggle announcement")
      }
    } catch (error) {
      console.error("[v0] Error toggling announcement:", error)
      alert("An error occurred while toggling announcement")
    }
  }

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return
    }

    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchAllAnnouncements()
        alert("Announcement deleted successfully!")
      } else {
        alert("Failed to delete announcement")
      }
    } catch (error) {
      console.error("[v0] Error deleting announcement:", error)
      alert("An error occurred while deleting announcement")
    }
  }

  const fetchCustomStats = async () => {
    if (!customFromDate || !customToDate) {
      setCustomStatsError("Please select both start and end dates")
      return
    }

    setIsLoadingCustomStats(true)
    setCustomStatsError(null)

    try {
      // The API expects toDate to be exclusive, so we add 1 day
      const toDatePlusOne = new Date(customToDate)
      toDatePlusOne.setDate(toDatePlusOne.getDate() + 1)
      const adjustedToDate = toDatePlusOne.toISOString().split("T")[0]

      const response = await fetch(
        `/api/daily-leaderboard?uncensored=true&force=true&fromDate=${customFromDate}&toDate=${adjustedToDate}`,
      )
      const data = await response.json()

      if (data.error) {
        setCustomStatsError(data.error)
      } else {
        setCustomStats(data.leaderboard || [])
        setCustomStatsDateRange({ fromDate: customFromDate, toDate: customToDate })
      }
    } catch (error) {
      setCustomStatsError("Failed to fetch custom stats")
    } finally {
      setIsLoadingCustomStats(false)
    }
  }

  const convertCstToUtc = () => {
    if (!cstDate || !cstTime) {
      setConvertedUtc(null)
      return
    }

    try {
      // Parse the CST time
      let hour = Number.parseInt(cstTime.split(":")[0])
      const minute = Number.parseInt(cstTime.split(":")[1]) || 0

      // Convert 12-hour to 24-hour
      if (cstAmPm === "PM" && hour !== 12) {
        hour += 12
      } else if (cstAmPm === "AM" && hour === 12) {
        hour = 0
      }

      // Create date in CST
      const [year, month, day] = cstDate.split("-").map(Number)

      // CST is UTC-6, CDT is UTC-5
      // For simplicity, we'll assume CST (UTC-6) since that's what the user mentioned
      // In reality, you'd want to check if DST is in effect
      const cstOffsetHours = 6

      // Convert to UTC by adding 6 hours
      let utcHour = hour + cstOffsetHours
      let utcDay = day
      let utcMonth = month
      let utcYear = year

      if (utcHour >= 24) {
        utcHour -= 24
        utcDay += 1
        // Handle month overflow (simplified)
        const daysInMonth = new Date(utcYear, utcMonth, 0).getDate()
        if (utcDay > daysInMonth) {
          utcDay = 1
          utcMonth += 1
          if (utcMonth > 12) {
            utcMonth = 1
            utcYear += 1
          }
        }
      }

      const utcDateStr = `${utcYear}-${String(utcMonth).padStart(2, "0")}-${String(utcDay).padStart(2, "0")}`
      const utcTimeStr = `${String(utcHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} UTC`

      setConvertedUtc(`${utcDateStr} ${utcTimeStr}`)
    } catch (error) {
      setConvertedUtc("Invalid date/time")
    }
  }

  useEffect(() => {
    convertCstToUtc()
  }, [cstDate, cstTime, cstAmPm])

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchQuery.toLowerCase()
    return (
      profile.display_name?.toLowerCase().includes(query) ||
      profile.thrill_username?.toLowerCase().includes(query) ||
      profile.id.toLowerCase().includes(query) ||
      profile.pokernow_username?.toLowerCase().includes(query) ||
      profile.telegram_username?.toLowerCase().includes(query)
    )
  })

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatPokerNightDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
      timeZoneName: "short",
    })
  }

  const totalUsers = profiles.length
  const verifiedUsers = profiles.filter((p) => p.thrill_username_verified).length
  const totalLinks = profiles.filter((p) => p.thrill_username).length
  const totalWager = Object.values(userStats).reduce((sum, stats) => sum + stats.wager, 0)
  const totalPrizes = Object.values(userStats).reduce((sum, stats) => sum + stats.prize, 0)

  const tabs = [
    { id: "users" as const, label: "User Management", icon: Users },
    { id: "daily" as const, label: "24hr Race", icon: Clock }, // Added 24hr tab
    { id: "custom" as const, label: "Custom Stats", icon: Calculator }, // New tab
    { id: "rewards" as const, label: "Rewards", icon: Gift },
    { id: "announcements" as const, label: "Announcements", icon: Bell },
    { id: "poker" as const, label: "Poker Night", icon: Gamepad2 },
    { id: "raffle" as const, label: "Raffle", icon: Ticket },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="relative z-10">
        <SiteNavigation currentPage="admin" />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-500 mb-8 uppercase text-center">ADMIN DASHBOARD</h1>

          {/* Statistics Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card
              className="p-4 rounded-xl border border-teal-500/50 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
              }}
            >
              <p className="text-gray-400 text-xs uppercase mb-2">Total Users</p>
              <p className="text-3xl font-bold text-teal-500">{totalUsers}</p>
            </Card>
            <Card
              className="p-4 rounded-xl border border-teal-500/50 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
              }}
            >
              <p className="text-gray-400 text-xs uppercase mb-2">Verified</p>
              <p className="text-3xl font-bold text-green-500">{verifiedUsers}</p>
            </Card>
            <Card
              className="p-4 rounded-xl border border-teal-500/50 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
              }}
            >
              <p className="text-gray-400 text-xs uppercase mb-2">Linked</p>
              <p className="text-3xl font-bold text-blue-500">{totalLinks}</p>
            </Card>
            <Card
              className="p-4 rounded-xl border border-teal-500/50 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
              }}
            >
              <p className="text-gray-400 text-xs uppercase mb-2">Total Wager</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalWager)}</p>
            </Card>
            <Card
              className="p-4 rounded-xl border border-teal-500/50 text-center"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
              }}
            >
              <p className="text-gray-400 text-xs uppercase mb-2">Total Prizes</p>
              <p className="text-2xl font-bold text-yellow-500">{formatCurrency(totalPrizes)}</p>
            </Card>
          </div>

          <div className="flex justify-end mb-4">
            <Button
              onClick={handleForceRefresh}
              disabled={isForceRefreshing}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isForceRefreshing ? "animate-spin" : ""}`} />
              {isForceRefreshing ? "Refreshing..." : "Force Pull Stats"}
            </Button>
            {forceRefreshStatus && (
              <span
                className={`ml-4 text-sm self-center ${forceRefreshStatus.includes("success") ? "text-green-500" : "text-yellow-500"}`}
              >
                {forceRefreshStatus}
              </span>
            )}
          </div>

          {/* Tabbed Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 bg-[#1a1a1a] p-2 rounded-xl border border-teal-500/30">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold uppercase text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-teal-500 text-black shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Panels */}
          {activeTab === "users" && (
            <div className="space-y-6">
              {/* User Management Section */}
              <UserManagementSection profiles={filteredProfiles} onRefresh={() => router.refresh()} />

              {/* Unlink All Button */}
              <Button
                onClick={handleUnlinkAll}
                disabled={isUnlinkingAll || totalLinks === 0}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-lg py-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnlinkingAll ? "Unlinking All Accounts..." : `Unlink All Accounts (${totalLinks} linked)`}
              </Button>

              {/* Search Bar */}
              <Card
                className="p-4 rounded-xl border border-white/30"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15)",
                }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by display name, Thrill username, PokerNow username, Telegram username, or user ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-[#1a1a1a] border-[#333] text-white"
                  />
                </div>
              </Card>

              {/* User List */}
              {/* The detailed user cards with leaderboard rankings are no longer shown here */}
              {/* This section is now handled by UserManagementSection */}
            </div>
          )}

          {activeTab === "daily" && (
            <div className="space-y-6">
              <Card
                className="p-6 rounded-xl border border-amber-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.25)",
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-amber-500 uppercase mb-2">24 Hour Wager Race</h2>
                    <p className="text-gray-400 text-sm">
                      Top 20 players by wager amount today (Midnight UTC - Midnight UTC)
                    </p>
                    {dailyDateRange && (
                      <p className="text-gray-500 text-xs mt-1">
                        Date range: {dailyDateRange.fromDate} to {dailyDateRange.toDate}
                      </p>
                    )}
                    {dailyLastUpdated && (
                      <p className="text-amber-500/70 text-xs mt-1">
                        Last updated: {new Date(dailyLastUpdated).toLocaleString()} (auto-refreshes every 2 min)
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => fetchDailyLeaderboard(true)}
                    disabled={isLoadingDailyLeaderboard}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDailyLeaderboard ? "animate-spin" : ""}`} />
                    Force Refresh
                  </Button>
                </div>

                {isLoadingDailyLeaderboard ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mx-auto mb-2" />
                    <p className="text-gray-400">Loading daily leaderboard...</p>
                  </div>
                ) : dailyLeaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No wager data for today yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-amber-500/30">
                          <th className="text-left py-3 px-4 text-amber-500 font-bold uppercase text-sm">Rank</th>
                          <th className="text-left py-3 px-4 text-amber-500 font-bold uppercase text-sm">Username</th>
                          <th className="text-right py-3 px-4 text-amber-500 font-bold uppercase text-sm">
                            Wager (USD)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyLeaderboard.map((player, index) => (
                          <tr
                            key={player.username}
                            className={`border-b border-gray-800 ${index < 3 ? "bg-amber-500/10" : ""}`}
                          >
                            <td className="py-3 px-4">
                              <span
                                className={`font-bold ${
                                  index === 0
                                    ? "text-yellow-400"
                                    : index === 1
                                      ? "text-gray-300"
                                      : index === 2
                                        ? "text-amber-600"
                                        : "text-gray-400"
                                }`}
                              >
                                #{player.rank}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-white font-medium">{player.username}</td>
                            <td className="py-3 px-4 text-right text-amber-400 font-bold">
                              ${player.wager.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Daily Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-amber-500/30">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">Total Players</p>
                    <p className="text-2xl font-bold text-white">{dailyLeaderboard.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">Total Wagered</p>
                    <p className="text-2xl font-bold text-amber-500">
                      ${dailyLeaderboard.reduce((sum, p) => sum + p.wager, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">Top Wager</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      ${(dailyLeaderboard[0]?.wager || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs uppercase mb-1">Avg Wager</p>
                    <p className="text-2xl font-bold text-gray-300">
                      $
                      {dailyLeaderboard.length > 0
                        ? Math.round(
                            dailyLeaderboard.reduce((sum, p) => sum + p.wager, 0) / dailyLeaderboard.length,
                          ).toLocaleString()
                        : 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Custom Stats tab panel */}
          {activeTab === "custom" && (
            <div className="space-y-6">
              {/* Timezone Converter Card */}
              <Card
                className="p-6 rounded-xl border border-purple-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.25)",
                }}
              >
                <h2 className="text-xl font-bold text-purple-500 uppercase mb-4">CST to UTC Converter</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Convert your local CST time to UTC for API queries. The Thrill API only accepts dates (not times), so
                  use this to figure out which UTC dates to query.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Date (CST)</label>
                    <input
                      type="date"
                      value={cstDate}
                      onChange={(e) => setCstDate(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Time (CST)</label>
                    <input
                      type="text"
                      placeholder="HH:MM"
                      value={cstTime}
                      onChange={(e) => setCstTime(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">AM/PM</label>
                    <select
                      value={cstAmPm}
                      onChange={(e) => setCstAmPm(e.target.value as "AM" | "PM")}
                      className="w-full bg-[#1a1a1a] border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">UTC Result</label>
                    <div className="w-full bg-[#0a0a0a] border border-purple-500/50 rounded-lg px-4 py-2 text-purple-400 font-mono">
                      {convertedUtc || "Enter date/time"}
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-lg p-4 text-sm">
                  <p className="text-gray-400 mb-2">
                    <strong className="text-purple-400">Remember:</strong> The API uses exclusive end dates.
                  </p>
                  <p className="text-gray-400">
                    To get stats for Dec 2, 2025 (midnight to midnight UTC), query:
                    <code className="text-purple-400 ml-2">fromDate=2025-12-02 toDate=2025-12-03</code>
                  </p>
                </div>
              </Card>

              {/* Custom Stats Query Card */}
              <Card
                className="p-6 rounded-xl border border-cyan-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(6, 182, 212, 0.25)",
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-cyan-500 uppercase mb-2">Custom Date Range Stats</h2>
                    <p className="text-gray-400 text-sm">
                      Pull leaderboard stats for any date range. Dates are in UTC.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">From Date (UTC)</label>
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-cyan-500/30 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">To Date (UTC)</label>
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-cyan-500/30 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={fetchCustomStats}
                      disabled={isLoadingCustomStats || !customFromDate || !customToDate}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                    >
                      <Search className={`h-4 w-4 mr-2 ${isLoadingCustomStats ? "animate-spin" : ""}`} />
                      {isLoadingCustomStats ? "Loading..." : "Pull Stats"}
                    </Button>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-gray-400 text-sm">Quick presets:</span>
                  <button
                    onClick={() => {
                      const now = new Date()
                      const today = now.toISOString().split("T")[0]
                      setCustomFromDate(today)
                      setCustomToDate(today)
                    }}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date()
                      const yesterday = new Date(now)
                      yesterday.setDate(yesterday.getDate() - 1)
                      setCustomFromDate(yesterday.toISOString().split("T")[0])
                      setCustomToDate(yesterday.toISOString().split("T")[0])
                    }}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                  >
                    Yesterday
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date()
                      const weekAgo = new Date(now)
                      weekAgo.setDate(weekAgo.getDate() - 7)
                      setCustomFromDate(weekAgo.toISOString().split("T")[0])
                      setCustomToDate(now.toISOString().split("T")[0])
                    }}
                    className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30"
                  >
                    Last 7 Days
                  </button>

                </div>

                {customStatsError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-red-400">{customStatsError}</p>
                  </div>
                )}

                {customStatsDateRange && (
                  <p className="text-gray-500 text-xs mb-4">
                    Showing results for: {customStatsDateRange.fromDate} to {customStatsDateRange.toDate} (UTC)
                  </p>
                )}

                {isLoadingCustomStats ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-cyan-500 mx-auto mb-2" />
                    <p className="text-gray-400">Loading custom stats...</p>
                  </div>
                ) : customStats.length === 0 && customStatsDateRange ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No wager data found for this date range</p>
                  </div>
                ) : customStats.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-cyan-500/30">
                            <th className="text-left py-3 px-4 text-cyan-500 font-bold uppercase text-sm">Rank</th>
                            <th className="text-left py-3 px-4 text-cyan-500 font-bold uppercase text-sm">Username</th>
                            <th className="text-right py-3 px-4 text-cyan-500 font-bold uppercase text-sm">
                              Wager (USD)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {customStats.map((player, index) => (
                            <tr
                              key={player.username}
                              className={`border-b border-gray-800 ${index < 3 ? "bg-cyan-500/10" : ""}`}
                            >
                              <td className="py-3 px-4">
                                <span
                                  className={`font-bold ${
                                    index === 0
                                      ? "text-yellow-400"
                                      : index === 1
                                        ? "text-gray-300"
                                        : index === 2
                                          ? "text-amber-600"
                                          : "text-gray-400"
                                  }`}
                                >
                                  #{player.rank}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-white font-medium">{player.username}</td>
                              <td className="py-3 px-4 text-right text-cyan-400 font-bold">
                                ${player.wager.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-cyan-500/30">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase mb-1">Total Players</p>
                        <p className="text-2xl font-bold text-white">{customStats.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase mb-1">Total Wagered</p>
                        <p className="text-2xl font-bold text-cyan-500">
                          ${customStats.reduce((sum, p) => sum + p.wager, 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase mb-1">Top Wager</p>
                        <p className="text-2xl font-bold text-yellow-400">
                          ${(customStats[0]?.wager || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase mb-1">Avg Wager</p>
                        <p className="text-2xl font-bold text-gray-300">
                          $
                          {customStats.length > 0
                            ? Math.round(
                                customStats.reduce((sum, p) => sum + p.wager, 0) / customStats.length,
                              ).toLocaleString()
                            : 0}
                        </p>
                      </div>
                    </div>
                  </>
                ) : null}
              </Card>
            </div>
          )}

          {activeTab === "rewards" && (
            <div>
              <RewardsManagementSection />
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="space-y-6">
              {/* News Ticker Customization */}
              <Card
                className="p-6 rounded-xl border border-teal-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
                }}
              >
                <h2 className="text-2xl font-bold text-teal-500 uppercase mb-6">News Ticker Customization</h2>

                {/* Individual Ticker Text Controls */}
                <div className="mb-6 space-y-4">
                  <h3 className="text-lg font-bold text-white uppercase">Ticker Text (Individual)</h3>
                  <p className="text-xs text-gray-400">Each ticker can display its own message. Leave blank to use the default text.</p>
                  {[
                    { key: "ticker_1_text" as const, label: "Ticker 1 (Blue)", color: "#2A69DB" },
                    { key: "ticker_2_text" as const, label: "Ticker 2 (White)", color: "#FFFFFF" },
                    { key: "ticker_3_text" as const, label: "Ticker 3 (Neon)", color: "#CCFF00" },
                  ].map((ticker) => (
                    <div key={ticker.key}>
                      <Label className="text-white mb-1.5 block text-sm flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: ticker.color }}
                        />
                        {ticker.label}
                      </Label>
                      <Input
                        value={tickerSettings[ticker.key] || ""}
                        onChange={(e) =>
                          setTickerSettings({ ...tickerSettings, [ticker.key]: e.target.value })
                        }
                        placeholder="USE CODE MANDY ON THRILL.COM – USE CODE MANDY"
                        className="bg-[#1a1a1a] border-[#333] text-white"
                      />
                    </div>
                  ))}
                </div>

                {!tickerTableExists && (
                  <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-yellow-500 font-bold mb-1">Database Table Missing</p>
                      <p className="text-yellow-200 text-sm">
                        The ticker_settings table doesn't exist yet. Please run the SQL script{" "}
                        <code className="bg-black/30 px-2 py-0.5 rounded">scripts/004_add_ticker_settings.sql</code> to
                        enable customization.
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Preview */}
                <div className="mb-6">
                  <Label className="text-white mb-2 block">Live Preview</Label>
                  <div
                    className="w-full py-3 px-4 overflow-hidden relative rounded-lg"
                    style={{
                      background: tickerSettings.background_gradient || tickerSettings.background_color,
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative z-10 text-center">
                      <p
                        style={{
                          color: tickerSettings.text_color,
                          fontFamily: tickerSettings.font_family,
                          fontSize: tickerSettings.font_size,
                          fontWeight: tickerSettings.font_weight,
                        }}
                      >
                        {announcements.find((a) => a.is_active)?.message ||
                          "🎰 Get your $50,000 wager in by Sunday's deadline for Monthly Poker Night! 🃏"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Text Color */}
                  <div>
                    <Label htmlFor="text-color" className="text-white mb-2 block">
                      Text Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="text-color"
                        type="color"
                        value={tickerSettings.text_color}
                        onChange={(e) => setTickerSettings({ ...tickerSettings, text_color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={tickerSettings.text_color}
                        onChange={(e) => setTickerSettings({ ...tickerSettings, text_color: e.target.value })}
                        className="flex-1 bg-[#1a1a1a] border-[#333] text-white"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* Background Color */}
                  <div>
                    <Label htmlFor="bg-color" className="text-white mb-2 block">
                      Background Color
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={tickerSettings.background_color}
                        onChange={(e) => setTickerSettings({ ...tickerSettings, background_color: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={tickerSettings.background_color}
                        onChange={(e) => setTickerSettings({ ...tickerSettings, background_color: e.target.value })}
                        className="flex-1 bg-[#1a1a1a] border-[#333] text-white"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>

                  {/* Background Gradient */}
                  <div className="md:col-span-2">
                    <Label htmlFor="bg-gradient" className="text-white mb-2 block">
                      Background Gradient (CSS)
                    </Label>
                    <Input
                      id="bg-gradient"
                      type="text"
                      value={tickerSettings.background_gradient}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, background_gradient: e.target.value })}
                      className="bg-[#1a1a1a] border border-[#333] text-white"
                      placeholder="linear-gradient(to right, #6366f1, #a855f7, #6366f1)"
                    />
                  </div>

                  {/* Speed */}
                  <div>
                    <Label htmlFor="speed" className="text-white mb-2 block">
                      Speed (milliseconds)
                    </Label>
                    <Input
                      id="speed"
                      type="number"
                      value={tickerSettings.speed}
                      onChange={(e) =>
                        setTickerSettings({ ...tickerSettings, speed: Number.parseInt(e.target.value) || 8000 })
                      }
                      className="bg-[#1a1a1a] border border-[#333] text-white"
                      min="1000"
                      max="30000"
                      step="1000"
                    />
                  </div>

                  {/* Font Family */}
                  <div>
                    <Label htmlFor="font-family" className="text-white mb-2 block">
                      Font Family
                    </Label>
                    <Input
                      id="font-family"
                      type="text"
                      value={tickerSettings.font_family}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, font_family: e.target.value })}
                      className="bg-[#1a1a1a] border border-[#333] text-white"
                      placeholder="inherit"
                    />
                  </div>

                  {/* Font Size */}
                  <div>
                    <Label htmlFor="font-size" className="text-white mb-2 block">
                      Font Size
                    </Label>
                    <Input
                      id="font-size"
                      type="text"
                      value={tickerSettings.font_size}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, font_size: e.target.value })}
                      className="bg-[#1a1a1a] border border-[#333] text-white"
                      placeholder="1rem"
                    />
                  </div>

                  {/* Font Weight */}
                  <div>
                    <Label htmlFor="font-weight" className="text-white mb-2 block">
                      Font Weight
                    </Label>
                    <select
                      id="font-weight"
                      value={tickerSettings.font_weight}
                      onChange={(e) => setTickerSettings({ ...tickerSettings, font_weight: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] text-white rounded-md px-3 py-2"
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="600">Semi-Bold (600)</option>
                      <option value="700">Bold (700)</option>
                      <option value="800">Extra Bold (800)</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleSaveTickerSettings}
                  disabled={isSavingSettings || !tickerTableExists}
                  className="w-full bg-teal-500 hover:bg-teal-600 text-black font-bold uppercase rounded-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isSavingSettings
                    ? "Saving..."
                    : !tickerTableExists
                      ? "Table Not Found - Cannot Save"
                      : "Save Ticker Settings"}
                </Button>
              </Card>

              {/* Announcements Management */}
              <Card
                className="p-6 rounded-xl border border-teal-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
                }}
              >
                <h2 className="text-2xl font-bold text-teal-500 uppercase mb-6">Manage Announcements</h2>

                {/* Create New Announcement */}
                <div className="mb-6">
                  <Label htmlFor="new-announcement" className="text-white mb-2 block">
                    New Announcement
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="new-announcement"
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="Enter announcement message..."
                      className="flex-1 bg-[#1a1a1a] border-[#333] text-white"
                      rows={2}
                    />
                    <Button
                      onClick={handleCreateAnnouncement}
                      className="bg-teal-500 hover:bg-teal-600 text-black font-bold uppercase rounded-xl"
                    >
                      Create
                    </Button>
                  </div>
                </div>

                {/* Announcements List */}
                <div className="space-y-3">
                  {isLoadingAnnouncements ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Loading announcements...</p>
                    </div>
                  ) : announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className={`p-4 rounded-lg border transition-all ${
                          announcement.is_active
                            ? "bg-[#1a1a1a] border-teal-500/50"
                            : "bg-[#0a0a0a] border-gray-700 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-white mb-2">{announcement.message}</p>
                            <p className="text-xs text-gray-400">
                              Created: {new Date(announcement.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active)}
                              size="sm"
                              className={`${
                                announcement.is_active
                                  ? "bg-yellow-600 hover:bg-yellow-700"
                                  : "bg-teal-500 hover:bg-teal-600"
                              } text-white font-bold uppercase rounded-lg`}
                            >
                              {announcement.is_active ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              size="sm"
                              className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                      <p className="text-gray-400">No announcements yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "poker" && (
            <div>
              <Card
                className="p-6 rounded-xl border border-[#5cfec0]/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(92, 254, 192, 0.25)",
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#5cfec0] uppercase mb-2">Poker Night Qualifiers</h2>
                    {pokerNightDate && (
                      <p className="text-gray-400 text-sm">
                        Next Poker Night:{" "}
                        <span className="text-white font-semibold">{formatPokerNightDate(pokerNightDate)}</span>
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleCaptureQualifiers}
                    disabled={isCapturingQualifiers}
                    className="bg-[#5cfec0] hover:bg-[#4de8ad] text-black font-bold uppercase rounded-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isCapturingQualifiers ? "Capturing..." : "Capture Qualified Players"}
                  </Button>
                </div>

                {isLoadingQualifiers ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading qualified players...</p>
                  </div>
                ) : pokerQualifiers.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 mb-4">
                      <Trophy className="inline h-4 w-4 mr-1 text-[#5cfec0]" />
                      {pokerQualifiers.length} player{pokerQualifiers.length !== 1 ? "s" : ""} qualified for the $1,000
                      poker tournament
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {pokerQualifiers.map((qualifier) => (
                        <div
                          key={qualifier.id}
                          className="p-4 bg-[#1a1a1a] rounded-lg border border-[#5cfec0]/30 hover:border-[#5cfec0]/60 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-[#5cfec0]">
                              <AvatarFallback className="bg-[#0a0a0a] text-[#5cfec0] font-bold">
                                {qualifier.display_name?.charAt(0).toUpperCase() ||
                                  qualifier.thrill_username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold truncate">
                                {qualifier.display_name || qualifier.thrill_username}
                              </p>
                              <p className="text-[#5cfec0] text-sm">@{qualifier.thrill_username}</p>
                              <p className="text-gray-400 text-xs">{formatCurrency(qualifier.monthly_wager)} wagered</p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-[#5cfec0] flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                    <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No qualified players yet</p>
                    <p className="text-gray-500 text-sm mt-1">Players need to wager $50,000 to qualify</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === "raffle" && (
            <div className="space-y-6">
              {/* Date Selector */}
              <Card
                className="p-6 rounded-xl border border-teal-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
                }}
              >
                <h2 className="text-2xl font-bold uppercase mb-1" style={{ color: "#b5dc58" }}>Weekly Raffle Management</h2>
                <p className="text-xs uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em" }}>$250 prize — every Friday at midnight UTC — 1 ticket per $500 wagered</p>

                <div className="flex flex-wrap items-end gap-4 mb-4">
                  <div>
                    <Label className="text-xs uppercase mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Week (any date in the week)</Label>
                    <Input
                      type="date"
                      value={raffleDate}
                      onChange={(e) => setRaffleDate(e.target.value)}
                      className="bg-[#080c14] border-white/10 text-white w-48"
                    />
                  </div>
                  <Button
                    onClick={fetchRaffleData}
                    disabled={isLoadingRaffle}
                    className="font-bold rounded-xl text-black"
                    style={{ background: "#b5dc58" }}
                  >
                    {isLoadingRaffle ? "Loading..." : "Refresh"}
                  </Button>
                </div>

                {raffleStatus && (
                  <div className={`text-sm mb-4 p-2 rounded ${raffleStatus.includes("Error") ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                    {raffleStatus}
                  </div>
                )}

                {/* Current tickets summary */}
                <div className="rounded-lg border border-white/10 p-4 mb-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Total Tickets (week of {raffleDate})</span>
                    <span className="font-bold text-lg" style={{ color: "#b5dc58" }}>{raffleTickets.reduce((s: number, t: any) => s + (t.ticket_count || 1), 0)}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Unique Players</span>
                    <span className="font-bold text-lg" style={{ color: "#5ac3ff" }}>
                      {new Set(raffleTickets.map((t: any) => t.user_id)).size}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Total Wager Tracked</span>
                    <span className="font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
                      ${raffleTickets.reduce((s: number, t: any) => s + (t.ticket_count || 1), 0) * 500}
                    </span>
                  </div>
                  {raffleWinner && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="font-bold text-sm uppercase" style={{ color: "#b5dc58" }}>
                        Winner: Ticket #{raffleWinner.winning_ticket_number}
                        {raffleWinner.profiles?.thrill_username && ` (${raffleWinner.profiles.thrill_username})`}
                        {raffleWinner.claimed ? " — CLAIMED" : " — UNCLAIMED"}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Issue Tickets */}
              <Card
                className="p-6 rounded-xl border border-teal-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
                }}
              >
                <h3 className="text-xl font-bold uppercase mb-4" style={{ color: "#b5dc58" }}>Issue Tickets (Weekly)</h3>
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="text-gray-400 text-sm uppercase mb-1 block">User ID</Label>
                    <Input
                      value={raffleIssueUserId}
                      onChange={(e) => setRaffleIssueUserId(e.target.value)}
                      placeholder="Paste user UUID"
                      className="bg-[#111] border-teal-500/30 text-white"
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-gray-400 text-sm uppercase mb-1 block">Tickets</Label>
                    <Input
                      type="number"
                      min={1}
                      value={raffleIssueCount}
                      onChange={(e) => setRaffleIssueCount(e.target.value)}
                      placeholder="Count"
                      className="bg-[#111] border-teal-500/30 text-white"
                    />
                  </div>
                  <Button
                    onClick={handleIssueTickets}
                    disabled={!raffleIssueUserId || !raffleIssueCount}
                    className="font-bold rounded-xl text-black"
                    style={{ background: "#b5dc58" }}
                  >
                    Issue Tickets
                  </Button>
                </div>

                {/* Quick-issue from user list */}
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Quick select a user:</p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {profiles
                      .filter((p) => p.thrill_username_verified)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setRaffleIssueUserId(p.id)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            raffleIssueUserId === p.id
                              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                              : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {p.thrill_username || p.display_name || p.id.slice(0, 8)}
                        </button>
                      ))}
                  </div>
                </div>
              </Card>

              {/* Pick Winner */}
              <Card
                className="p-6 rounded-xl border border-amber-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.25)",
                }}
              >
                <h3 className="text-xl font-bold uppercase mb-1" style={{ color: "#ff94b4" }}>Draw Winner (Weekly)</h3>
                <p className="text-xs uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
                  Leave ticket # blank to auto-draw randomly weighted by ticket count
                </p>
                {raffleWinner ? (
                  <div className="space-y-3">
                    <div className="font-bold text-sm p-3 rounded" style={{ background: "rgba(181,220,88,0.1)", border: "1px solid rgba(181,220,88,0.3)", color: "#b5dc58" }}>
                      Winner drawn for week of {raffleDate}: Ticket #{raffleWinner.winning_ticket_number}
                      {raffleWinner.profiles?.thrill_username && ` — ${raffleWinner.profiles.thrill_username}`}
                      {" "}<span style={{ color: raffleWinner.claimed ? "#b5dc58" : "#ff94b4" }}>
                        ({raffleWinner.claimed ? "CLAIMED" : "UNCLAIMED"})
                      </span>
                    </div>
                    {!raffleWinner.claimed && (
                      <Button
                        onClick={handleMarkClaimed}
                        className="font-bold rounded-xl text-black"
                        style={{ background: "#b5dc58" }}
                      >
                        Mark as Claimed
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="w-40">
                        <Label className="text-xs uppercase mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Winning Ticket # (optional)</Label>
                        <Input
                          type="number"
                          value={winnerTicketNumber}
                          onChange={(e) => setWinnerTicketNumber(e.target.value)}
                          placeholder="Leave blank = auto"
                          className="bg-[#080c14] border-white/10 text-white"
                        />
                      </div>
                      <div className="w-36">
                        <Label className="text-xs uppercase mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Prize ($)</Label>
                        <Input
                          type="number"
                          value={prizeAmount}
                          onChange={(e) => setPrizeAmount(e.target.value)}
                          placeholder={String(raffleSettings.prize_amount)}
                          className="bg-[#080c14] border-white/10 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handlePickWinner}
                          className="font-bold rounded-xl text-black"
                          style={{ background: "#ff94b4" }}
                        >
                          {winnerTicketNumber ? "Set Winner" : "Auto Draw"}
                        </Button>
                      </div>
                    </div>

                    {raffleTickets.length > 0 && (
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Pool: {raffleTickets.reduce((s: number, t: any) => s + (t.ticket_count || 1), 0)} total tickets across {new Set(raffleTickets.map((t: any) => t.user_id)).size} players
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* All Tickets for Date */}
              <Card
                className="p-6 rounded-xl border border-teal-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
                }}
              >
                <h3 className="text-xl font-bold uppercase mb-4" style={{ color: "#5ac3ff" }}>Tickets for week of {raffleDate}</h3>
                {raffleTickets.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No tickets for this week.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {raffleTickets.map((ticket: any) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between px-3 py-2 rounded text-sm"
                        style={{
                          background: raffleWinner?.winning_ticket_number === ticket.ticket_number
                            ? "rgba(181,220,88,0.12)"
                            : "rgba(255,255,255,0.04)",
                          border: raffleWinner?.winning_ticket_number === ticket.ticket_number
                            ? "1px solid rgba(181,220,88,0.35)"
                            : "1px solid transparent",
                        }}
                      >
                        <span className="font-bold" style={{ color: "#b5dc58" }}>
                          {ticket.ticket_count || 1} ticket{(ticket.ticket_count || 1) > 1 ? "s" : ""}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>
                          {ticket.profiles?.thrill_username || ticket.profiles?.username || ticket.user_id.slice(0, 8)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Recent Winners */}
              <Card
                className="p-6 rounded-xl border border-white/10"
                style={{ backgroundColor: "rgba(8,12,20,0.98)" }}
              >
                <h3 className="text-xl font-bold uppercase mb-4" style={{ color: "#5ac3ff" }}>Past Winners</h3>
                {recentRaffleWinners.length === 0 ? (
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No winners yet. First draw every Friday at midnight UTC.</p>
                ) : (
                  <div className="space-y-2">
                    {recentRaffleWinners.map((winner: any) => (
                      <div key={winner.raffle_date} className="flex items-center justify-between px-3 py-2 rounded text-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-3">
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>{winner.raffle_date}</span>
                          <span className="font-bold" style={{ color: "#fff" }}>
                            {winner.profiles?.thrill_username || winner.profiles?.username || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold" style={{ color: "#b5dc58" }}>
                            ${winner.prize_amount ?? 250}
                          </span>
                          <span className="text-xs font-bold uppercase" style={{ color: winner.claimed ? "#b5dc58" : "#ff94b4" }}>
                            {winner.claimed ? "CLAIMED" : "UNCLAIMED"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Raffle Settings */}
              <Card
                className="p-6 rounded-xl border border-white/10"
                style={{ backgroundColor: "rgba(8,12,20,0.98)" }}
              >
                <h3 className="text-xl font-bold uppercase mb-1" style={{ color: "#b5dc58" }}>Raffle Settings</h3>
                <p className="text-xs uppercase mb-4" style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>Changes take effect for the next raffle cycle</p>
                <div className="flex flex-wrap items-end gap-4 mb-4">
                  <div className="w-36">
                    <Label className="text-xs uppercase mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>Prize Amount ($)</Label>
                    <Input
                      type="number"
                      value={raffleSettings.prize_amount}
                      onChange={(e) => setRaffleSettings((s) => ({ ...s, prize_amount: parseFloat(e.target.value) || 0 }))}
                      className="bg-[#080c14] border-white/10 text-white"
                    />
                  </div>
                  <div className="w-44">
                    <Label className="text-xs uppercase mb-1 block" style={{ color: "rgba(255,255,255,0.5)" }}>$ Wagered per Ticket</Label>
                    <Input
                      type="number"
                      value={raffleSettings.tickets_per_wager}
                      onChange={(e) => setRaffleSettings((s) => ({ ...s, tickets_per_wager: parseFloat(e.target.value) || 500 }))}
                      className="bg-[#080c14] border-white/10 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pb-1">
                    <input
                      type="checkbox"
                      id="raffleActive"
                      checked={raffleSettings.is_active}
                      onChange={(e) => setRaffleSettings((s) => ({ ...s, is_active: e.target.checked }))}
                      className="w-4 h-4 accent-[#b5dc58]"
                    />
                    <Label htmlFor="raffleActive" className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Raffle Active</Label>
                  </div>
                  <Button
                    onClick={handleRaffleSettingsSave}
                    disabled={isSavingRaffleSettings}
                    className="font-bold rounded-xl text-black"
                    style={{ background: "#b5dc58" }}
                  >
                    {isSavingRaffleSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Draw schedule: every Friday at 00:00:00 UTC. Current prize: ${raffleSettings.prize_amount} — 1 ticket per ${raffleSettings.tickets_per_wager} wagered.
                </p>
              </Card>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <Card
                className="p-6 rounded-xl border border-teal-500/50"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25)",
                }}
              >
                <h2 className="text-2xl font-bold text-teal-500 uppercase mb-6">Admin Settings</h2>
                <p className="text-gray-400 mb-4">Additional admin settings and configurations will be added here.</p>
              </Card>
            </div>
          )}
        </div>

        <footer className="px-4 mt-8 pb-4">
          <Card
            className="max-w-7xl mx-auto p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/30 transition-all duration-300 hover:scale-[1.01]"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15)",
            }}
          >
            <div className="text-center">
              <p className="text-sm text-gray-300 uppercase">© 2025 MANDY.GG ADMIN DASHBOARD</p>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  )
}

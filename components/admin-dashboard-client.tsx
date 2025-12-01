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
}

interface Announcement {
  id: string
  message: string
  is_active: boolean
  created_at: string
}

interface ChristmasRafflePlayer {
  username: string
  wager: number
  raffleTickets: number
  status: string
}

// Added AdventGift interface
interface AdventGift {
  id: string
  day: number
  title: string
  description: string
  reward: string
  image_url?: string
  updated_at: string
}

interface AdminDashboardClientProps {
  user: User
  profiles: Profile[]
}

export function AdminDashboardClient({ user, profiles: initialProfiles }: AdminDashboardClientProps) {
  // Updated activeTab type to include "advent"
  const [activeTab, setActiveTab] = useState<
    "users" | "rewards" | "announcements" | "poker" | "christmas" | "advent" | "settings"
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
  const [tickerSettings, setTickerSettings] = useState<TickerSettings>({
    text_color: "#ffffff",
    background_color: "#6366f1",
    background_gradient: "linear-gradient(to right, #6366f1, #a855f7, #6366f1)",
    speed: 8000,
    font_family: "inherit",
    font_size: "1rem",
    font_weight: "bold",
  })
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState("")
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [tickerTableExists, setTickerTableExists] = useState(true)
  const [christmasRafflePlayers, setChristmasRafflePlayers] = useState<ChristmasRafflePlayer[]>([])
  const [isLoadingChristmasRaffle, setIsLoadingChristmasRaffle] = useState(false)
  const [totalRaffleTickets, setTotalRaffleTickets] = useState(0)

  // Added advent gifts state
  const [adventGifts, setAdventGifts] = useState<AdventGift[]>([])
  const [isLoadingAdventGifts, setIsLoadingAdventGifts] = useState(false)
  const [editingGift, setEditingGift] = useState<AdventGift | null>(null)
  const [adventSaveStatus, setAdventSaveStatus] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // Fetch advent gifts when the "advent" tab is selected
  useEffect(() => {
    if (activeTab === "advent") {
      fetchAdventGifts()
    }
  }, [activeTab])

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

  useEffect(() => {
    fetchTickerSettings()
    fetchAllAnnouncements()
    fetchChristmasRaffle()
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

  const fetchChristmasRaffle = async () => {
    setIsLoadingChristmasRaffle(true)
    try {
      const response = await fetch("/api/christmas-raffle", {
        method: "POST",
      })
      const data = await response.json()

      if (response.ok && data.players) {
        setChristmasRafflePlayers(data.players)
        setTotalRaffleTickets(data.players.reduce((sum: number, p: ChristmasRafflePlayer) => sum + p.raffleTickets, 0))
      }
    } catch (err) {
      console.error("[v0] Error fetching Christmas raffle:", err)
    } finally {
      setIsLoadingChristmasRaffle(false)
    }
  }

  // Added fetchAdventGifts function
  const fetchAdventGifts = async () => {
    setIsLoadingAdventGifts(true)
    try {
      const response = await fetch("/api/advent-gifts")
      const data = await response.json()
      if (data.gifts) {
        setAdventGifts(data.gifts)
      }
    } catch (error) {
      console.error("Error fetching advent gifts:", error)
    } finally {
      setIsLoadingAdventGifts(false)
    }
  }

  // Added handleSaveAdventGift function
  const handleSaveAdventGift = async (gift: AdventGift) => {
    setAdventSaveStatus("Saving...")
    try {
      const response = await fetch("/api/advent-gifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          day: gift.day,
          title: gift.title,
          description: gift.description,
          reward: gift.reward,
          image_url: gift.image_url,
        }),
      })

      if (response.ok) {
        setAdventSaveStatus("Saved!")
        setEditingGift(null)
        fetchAdventGifts()
        setTimeout(() => setAdventSaveStatus(null), 2000)
      } else {
        setAdventSaveStatus("Error saving")
      }
    } catch (error) {
      console.error("Error saving advent gift:", error)
      setAdventSaveStatus("Error saving")
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

  // Added Advent Gifts tab to tabs array
  const tabs = [
    { id: "users" as const, label: "User Management", icon: Users },
    { id: "rewards" as const, label: "Rewards", icon: Gift },
    { id: "announcements" as const, label: "Announcements", icon: Bell },
    { id: "poker" as const, label: "Poker Night", icon: Gamepad2 },
    { id: "christmas" as const, label: "Christmas Raffle", icon: Gift },
    { id: "advent" as const, label: "Advent Gifts", icon: Calendar }, // Added Advent Gifts tab
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

          {activeTab === "christmas" && (
            <div className="space-y-6">
              <Card
                className="p-6 rounded-xl border"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  borderColor: "rgba(212, 175, 55, 0.5)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.25)",
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-3xl">🎄</span>
                  <h2 className="text-3xl font-bold text-[#D4AF37] uppercase">Christmas Raffle 2025</h2>
                  <span className="text-3xl">🎁</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Card
                    className="p-4 rounded-xl border border-[#D4AF37]/50 text-center"
                    style={{ backgroundColor: "rgba(20, 20, 20, 0.95)" }}
                  >
                    <p className="text-gray-400 text-xs uppercase mb-2">Total Participants</p>
                    <p className="text-3xl font-bold text-[#D4AF37]">
                      {isLoadingChristmasRaffle ? "..." : christmasRafflePlayers.length}
                    </p>
                  </Card>
                  <Card
                    className="p-4 rounded-xl border border-[#B91C1C]/50 text-center"
                    style={{ backgroundColor: "rgba(20, 20, 20, 0.95)" }}
                  >
                    <p className="text-gray-400 text-xs uppercase mb-2">Total Raffle Tickets</p>
                    <p className="text-3xl font-bold text-[#B91C1C]">
                      {isLoadingChristmasRaffle ? "..." : totalRaffleTickets}
                    </p>
                  </Card>
                </div>

                <p className="text-gray-400 text-sm text-center mb-4">
                  December 1-25, 2025 UTC | Every $1,000 wagered = 1 raffle ticket
                </p>

                {isLoadingChristmasRaffle ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin text-[#D4AF37] mx-auto" />
                    <p className="text-gray-400 mt-2">Loading raffle data...</p>
                  </div>
                ) : christmasRafflePlayers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No participants yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#D4AF37]/30">
                          <th className="text-left py-3 px-4 text-[#D4AF37] font-bold">#</th>
                          <th className="text-left py-3 px-4 text-[#D4AF37] font-bold">Username</th>
                          <th className="text-right py-3 px-4 text-[#D4AF37] font-bold">December Wager</th>
                          <th className="text-right py-3 px-4 text-[#D4AF37] font-bold">Raffle Tickets</th>
                        </tr>
                      </thead>
                      <tbody>
                        {christmasRafflePlayers.map((player, index) => (
                          <tr
                            key={player.username}
                            className="border-b border-white/10 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                            <td className="py-3 px-4 text-white font-medium">{player.username}</td>
                            <td className="py-3 px-4 text-right text-[#D4AF37]">{formatCurrency(player.wager)}</td>
                            <td className="py-3 px-4 text-right">
                              <span className="bg-[#B91C1C]/20 text-[#B91C1C] px-3 py-1 rounded-full font-bold">
                                {player.raffleTickets}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Added Advent Gifts tab panel */}
          {activeTab === "advent" && (
            <div className="space-y-6">
              <Card
                className="p-6 rounded-xl border"
                style={{
                  borderColor: "rgba(212, 175, 55, 0.5)",
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.15)",
                }}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold uppercase mb-2" style={{ color: "#D4AF37" }}>
                      Advent Calendar Gifts
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Manage the daily gifts for the Christmas advent calendar. Changes are live immediately.
                    </p>
                  </div>
                  {adventSaveStatus && (
                    <span
                      className={`text-sm font-medium ${adventSaveStatus === "Saved!" ? "text-green-500" : adventSaveStatus === "Saving..." ? "text-yellow-500" : "text-red-500"}`}
                    >
                      {adventSaveStatus}
                    </span>
                  )}
                </div>

                {isLoadingAdventGifts ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Loading advent gifts...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {adventGifts.map((gift) => (
                      <div
                        key={gift.id}
                        className="p-4 rounded-lg border transition-all hover:border-amber-500/50"
                        style={{
                          backgroundColor: "rgba(26, 26, 26, 0.8)",
                          borderColor:
                            editingGift?.day === gift.day ? "rgba(212, 175, 55, 0.6)" : "rgba(50, 50, 50, 0.5)",
                        }}
                      >
                        {editingGift?.day === gift.day ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl font-bold" style={{ color: "#D4AF37" }}>
                                Day {gift.day}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveAdventGift(editingGift)}
                                  style={{ backgroundColor: "#D4AF37", color: "#000" }}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingGift(null)}
                                  className="border-gray-600 text-gray-300"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                            <Input
                              value={editingGift.title}
                              onChange={(e) => setEditingGift({ ...editingGift, title: e.target.value })}
                              placeholder="Title"
                              className="bg-[#0a0a0a] border-gray-700 text-white"
                            />
                            <Textarea
                              value={editingGift.description}
                              onChange={(e) => setEditingGift({ ...editingGift, description: e.target.value })}
                              placeholder="Description"
                              className="bg-[#0a0a0a] border-gray-700 text-white min-h-[80px]"
                            />
                            <Input
                              value={editingGift.reward}
                              onChange={(e) => setEditingGift({ ...editingGift, reward: e.target.value })}
                              placeholder="Reward"
                              className="bg-[#0a0a0a] border-gray-700 text-white"
                            />
                            <Input
                              value={editingGift.image_url || ""}
                              onChange={(e) => setEditingGift({ ...editingGift, image_url: e.target.value })}
                              placeholder="Image URL (optional)"
                              className="bg-[#0a0a0a] border-gray-700 text-white"
                            />
                          </div>
                        ) : (
                          // View mode
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold" style={{ color: "#D4AF37" }}>
                                Day {gift.day}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingGift(gift)}
                                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                              >
                                Edit
                              </Button>
                            </div>
                            <h3 className="text-white font-semibold mb-1">{gift.title}</h3>
                            <p className="text-gray-400 text-sm mb-2 line-clamp-2">{gift.description}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-amber-500/60">✦</span>
                              <span className="text-amber-400 font-medium">{gift.reward}</span>
                            </div>
                            {gift.image_url && (
                              <p className="text-gray-500 text-xs mt-2 truncate">Image: {gift.image_url}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
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

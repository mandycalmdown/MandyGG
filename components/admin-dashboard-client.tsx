"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { CheckCircle, Lock, Search, Trophy, AlertTriangle } from "lucide-react"
import { SiteNavigation } from "@/components/site-navigation"
import { UserManagementSection } from "@/components/user-management-section"
import { RewardsManagementSection } from "@/components/rewards-management-section"

interface Profile {
  id: string
  thrill_username: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  thrill_username_verified: boolean
  thrill_username_locked: boolean
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
  user_id: string
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

interface AdminDashboardClientProps {
  user: User
  profiles: Profile[]
}

export function AdminDashboardClient({ user, profiles: initialProfiles }: AdminDashboardClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [searchQuery, setSearchQuery] = useState("")
  const [userStats, setUserStats] = useState<Record<string, PlayerStats>>({})
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "past">("current")
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
  const router = useRouter()
  const supabase = createClient()

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

    const adminKey = prompt("Enter admin key to confirm:")
    if (!adminKey) {
      return
    }

    setIsCapturingQualifiers(true)

    try {
      const response = await fetch("/api/poker-qualifiers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Success! Captured ${data.count} qualified players for poker night.`)
        setPokerQualifiers(data.qualifiers || [])
        router.refresh()
      } else {
        alert(`Error: ${data.error}`)
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

    const adminKey = prompt("Enter admin key to confirm:")
    if (!adminKey) {
      return
    }

    setIsUnlinkingAll(true)

    try {
      const response = await fetch("/api/unlink-all-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Success! Unlinked ${data.count} accounts.`)
        router.refresh()
      } else {
        alert(`Error: ${data.error}`)
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
          "Cannot save settings: ticker_settings table not found. Please run scripts/004_add_ticker_settings.sql first.",
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
      profile.id.toLowerCase().includes(query)
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

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="relative z-10">
        <SiteNavigation currentPage="admin" />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-teal-500 mb-8 uppercase text-center">ADMIN DASHBOARD</h1>

          {/* User Management Section */}
          <UserManagementSection profiles={filteredProfiles} onRefresh={() => router.refresh()} />

          {/* Rewards Management Section */}
          <RewardsManagementSection />

          {/* News Ticker Customization Section */}
          <Card
            className="p-6 mb-8 rounded-xl border border-teal-500/50"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
            }}
          >
            <h2 className="text-2xl font-bold text-teal-500 uppercase mb-6">News Ticker Customization</h2>

            {!tickerTableExists && (
              <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-yellow-500 font-bold mb-1">Database Table Missing</p>
                  <p className="text-yellow-200 text-sm">
                    The ticker_settings table doesn't exist yet. You can preview settings but cannot save them. Please
                    run the SQL script{" "}
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
                  className="bg-[#1a1a1a] border-[#333] text-white"
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
                  className="bg-[#1a1a1a] border-[#333] text-white"
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
                  className="bg-[#1a1a1a] border-[#333] text-white"
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
                  className="bg-[#1a1a1a] border-[#333] text-white"
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

          {/* Announcements Management Section */}
          <Card
            className="p-6 mb-8 rounded-xl border border-teal-500/50"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.25), 0 0 40px rgba(20, 184, 166, 0.15)",
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

          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-800/50 rounded-lg p-1 border border-white/20">
              <button
                onClick={() => setSelectedPeriod("current")}
                className={`px-4 py-2 rounded-md font-bold uppercase text-sm transition-all duration-200 ${
                  selectedPeriod === "current"
                    ? "bg-[#5cfec0] text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                Current Week
              </button>
              <button
                onClick={() => setSelectedPeriod("past")}
                className={`px-4 py-2 rounded-md font-bold uppercase text-sm transition-all duration-200 ${
                  selectedPeriod === "past"
                    ? "bg-[#5cfec0] text-black shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                Past Week
              </button>
            </div>
          </div>

          <Card
            className="p-6 mb-8 rounded-xl border border-[#5cfec0]/50"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(92, 254, 192, 0.25), 0 0 40px rgba(92, 254, 192, 0.15)",
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
                className="bg-[#5cfec0] hover:bg-[#4de8ad] text-black font-bold uppercase rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card
              className="p-6 rounded-xl border border-white/30 hover:border-[#5cfec0]/50 transition-all"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow:
                  "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
              }}
            >
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex items-center gap-4 lg:w-1/3">
                  <Avatar className="h-16 w-16 border-2 border-[#5cfec0]">
                    <AvatarImage src={profiles[0].avatar_url || undefined} alt={profiles[0].display_name || "User"} />
                    <AvatarFallback className="bg-[#1a1a1a] text-[#5cfec0] text-xl font-bold">
                      {profiles[0].display_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate">
                      {profiles[0].display_name || "No display name"}
                    </h3>
                    {profiles[0].thrill_username && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[#5cfec0] font-semibold">@{profiles[0].thrill_username}</p>
                        {profiles[0].thrill_username_verified && <CheckCircle className="h-4 w-4 text-[#5cfec0]" />}
                        {profiles[0].thrill_username_locked && <Lock className="h-4 w-4 text-[#5cfec0]" />}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Joined {formatDate(profiles[0].created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:w-2/3">
                  <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-xs uppercase mb-1">Rank</p>
                    <p className="text-xl font-bold text-[#5cfec0]">
                      #{userStats[profiles[0].thrill_username.toLowerCase()]?.rank}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-xs uppercase mb-1">Wager</p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(userStats[profiles[0].thrill_username.toLowerCase()]?.wager || 0)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-xs uppercase mb-1">XP</p>
                    <p className="text-xl font-bold text-indigo-400">
                      {formatNumber(userStats[profiles[0].thrill_username.toLowerCase()]?.xp || 0)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                    <p className="text-gray-400 text-xs uppercase mb-1">Prize</p>
                    <p className="text-xl font-bold text-[#5cfec0]">
                      {formatCurrency(userStats[profiles[0].thrill_username.toLowerCase()]?.prize || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="mb-6">
            <Button
              onClick={handleUnlinkAll}
              disabled={isUnlinkingAll || totalLinks === 0}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-lg py-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnlinkingAll ? "Unlinking All Accounts..." : `Unlink All Accounts (${totalLinks} linked)`}
            </Button>
          </div>

          <Card
            className="p-4 mb-6 rounded-xl border border-white/30"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by display name, Thrill username, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#333] text-white"
              />
            </div>
          </Card>

          <div className="space-y-4">
            {filteredProfiles.map((profile) => {
              const stats = profile.thrill_username ? userStats[profile.thrill_username.toLowerCase()] : null

              return (
                <Card
                  key={profile.id}
                  className="p-6 rounded-xl border border-white/30 hover:border-[#5cfec0]/50 transition-all"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow:
                      "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                  }}
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex items-center gap-4 lg:w-1/3">
                      <Avatar className="h-16 w-16 border-2 border-[#5cfec0]">
                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || "User"} />
                        <AvatarFallback className="bg-[#1a1a1a] text-[#5cfec0] text-xl font-bold">
                          {profile.display_name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">
                          {profile.display_name || "No display name"}
                        </h3>
                        {profile.thrill_username && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[#5cfec0] font-semibold">@{profile.thrill_username}</p>
                            {profile.thrill_username_verified && <CheckCircle className="h-4 w-4 text-[#5cfec0]" />}
                            {profile.thrill_username_locked && <Lock className="h-4 w-4 text-[#5cfec0]" />}
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">Joined {formatDate(profile.created_at)}</p>
                      </div>
                    </div>

                    {stats ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:w-2/3">
                        <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                          <p className="text-gray-400 text-xs uppercase mb-1">Rank</p>
                          <p className="text-xl font-bold text-[#5cfec0]">#{stats.rank}</p>
                        </div>
                        <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                          <p className="text-gray-400 text-xs uppercase mb-1">Wager</p>
                          <p className="text-xl font-bold text-white">{formatCurrency(stats.wager)}</p>
                        </div>
                        <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                          <p className="text-gray-400 text-xs uppercase mb-1">XP</p>
                          <p className="text-xl font-bold text-indigo-400">{formatNumber(stats.xp)}</p>
                        </div>
                        <div className="text-center p-3 bg-[#1a1a1a] rounded-lg border border-white/20">
                          <p className="text-gray-400 text-xs uppercase mb-1">Prize</p>
                          <p className="text-xl font-bold text-[#5cfec0]">{formatCurrency(stats.prize)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center lg:w-2/3 text-gray-400">
                        {profile.thrill_username
                          ? isLoadingStats
                            ? "Loading stats..."
                            : "Not on leaderboard"
                          : "No Thrill username linked"}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}

            {filteredProfiles.length === 0 && (
              <Card
                className="p-12 rounded-xl border border-white/30 text-center"
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                }}
              >
                <p className="text-gray-400 text-lg">No users found matching your search.</p>
              </Card>
            )}
          </div>
        </div>

        <footer className="px-4 mt-8 pb-4">
          <Card
            className="max-w-7xl mx-auto p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/30 transition-all duration-300 hover:scale-[1.01]"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
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

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
  Settings,
  Bell,
  Gamepad2,
  RefreshCw,
  Ticket,
  FileText,
  Megaphone,
  Bold,
  Italic,
  List,
  Image as ImageIcon,
  Save,
  Eye,
  X,
} from "lucide-react"
import { SiteNavigation } from "@/components/site-navigation"
import { UserManagementSection } from "@/components/user-management-section"
import { AdminSiteContentEditor } from "@/components/admin-site-content-editor"
import { captureQualifiersAction, unlinkAllAccountsAction } from "@/app/actions/admin-actions"
import { LayoutDashboard } from "lucide-react"

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

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image: string | null
  author_id: string
  is_published: boolean
  created_at: string
  updated_at: string
}

interface UpdatePost {
  id: string
  title: string
  description: string
  icon_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AdminDashboardClientProps {
  user: User
  profiles: Profile[]
}

export function AdminDashboardClient({ user, profiles: initialProfiles }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<
    "users" | "daily" | "custom" | "announcements" | "poker" | "raffle" | "blog" | "updates" | "settings"
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
  const [raffleWagerAmount, setRaffleWagerAmount] = useState("")
  const [winnerTicketNumber, setWinnerTicketNumber] = useState("")
  const [prizeAmount, setPrizeAmount] = useState("")
  const [prizeDescription, setPrizeDescription] = useState("Weekly Raffle Prize — $250")
  const [raffleSettings, setRaffleSettings] = useState({ prize_amount: 250, tickets_per_wager: 500, is_active: true })
  const [isSavingRaffleSettings, setIsSavingRaffleSettings] = useState(false)
  const [raffleStatus, setRaffleStatus] = useState<string | null>(null)
  
  const [tickerSettings, setTickerSettings] = useState<TickerSettings>({
    text_color: "#ffffff",
    background_color: "#3C7BFF",
    background_gradient: "linear-gradient(to right, #3C7BFF, #5A93FF, #3C7BFF)",
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

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoadingBlog, setIsLoadingBlog] = useState(false)
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null)
  const [blogTitle, setBlogTitle] = useState("")
  const [blogSlug, setBlogSlug] = useState("")
  const [blogContent, setBlogContent] = useState("")
  const [blogExcerpt, setBlogExcerpt] = useState("")
  const [blogFeaturedImage, setBlogFeaturedImage] = useState("")
  const [blogPublished, setBlogPublished] = useState(false)
  const [uploadingBlogImage, setUploadingBlogImage] = useState(false)

  // Updates state
  const [updatePosts, setUpdatePosts] = useState<UpdatePost[]>([])
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState<UpdatePost | null>(null)
  const [updateTitle, setUpdateTitle] = useState("")
  const [updateDescription, setUpdateDescription] = useState("")
  const [updateIcon, setUpdateIcon] = useState("")
  const [updateActive, setUpdateActive] = useState(true)
  const [uploadingUpdateIcon, setUploadingUpdateIcon] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  // (rest of the existing useEffects and functions like fetch stats, poker qualifiers, etc.)

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
    fetchDailyLeaderboard()
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
    const interval = setInterval(() => {
      if (activeTab === "daily") {
        fetchDailyLeaderboard()
      }
    }, 120000) // 2 minutes

    return () => clearInterval(interval)
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "raffle") {
      fetchRaffleData()
    }
  }, [activeTab, raffleDate])

  useEffect(() => {
    if (activeTab === "blog") {
      fetchBlogPosts()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "updates") {
      fetchUpdatePosts()
    }
  }, [activeTab])

  async function fetchBlogPosts() {
    setIsLoadingBlog(true)
    try {
      const res = await fetch("/api/admin/blog")
      const data = await res.json()
      if (data.posts) {
        setBlogPosts(data.posts)
      }
    } catch (err) {
      console.error("[v0] Error fetching blog posts:", err)
    } finally {
      setIsLoadingBlog(false)
    }
  }

  async function fetchUpdatePosts() {
    setIsLoadingUpdates(true)
    try {
      const res = await fetch("/api/admin/updates")
      const data = await res.json()
      if (data.updates) {
        setUpdatePosts(data.updates)
      }
    } catch (err) {
      console.error("[v0] Error fetching updates:", err)
    } finally {
      setIsLoadingUpdates(false)
    }
  }

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
    if (!raffleIssueUserId || !raffleWagerAmount) return
    setRaffleStatus(null)
    try {
      const body: Record<string, any> = {
        action: "issue_tickets",
        userId: raffleIssueUserId,
        raffleWeek: raffleDate,
        wagerAmount: parseFloat(raffleWagerAmount),
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
        setRaffleWagerAmount("")
        fetchRaffleData()
      } else {
        setRaffleStatus(`Error: ${data.error}`)
      }
    } catch (err) {
      setRaffleStatus("Error issuing tickets")
    }
  }

  async function handleDrawRaffleWinner() {
    setRaffleStatus(null)
    if (!confirm("This will randomly select a winner from all tickets. Continue?")) return

    try {
      const res = await fetch("/api/admin/raffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run_draw",
          raffle_week: raffleDate,
          prizeAmount: raffleSettings.prize_amount,
          prizeDescription,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setRaffleStatus(`Draw complete! Winner: ${data.winner?.thrill_username || "unknown"} (Ticket #${data.winner?.winning_ticket})`)
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
          prize_amount: raffleSettings.prize_amount,
          tickets_per_wager: raffleSettings.tickets_per_wager,
          is_active: raffleSettings.is_active,
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
    if (!confirm("This will capture all players who have met the $50,000 wagering requirement for the upcoming poker night. Continue?")) {
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
      alert("Cannot save settings: ticker_settings table not found. Please run scripts/004_add_ticker_settings.sql first.")
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
        alert("Cannot save settings: ticker_settings table not found. Please run the SQL script to enable customization.")
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
      const toDatePlusOne = new Date(customToDate)
      toDatePlusOne.setDate(toDatePlusOne.getDate() + 1)
      const adjustedToDate = toDatePlusOne.toISOString().split("T")[0]

      const response = await fetch(`/api/custom-stats?from=${customFromDate}&to=${adjustedToDate}`)
      const data = await response.json()

      if (response.ok) {
        setCustomStats(data.leaderboard || [])
        setCustomStatsDateRange(data.dateRange)
      } else {
        setCustomStatsError(data.error || "Failed to fetch stats")
      }
    } catch (error) {
      console.error("[v0] Error fetching custom stats:", error)
      setCustomStatsError("An error occurred while fetching stats")
    } finally {
      setIsLoadingCustomStats(false)
    }
  }

  // Blog handlers
  const handleBlogImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingBlogImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        setBlogFeaturedImage(data.url)
      }
    } catch (err) {
      console.error("[v0] Error uploading image:", err)
      alert("Failed to upload image")
    } finally {
      setUploadingBlogImage(false)
    }
  }

  const handleSaveBlogPost = async () => {
    if (!blogTitle || !blogContent) {
      alert("Title and content are required")
      return
    }

    try {
      const method = editingBlogPost ? "PUT" : "POST"
      const res = await fetch("/api/admin/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBlogPost?.id,
          title: blogTitle,
          slug: blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          content: blogContent,
          excerpt: blogExcerpt,
          featured_image: blogFeaturedImage,
          is_published: blogPublished,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`Blog post ${editingBlogPost ? "updated" : "created"} successfully!`)
        resetBlogForm()
        fetchBlogPosts()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error("[v0] Error saving blog post:", err)
      alert("Failed to save blog post")
    }
  }

  const handleEditBlogPost = (post: BlogPost) => {
    setEditingBlogPost(post)
    setBlogTitle(post.title)
    setBlogSlug(post.slug)
    setBlogContent(post.content)
    setBlogExcerpt(post.excerpt || "")
    setBlogFeaturedImage(post.featured_image || "")
    setBlogPublished(post.is_published)
  }

  const handleDeleteBlogPost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        alert("Blog post deleted!")
        fetchBlogPosts()
      }
    } catch (err) {
      alert("Failed to delete blog post")
    }
  }

  const resetBlogForm = () => {
    setEditingBlogPost(null)
    setBlogTitle("")
    setBlogSlug("")
    setBlogContent("")
    setBlogExcerpt("")
    setBlogFeaturedImage("")
    setBlogPublished(false)
  }

  // Update handlers
  const handleUpdateIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingUpdateIcon(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.url) {
        setUpdateIcon(data.url)
      }
    } catch (err) {
      console.error("[v0] Error uploading icon:", err)
      alert("Failed to upload icon")
    } finally {
      setUploadingUpdateIcon(false)
    }
  }

  const handleSaveUpdate = async () => {
    if (!updateTitle || !updateDescription) {
      alert("Title and description are required")
      return
    }

    try {
      const method = editingUpdate ? "PUT" : "POST"
      const res = await fetch("/api/admin/updates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUpdate?.id,
          title: updateTitle,
          description: updateDescription,
          icon_url: updateIcon,
          is_active: updateActive,
        }),
      })

      const data = await res.json()
      if (data.success) {
        alert(`Update ${editingUpdate ? "saved" : "created"} successfully!`)
        resetUpdateForm()
        fetchUpdatePosts()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      console.error("[v0] Error saving update:", err)
      alert("Failed to save update")
    }
  }

  const handleEditUpdate = (update: UpdatePost) => {
    setEditingUpdate(update)
    setUpdateTitle(update.title)
    setUpdateDescription(update.description)
    setUpdateIcon(update.icon_url || "")
    setUpdateActive(update.is_active)
  }

  const handleDeleteUpdate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this update?")) return

    try {
      const res = await fetch(`/api/admin/updates?id=${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        alert("Update deleted!")
        fetchUpdatePosts()
      }
    } catch (err) {
      alert("Failed to delete update")
    }
  }

  const resetUpdateForm = () => {
    setEditingUpdate(null)
    setUpdateTitle("")
    setUpdateDescription("")
    setUpdateIcon("")
    setUpdateActive(true)
  }

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchQuery.toLowerCase()
    return (
      profile.thrill_username?.toLowerCase().includes(query) ||
      profile.display_name?.toLowerCase().includes(query) ||
      profile.id.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation user={user} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <div className="container mx-auto p-6 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, content, and site settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-2">
          <Button
            variant={activeTab === "users" ? "default" : "ghost"}
            onClick={() => setActiveTab("users")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
          <Button
            variant={activeTab === "daily" ? "default" : "ghost"}
            onClick={() => setActiveTab("daily")}
            className="gap-2"
          >
            <Trophy className="h-4 w-4" />
            24hr Race
          </Button>
          <Button
            variant={activeTab === "custom" ? "default" : "ghost"}
            onClick={() => setActiveTab("custom")}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Custom Stats
          </Button>
          <Button
            variant={activeTab === "announcements" ? "default" : "ghost"}
            onClick={() => setActiveTab("announcements")}
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            Announcements
          </Button>
          <Button
            variant={activeTab === "poker" ? "default" : "ghost"}
            onClick={() => setActiveTab("poker")}
            className="gap-2"
          >
            <Gamepad2 className="h-4 w-4" />
            Poker Night
          </Button>
          <Button
            variant={activeTab === "raffle" ? "default" : "ghost"}
            onClick={() => setActiveTab("raffle")}
            className="gap-2"
          >
            <Ticket className="h-4 w-4" />
            Raffle
          </Button>
          <Button
            variant={activeTab === "blog" ? "default" : "ghost"}
            onClick={() => setActiveTab("blog")}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Blog
          </Button>
          <Button
            variant={activeTab === "updates" ? "default" : "ghost"}
            onClick={() => setActiveTab("updates")}
            className="gap-2"
          >
            <Megaphone className="h-4 w-4" />
            Updates
          </Button>
          <Button
            variant={activeTab === "settings" ? "default" : "ghost"}
            onClick={() => setActiveTab("settings")}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant={activeTab === "content" ? "default" : "ghost"}
            onClick={() => setActiveTab("content")}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Site Content
          </Button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <UserManagementSection
            profiles={filteredProfiles}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userStats={userStats}
            isLoadingStats={isLoadingStats}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
            handleUnlinkAll={handleUnlinkAll}
            isUnlinkingAll={isUnlinkingAll}
          />
        )}

        {/* Daily 24hr Race Tab */}
        {activeTab === "daily" && (
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-card-foreground">24-Hour Race Leaderboard</h2>
                {dailyDateRange && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {dailyDateRange.fromDate} to {dailyDateRange.toDate}
                  </p>
                )}
                {dailyLastUpdated && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {new Date(dailyLastUpdated).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={() => fetchDailyLeaderboard()} disabled={isLoadingDailyLeaderboard} variant="outline">
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingDailyLeaderboard ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleForceRefresh}
                  disabled={isForceRefreshing}
                  variant="default"
                  className="bg-primary hover:bg-primary/90"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {isForceRefreshing ? "Refreshing..." : "Force Refresh"}
                </Button>
              </div>
            </div>

            {forceRefreshStatus && (
              <div className="mb-4 p-3 bg-accent rounded-md text-accent-foreground">{forceRefreshStatus}</div>
            )}

            {isLoadingDailyLeaderboard ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : dailyLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground font-semibold">Rank</th>
                      <th className="text-left p-3 text-muted-foreground font-semibold">Username</th>
                      <th className="text-right p-3 text-muted-foreground font-semibold">Wager</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyLeaderboard.map((player, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="p-3 text-card-foreground font-medium">#{player.rank}</td>
                        <td className="p-3 text-card-foreground">{player.username}</td>
                        <td className="p-3 text-right text-card-foreground">${player.wager.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Custom Stats Tab */}
        {activeTab === "custom" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Custom Date Range Stats</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="customFromDate" className="text-muted-foreground">From Date</Label>
                <Input
                  id="customFromDate"
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="customToDate" className="text-muted-foreground">To Date</Label>
                <Input
                  id="customToDate"
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={fetchCustomStats} disabled={isLoadingCustomStats} className="w-full">
                  {isLoadingCustomStats ? "Loading..." : "Fetch Stats"}
                </Button>
              </div>
            </div>

            {customStatsError && (
              <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md">{customStatsError}</div>
            )}

            {customStatsDateRange && (
              <p className="text-sm text-muted-foreground mb-4">
                Showing stats from {customStatsDateRange.fromDate} to {customStatsDateRange.toDate}
              </p>
            )}

            {customStats.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground font-semibold">Rank</th>
                      <th className="text-left p-3 text-muted-foreground font-semibold">Username</th>
                      <th className="text-right p-3 text-muted-foreground font-semibold">Wager</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customStats.map((player, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="p-3 text-card-foreground font-medium">#{player.rank}</td>
                        <td className="p-3 text-card-foreground">{player.username}</td>
                        <td className="p-3 text-right text-card-foreground">${player.wager.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Site Announcements</h2>

            <div className="mb-6">
              <Label htmlFor="newAnnouncement" className="text-muted-foreground">New Announcement</Label>
              <div className="flex gap-2 mt-2">
                <Textarea
                  id="newAnnouncement"
                  value={newAnnouncement}
                  onChange={(e) => setNewAnnouncement(e.target.value)}
                  placeholder="Enter announcement message..."
                  className="bg-background border-border text-foreground"
                  rows={3}
                />
                <Button onClick={handleCreateAnnouncement} className="self-end">
                  <Bell className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </div>
            </div>

            {isLoadingAnnouncements ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No announcements yet</div>
            ) : (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <p className="text-card-foreground">{announcement.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(announcement.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={announcement.is_active ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleAnnouncement(announcement.id, announcement.is_active)}
                      >
                        {announcement.is_active ? "Active" : "Inactive"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Poker Night Tab */}
        {activeTab === "poker" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Poker Night Qualifiers</h2>

            <div className="mb-6 p-4 bg-accent/30 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-2">Next Poker Night</h3>
              <p className="text-muted-foreground mb-4">
                {pokerNightDate || "No upcoming poker night scheduled"}
              </p>
              <Button onClick={handleCaptureQualifiers} disabled={isCapturingQualifiers} className="gap-2">
                <Gamepad2 className="h-4 w-4" />
                {isCapturingQualifiers ? "Capturing..." : "Capture Current Qualifiers"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will snapshot all users with $50,000+ monthly wager
              </p>
            </div>

            {isLoadingQualifiers ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : pokerQualifiers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No qualifiers captured yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3 text-muted-foreground font-semibold">Thrill Username</th>
                      <th className="text-left p-3 text-muted-foreground font-semibold">Display Name</th>
                      <th className="text-right p-3 text-muted-foreground font-semibold">Monthly Wager</th>
                      <th className="text-right p-3 text-muted-foreground font-semibold">Qualified Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pokerQualifiers.map((q) => (
                      <tr key={q.id} className="border-b border-border/50 hover:bg-accent/50">
                        <td className="p-3 text-card-foreground font-medium">{q.thrill_username}</td>
                        <td className="p-3 text-card-foreground">{q.display_name || "—"}</td>
                        <td className="p-3 text-right text-card-foreground">${q.monthly_wager.toLocaleString()}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {new Date(q.qualification_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Raffle Tab */}
        {activeTab === "raffle" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Weekly Raffle Management</h2>

            {raffleStatus && <div className="mb-4 p-3 bg-accent rounded-md text-accent-foreground">{raffleStatus}</div>}

            {/* Raffle Settings */}
            <div className="mb-6 p-4 bg-accent/30 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Raffle Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-muted-foreground">Prize Amount ($)</Label>
                  <Input
                    type="number"
                    value={raffleSettings.prize_amount}
                    onChange={(e) => setRaffleSettings({ ...raffleSettings, prize_amount: parseFloat(e.target.value) })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Tickets Per $</Label>
                  <Input
                    type="number"
                    value={raffleSettings.tickets_per_wager}
                    onChange={(e) =>
                      setRaffleSettings({ ...raffleSettings, tickets_per_wager: parseFloat(e.target.value) })
                    }
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleRaffleSettingsSave} disabled={isSavingRaffleSettings} className="w-full">
                    {isSavingRaffleSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Week Selector */}
            <div className="mb-6">
              <Label htmlFor="raffleDate" className="text-muted-foreground">Select Raffle Week (Friday)</Label>
              <Input
                id="raffleDate"
                type="date"
                value={raffleDate}
                onChange={(e) => setRaffleDate(e.target.value)}
                className="bg-background border-border text-foreground mt-2"
              />
            </div>

            {/* Issue Tickets */}
            <div className="mb-6 p-4 bg-accent/30 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">Issue Tickets Manually</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <Input
                    value={raffleIssueUserId}
                    onChange={(e) => setRaffleIssueUserId(e.target.value)}
                    placeholder="Enter user UUID"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Wager Amount ($)</Label>
                  <Input
                    type="number"
                    value={raffleWagerAmount}
                    onChange={(e) => setRaffleWagerAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleIssueTickets} className="w-full">
                    Issue Tickets
                  </Button>
                </div>
              </div>
            </div>

            {/* Draw Winner */}
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
              <h3 className="font-semibold text-card-foreground mb-4">Draw Winner (Random & Fair)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Prize Description</Label>
                  <Input
                    value={prizeDescription}
                    onChange={(e) => setPrizeDescription(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleDrawRaffleWinner} className="w-full bg-primary hover:bg-primary/90">
                    <Ticket className="h-4 w-4 mr-2" />
                    Draw Random Winner
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Uses cryptographically secure random selection from all tickets
              </p>
            </div>

            {/* Current Week Stats */}
            {isLoadingRaffle ? (
              <div className="text-center py-8 text-muted-foreground">Loading raffle data...</div>
            ) : (
              <>
                {raffleWinner && (
                  <div className="mb-6 p-4 bg-accent rounded-lg border border-border">
                    <h3 className="font-semibold text-card-foreground mb-2">Winner for {raffleDate}</h3>
                    <p className="text-muted-foreground">
                      {raffleWinner.thrill_username} - Ticket #{raffleWinner.winning_ticket}
                    </p>
                    <p className="text-muted-foreground text-sm">Prize: ${raffleWinner.prize_amount}</p>
                    <p className="text-muted-foreground text-sm">
                      Status: {raffleWinner.prize_claimed ? "Claimed" : "Unclaimed"}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold text-card-foreground mb-2">
                    Ticket Entries ({raffleTickets.length} users, {raffleTickets.reduce((sum, e) => sum + e.ticket_count, 0)} total tickets)
                  </h3>
                </div>

                {raffleTickets.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left p-3 text-muted-foreground font-semibold">Username</th>
                          <th className="text-right p-3 text-muted-foreground font-semibold">Tickets</th>
                          <th className="text-right p-3 text-muted-foreground font-semibold">Wager</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raffleTickets.map((entry, idx) => (
                          <tr key={idx} className="border-b border-border/50 hover:bg-accent/50">
                            <td className="p-3 text-card-foreground">{entry.thrill_username}</td>
                            <td className="p-3 text-right text-card-foreground">{entry.ticket_count}</td>
                            <td className="p-3 text-right text-muted-foreground">${entry.wager_amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* Blog Tab */}
        {activeTab === "blog" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Blog Post Editor</h2>

            {/* Blog Editor Form */}
            <div className="mb-8 p-6 bg-accent/30 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">
                {editingBlogPost ? "Edit Blog Post" : "Create New Post"}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Title *</Label>
                  <Input
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="Enter post title"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <Input
                    value={blogSlug}
                    onChange={(e) => setBlogSlug(e.target.value)}
                    placeholder="url-friendly-slug (auto-generated if empty)"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Excerpt (Short Description)</Label>
                  <Textarea
                    value={blogExcerpt}
                    onChange={(e) => setBlogExcerpt(e.target.value)}
                    placeholder="Brief summary for preview cards"
                    className="bg-background border-border text-foreground"
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Featured Image</Label>
                  <div className="flex gap-2 items-end mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleBlogImageUpload}
                      disabled={uploadingBlogImage}
                      className="bg-background border-border text-foreground"
                    />
                    {uploadingBlogImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {blogFeaturedImage && (
                    <div className="mt-2">
                      <img src={blogFeaturedImage} alt="Featured" className="w-32 h-32 object-cover rounded-md" />
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Content * (Markdown supported)</Label>
                  <Textarea
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Write your blog post content here..."
                    className="bg-background border-border text-foreground font-mono"
                    rows={12}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports **bold**, *italic*, lists, and other markdown formatting
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-card-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blogPublished}
                      onChange={(e) => setBlogPublished(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Publish immediately</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveBlogPost} className="gap-2">
                    <Save className="h-4 w-4" />
                    {editingBlogPost ? "Update Post" : "Create Post"}
                  </Button>
                  {editingBlogPost && (
                    <Button onClick={resetBlogForm} variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Posts List */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Existing Posts</h3>
              {isLoadingBlog ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : blogPosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No blog posts yet</div>
              ) : (
                <div className="space-y-3">
                  {blogPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-card-foreground">{post.title}</h4>
                        <p className="text-sm text-muted-foreground">{post.slug}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(post.created_at).toLocaleDateString()} •{" "}
                          {post.is_published ? "Published" : "Draft"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditBlogPost(post)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteBlogPost(post.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Updates Tab */}
        {activeTab === "updates" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Updates Feed Manager</h2>

            {/* Update Creator Form */}
            <div className="mb-8 p-6 bg-accent/30 rounded-lg border border-border">
              <h3 className="font-semibold text-card-foreground mb-4">
                {editingUpdate ? "Edit Update" : "Create New Update"}
              </h3>

              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Title *</Label>
                  <Input
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="Update title"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Description *</Label>
                  <Textarea
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="Brief description of the update"
                    className="bg-background border-border text-foreground"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-muted-foreground">Icon Image (optional)</Label>
                  <div className="flex gap-2 items-end mt-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleUpdateIconUpload}
                      disabled={uploadingUpdateIcon}
                      className="bg-background border-border text-foreground"
                    />
                    {uploadingUpdateIcon && <span className="text-sm text-muted-foreground">Uploading...</span>}
                  </div>
                  {updateIcon && (
                    <div className="mt-2">
                      <img src={updateIcon} alt="Icon" className="w-16 h-16 object-cover rounded-md" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-card-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={updateActive}
                      onChange={(e) => setUpdateActive(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Active (show on homepage)</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveUpdate} className="gap-2">
                    <Save className="h-4 w-4" />
                    {editingUpdate ? "Update" : "Create Update"}
                  </Button>
                  {editingUpdate && (
                    <Button onClick={resetUpdateForm} variant="outline" className="gap-2">
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Existing Updates List */}
            <div>
              <h3 className="font-semibold text-card-foreground mb-4">Existing Updates</h3>
              {isLoadingUpdates ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : updatePosts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No updates yet</div>
              ) : (
                <div className="space-y-3">
                  {updatePosts.map((update) => (
                    <div
                      key={update.id}
                      className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {update.icon_url && (
                          <img src={update.icon_url} alt="" className="w-12 h-12 object-cover rounded-md" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-card-foreground">{update.title}</h4>
                          <p className="text-sm text-muted-foreground">{update.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(update.created_at).toLocaleDateString()} •{" "}
                            {update.is_active ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditUpdate(update)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteUpdate(update.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold mb-6 text-card-foreground">Site Settings</h2>

            {!tickerTableExists && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                <p className="font-semibold mb-2">Ticker Settings Table Missing</p>
                <p className="text-sm">
                  Please run scripts/004_add_ticker_settings.sql to enable ticker customization.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Text Color</Label>
                  <Input
                    type="color"
                    value={tickerSettings.text_color}
                    onChange={(e) => setTickerSettings({ ...tickerSettings, text_color: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Speed (ms)</Label>
                  <Input
                    type="number"
                    value={tickerSettings.speed}
                    onChange={(e) => setTickerSettings({ ...tickerSettings, speed: parseInt(e.target.value) })}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Ticker Message 1</Label>
                <Input
                  value={tickerSettings.ticker_1_text}
                  onChange={(e) => setTickerSettings({ ...tickerSettings, ticker_1_text: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Ticker Message 2</Label>
                <Input
                  value={tickerSettings.ticker_2_text}
                  onChange={(e) => setTickerSettings({ ...tickerSettings, ticker_2_text: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div>
                <Label className="text-muted-foreground">Ticker Message 3</Label>
                <Input
                  value={tickerSettings.ticker_3_text}
                  onChange={(e) => setTickerSettings({ ...tickerSettings, ticker_3_text: e.target.value })}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <Button onClick={handleSaveTickerSettings} disabled={isSavingSettings || !tickerTableExists}>
                {isSavingSettings ? "Saving..." : "Save Ticker Settings"}
              </Button>
            </div>
          </Card>
        )}

        {/* Site Content Tab */}
        {activeTab === "content" && (
          <Card className="p-6 bg-card border-border">
            <AdminSiteContentEditor />
          </Card>
        )}
      </div>
    </div>
  )
}

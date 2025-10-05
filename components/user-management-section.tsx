"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Lock, Unlock, UserX, RefreshCw, Shield, ShieldOff, Trash2, ExternalLink } from "lucide-react"
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

interface UserManagementSectionProps {
  profiles: Profile[]
  onRefresh: () => void
}

export function UserManagementSection({ profiles, onRefresh }: UserManagementSectionProps) {
  const [processingUserId, setProcessingUserId] = useState<string | null>(null)
  const router = useRouter()

  const getAdminKey = () => {
    return process.env.NEXT_PUBLIC_ADMIN_KEY || "default_admin_key"
  }

  const handleUnlinkUser = async (userId: string, displayName: string | null) => {
    if (!confirm(`Are you sure you want to unlink ${displayName || "this user"}'s Thrill account?`)) {
      return
    }

    setProcessingUserId(userId)

    try {
      const response = await fetch("/api/admin/users/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminKey: getAdminKey() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("User unlinked successfully!")
        onRefresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error unlinking user:", error)
      alert("An error occurred while unlinking the user.")
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleResetUser = async (userId: string, displayName: string | null) => {
    if (
      !confirm(
        `Are you sure you want to reset ${displayName || "this user"}'s account? This will clear their username and allow them to link a new one.`,
      )
    ) {
      return
    }

    setProcessingUserId(userId)

    try {
      const response = await fetch("/api/admin/users/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminKey: getAdminKey() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("User account reset successfully!")
        onRefresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error resetting user:", error)
      alert("An error occurred while resetting the user.")
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleToggleVerification = async (userId: string, currentStatus: boolean, displayName: string | null) => {
    const action = currentStatus ? "unverify" : "verify"
    if (!confirm(`Are you sure you want to ${action} ${displayName || "this user"}?`)) {
      return
    }

    setProcessingUserId(userId)

    try {
      const response = await fetch("/api/admin/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, verified: !currentStatus, adminKey: getAdminKey() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        onRefresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error toggling verification:", error)
      alert("An error occurred while updating verification status.")
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleToggleLock = async (userId: string, currentStatus: boolean, displayName: string | null) => {
    const action = currentStatus ? "unlock" : "lock"
    if (!confirm(`Are you sure you want to ${action} ${displayName || "this user"}'s username?`)) {
      return
    }

    setProcessingUserId(userId)

    try {
      const response = await fetch("/api/admin/users/lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, locked: !currentStatus, adminKey: getAdminKey() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        onRefresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error toggling lock:", error)
      alert("An error occurred while updating lock status.")
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string, displayName: string | null) => {
    if (
      !confirm(
        `⚠️ WARNING: Are you sure you want to PERMANENTLY DELETE ${displayName || "this user"}? This action CANNOT be undone and will remove all their data.`,
      )
    ) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm:')
    if (confirmText !== "DELETE") {
      alert("Deletion cancelled.")
      return
    }

    setProcessingUserId(userId)

    try {
      const response = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, adminKey: getAdminKey() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("User deleted successfully!")
        onRefresh()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      alert("An error occurred while deleting the user.")
    } finally {
      setProcessingUserId(null)
    }
  }

  const handleViewDashboard = (userId: string) => {
    router.push(`/dashboard/${userId}?admin=true`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card
      className="p-6 mb-8 rounded-xl border border-indigo-400/50"
      style={{
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.25), 0 0 40px rgba(99, 102, 241, 0.15)",
      }}
    >
      <h2 className="text-2xl font-bold text-indigo-400 uppercase mb-6">User Management</h2>

      <div className="space-y-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="p-4 bg-[#1a1a1a] rounded-lg border border-white/20 hover:border-indigo-400/50 transition-all"
          >
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* User Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 border-2 border-indigo-400">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.display_name || "User"} />
                  <AvatarFallback className="bg-[#0a0a0a] text-indigo-400 font-bold">
                    {profile.display_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate flex items-center gap-2">
                    {profile.display_name || "No display name"}
                    {profile.thrill_username_verified && (
                      <span className="text-yellow-400 text-lg" title="Verified">
                        ⭐
                      </span>
                    )}
                  </h3>
                  {profile.thrill_username ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-indigo-400 font-semibold">@{profile.thrill_username}</p>
                      {profile.thrill_username_verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {profile.thrill_username_locked && <Lock className="h-4 w-4 text-yellow-500" />}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No username linked</p>
                  )}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    {profile.pokernow_username && (
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-500">PokerNow:</span> {profile.pokernow_username}
                      </p>
                    )}
                    {profile.telegram_username && (
                      <p className="text-xs text-gray-400">
                        <span className="text-gray-500">Telegram:</span> @{profile.telegram_username}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Joined {formatDate(profile.created_at)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleViewDashboard(profile.id)}
                  disabled={processingUserId === profile.id}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold uppercase rounded-lg"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </Button>

                {profile.thrill_username && (
                  <>
                    <Button
                      onClick={() =>
                        handleToggleVerification(profile.id, profile.thrill_username_verified, profile.display_name)
                      }
                      disabled={processingUserId === profile.id}
                      size="sm"
                      className={`${
                        profile.thrill_username_verified
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      } text-white font-bold uppercase rounded-lg`}
                    >
                      {profile.thrill_username_verified ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-1" />
                          Unverify
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleToggleLock(profile.id, profile.thrill_username_locked, profile.display_name)}
                      disabled={processingUserId === profile.id}
                      size="sm"
                      className={`${
                        profile.thrill_username_locked
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-orange-600 hover:bg-orange-700"
                      } text-white font-bold uppercase rounded-lg`}
                    >
                      {profile.thrill_username_locked ? (
                        <>
                          <Unlock className="h-4 w-4 mr-1" />
                          Unlock
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-1" />
                          Lock
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => handleUnlinkUser(profile.id, profile.display_name)}
                      disabled={processingUserId === profile.id}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Unlink
                    </Button>
                  </>
                )}

                <Button
                  onClick={() => handleResetUser(profile.id, profile.display_name)}
                  disabled={processingUserId === profile.id}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-lg"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reset
                </Button>

                <Button
                  onClick={() => handleDeleteUser(profile.id, profile.display_name)}
                  disabled={processingUserId === profile.id}
                  size="sm"
                  className="bg-gray-800 hover:bg-gray-900 text-red-400 font-bold uppercase rounded-lg border border-red-500/50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

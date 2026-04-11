"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Save, X, Trophy, Gift } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Reward {
  id: string
  name: string
  description: string
  point_value: number
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  display_name: string | null
  thrill_username: string | null
}

interface UserReward {
  id: string
  user_id: string
  reward_id: string
  date_granted: string
  reward: Reward
  profile: Profile
}

export function RewardsManagementSection() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [newRewardText, setNewRewardText] = useState("")

  // For adding rewards to users
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedRewardId, setSelectedRewardId] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const rewardsResponse = await fetch("/api/admin/rewards")
      const rewardsData = await rewardsResponse.json()
      if (rewardsResponse.ok) {
        setRewards(rewardsData.rewards || [])
      }

      const userRewardsResponse = await fetch("/api/admin/user-rewards")
      const userRewardsData = await userRewardsResponse.json()
      if (userRewardsResponse.ok) {
        setUserRewards(userRewardsData.userRewards || [])
      }

      const profilesResponse = await fetch("/api/admin/profiles")
      const profilesData = await profilesResponse.json()
      if (profilesResponse.ok) {
        setProfiles(profilesData.profiles || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateReward = async () => {
    if (!newRewardText.trim()) {
      alert("Please enter a reward description")
      return
    }

    try {
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reward: {
            name: newRewardText.substring(0, 50), // Use first 50 chars as name
            description: newRewardText,
            point_value: 0,
          },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward created successfully!")
        setIsCreating(false)
        setNewRewardText("")
        fetchData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error creating reward:", error)
      alert("An error occurred while creating the reward.")
    }
  }

  const handleAddRewardToUser = async () => {
    if (!selectedUserId || !selectedRewardId) {
      alert("Please select both a user and a reward")
      return
    }

    try {
      const response = await fetch("/api/admin/user-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          rewardId: selectedRewardId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward added to user successfully!")
        setSelectedUserId("")
        setSelectedRewardId("")
        fetchData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error adding reward to user:", error)
      alert("An error occurred while adding the reward.")
    }
  }

  const handleDeleteReward = async (rewardId: string, rewardName: string) => {
    if (!confirm(`Are you sure you want to delete "${rewardName}"? This will remove it from all users.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/rewards?id=${rewardId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward deleted successfully!")
        fetchData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error deleting reward:", error)
      alert("An error occurred while deleting the reward.")
    }
  }

  const handleRemoveUserReward = async (userRewardId: string) => {
    if (!confirm("Are you sure you want to remove this reward from the user?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/user-rewards?id=${userRewardId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward removed from user successfully!")
        fetchData()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error removing user reward:", error)
      alert("An error occurred while removing the reward.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Create New Reward */}
      <Card
        className="p-6 rounded-xl border border-purple-400/50"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.25), 0 0 40px rgba(168, 85, 247, 0.15)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-purple-400 uppercase">Create Rewards</h2>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-lg"
          >
            {isCreating ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add Reward
              </>
            )}
          </Button>
        </div>

        {isCreating && (
          <div className="p-4 bg-[#1a1a1a] rounded-lg border border-purple-400/30">
            <Label htmlFor="new-reward" className="text-white mb-2 block">
              Reward Description
            </Label>
            <Textarea
              id="new-reward"
              value={newRewardText}
              onChange={(e) => setNewRewardText(e.target.value)}
              placeholder="Enter reward description (e.g., 'Free entry to next tournament')"
              className="bg-[#0a0a0a] border-[#333] text-white mb-4"
              rows={3}
            />
            <Button
              onClick={handleCreateReward}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-lg"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Reward
            </Button>
          </div>
        )}

        {/* Available Rewards List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading rewards...</p>
          </div>
        ) : rewards.length > 0 ? (
          <div className="space-y-3 mt-6">
            <h3 className="text-lg font-bold text-purple-400">Available Rewards</h3>
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="p-4 bg-[#1a1a1a] rounded-lg border border-purple-400/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Trophy className="h-6 w-6 text-purple-400" />
                  <div>
                    <p className="text-white font-semibold">{reward.name}</p>
                    <p className="text-gray-400 text-sm">{reward.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleDeleteReward(reward.id, reward.name)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg mt-6">
            <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No rewards yet</p>
          </div>
        )}
      </Card>

      {/* Add Reward to User */}
      <Card
        className="p-6 rounded-xl border border-purple-400/50"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.25), 0 0 40px rgba(168, 85, 247, 0.15)",
        }}
      >
        <h2 className="text-2xl font-bold text-purple-400 uppercase mb-6">Add Reward to User</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-white mb-2 block">Select User</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id} className="text-white hover:bg-[#333]">
                    {profile.display_name || profile.thrill_username || "Unknown User"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Select Reward</Label>
            <Select value={selectedRewardId} onValueChange={setSelectedRewardId}>
              <SelectTrigger className="bg-[#1a1a1a] border-[#333] text-white">
                <SelectValue placeholder="Choose a reward..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#333]">
                {rewards.map((reward) => (
                  <SelectItem key={reward.id} value={reward.id} className="text-white hover:bg-[#333]">
                    {reward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleAddRewardToUser}
          disabled={!selectedUserId || !selectedRewardId}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-lg disabled:opacity-50"
        >
          <Gift className="h-4 w-4 mr-1" />
          Add Reward to User
        </Button>
      </Card>

      {/* User Rewards List */}
      <Card
        className="p-6 rounded-xl border border-purple-400/50"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.25), 0 0 40px rgba(168, 85, 247, 0.15)",
        }}
      >
        <h2 className="text-2xl font-bold text-purple-400 uppercase mb-6">Assigned Rewards</h2>

        {userRewards.length > 0 ? (
          <div className="space-y-3">
            {userRewards.map((userReward) => (
              <div
                key={userReward.id}
                className="p-4 bg-[#1a1a1a] rounded-lg border border-purple-400/30 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {userReward.profile?.display_name || userReward.profile?.thrill_username || "Unknown User"}
                  </p>
                  <p className="text-purple-400 text-sm">{userReward.reward?.description}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Granted: {new Date(userReward.date_granted).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleRemoveUserReward(userReward.id)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
            <Gift className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No rewards assigned yet</p>
          </div>
        )}
      </Card>
    </div>
  )
}

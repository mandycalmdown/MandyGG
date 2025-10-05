"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Save, X, Trophy, Eye, EyeOff } from "lucide-react"

interface Reward {
  id: string
  name: string
  description: string
  rank_requirement: number
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export function RewardsManagementSection() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rank_requirement: 1,
    image_url: "",
    is_active: true,
  })

  useEffect(() => {
    fetchRewards()
  }, [])

  const fetchRewards = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/rewards")
      const data = await response.json()
      if (response.ok) {
        setRewards(data.rewards || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching rewards:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    const adminKey = prompt("Enter admin key to confirm:")
    if (!adminKey) return

    try {
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey, reward: formData }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward created successfully!")
        setIsCreating(false)
        setFormData({
          name: "",
          description: "",
          rank_requirement: 1,
          image_url: "",
          is_active: true,
        })
        fetchRewards()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error creating reward:", error)
      alert("An error occurred while creating the reward.")
    }
  }

  const handleUpdate = async (rewardId: string, updates: Partial<Reward>) => {
    const adminKey = prompt("Enter admin key to confirm:")
    if (!adminKey) return

    try {
      const response = await fetch("/api/admin/rewards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey, rewardId, updates }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward updated successfully!")
        setEditingId(null)
        fetchRewards()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error updating reward:", error)
      alert("An error occurred while updating the reward.")
    }
  }

  const handleDelete = async (rewardId: string, rewardName: string) => {
    if (!confirm(`Are you sure you want to delete "${rewardName}"?`)) {
      return
    }

    const adminKey = prompt("Enter admin key to confirm:")
    if (!adminKey) return

    try {
      const response = await fetch(`/api/admin/rewards?id=${rewardId}&adminKey=${adminKey}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        alert("Reward deleted successfully!")
        fetchRewards()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Error deleting reward:", error)
      alert("An error occurred while deleting the reward.")
    }
  }

  const handleToggleActive = async (reward: Reward) => {
    await handleUpdate(reward.id, { is_active: !reward.is_active })
  }

  const startEdit = (reward: Reward) => {
    setEditingId(reward.id)
    setFormData({
      name: reward.name,
      description: reward.description,
      rank_requirement: reward.rank_requirement,
      image_url: reward.image_url || "",
      is_active: reward.is_active,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      name: "",
      description: "",
      rank_requirement: 1,
      image_url: "",
      is_active: true,
    })
  }

  const saveEdit = async (rewardId: string) => {
    if (!formData.name || !formData.description) {
      alert("Please fill in all required fields")
      return
    }

    await handleUpdate(rewardId, formData)
  }

  return (
    <Card
      className="p-6 mb-8 rounded-xl border border-purple-400/50"
      style={{
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        boxShadow:
          "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.25), 0 0 40px rgba(168, 85, 247, 0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-purple-400 uppercase">Rewards Management</h2>
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

      {/* Create New Reward Form */}
      {isCreating && (
        <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-purple-400/30">
          <h3 className="text-lg font-bold text-purple-400 mb-4">Create New Reward</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="new-name" className="text-white mb-2 block">
                Reward Name *
              </Label>
              <Input
                id="new-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gold Trophy"
                className="bg-[#0a0a0a] border-[#333] text-white"
              />
            </div>
            <div>
              <Label htmlFor="new-rank" className="text-white mb-2 block">
                Rank Requirement *
              </Label>
              <Input
                id="new-rank"
                type="number"
                value={formData.rank_requirement}
                onChange={(e) => setFormData({ ...formData, rank_requirement: Number.parseInt(e.target.value) || 1 })}
                min="1"
                className="bg-[#0a0a0a] border-[#333] text-white"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="new-description" className="text-white mb-2 block">
                Description *
              </Label>
              <Textarea
                id="new-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the reward..."
                className="bg-[#0a0a0a] border-[#333] text-white"
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="new-image" className="text-white mb-2 block">
                Image URL (optional)
              </Label>
              <Input
                id="new-image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.png"
                className="bg-[#0a0a0a] border-[#333] text-white"
              />
            </div>
          </div>
          <Button
            onClick={handleCreate}
            className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase rounded-lg"
          >
            <Save className="h-4 w-4 mr-1" />
            Create Reward
          </Button>
        </div>
      )}

      {/* Rewards List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading rewards...</p>
        </div>
      ) : rewards.length > 0 ? (
        <div className="space-y-4">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-4 rounded-lg border transition-all ${
                reward.is_active ? "bg-[#1a1a1a] border-purple-400/30" : "bg-[#0a0a0a] border-gray-700 opacity-60"
              }`}
            >
              {editingId === reward.id ? (
                // Edit Mode
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label className="text-white mb-2 block">Reward Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-[#0a0a0a] border-[#333] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Rank Requirement *</Label>
                      <Input
                        type="number"
                        value={formData.rank_requirement}
                        onChange={(e) =>
                          setFormData({ ...formData, rank_requirement: Number.parseInt(e.target.value) || 1 })
                        }
                        min="1"
                        className="bg-[#0a0a0a] border-[#333] text-white"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-white mb-2 block">Description *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-[#0a0a0a] border-[#333] text-white"
                        rows={3}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-white mb-2 block">Image URL (optional)</Label>
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="bg-[#0a0a0a] border-[#333] text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => saveEdit(reward.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold uppercase rounded-lg"
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold uppercase rounded-lg"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {reward.image_url ? (
                      <img
                        src={reward.image_url || "/placeholder.svg"}
                        alt={reward.name}
                        className="h-12 w-12 object-cover rounded-lg border-2 border-purple-400"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-[#0a0a0a] rounded-lg border-2 border-purple-400 flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-white font-bold">{reward.name}</h3>
                        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">
                          Rank #{reward.rank_requirement}
                        </span>
                        {!reward.is_active && (
                          <span className="px-2 py-0.5 bg-gray-600 text-white text-xs font-bold rounded">INACTIVE</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">{reward.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleToggleActive(reward)}
                      size="sm"
                      className={`${
                        reward.is_active ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"
                      } text-white font-bold uppercase rounded-lg`}
                    >
                      {reward.is_active ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => startEdit(reward)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase rounded-lg"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(reward.id, reward.name)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase rounded-lg"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
          <Trophy className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No rewards yet</p>
          <p className="text-gray-500 text-sm mt-1">Click "Add Reward" to create your first reward</p>
        </div>
      )}
    </Card>
  )
}

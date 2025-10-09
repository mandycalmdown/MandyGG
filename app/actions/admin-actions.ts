"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { kv } from "@/lib/kv"

function validateAdminKey(): boolean {
  return !!process.env.ADMIN_UNLINK_KEY
}

export async function unlinkUserAction(userId: string) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("profiles")
      .update({
        thrill_username: null,
        thrill_username_verified: false,
        thrill_username_locked: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error unlinking user:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: { message: "User unlinked successfully" } }
  } catch (error) {
    console.error("[v0] Error in unlinkUserAction:", error)
    return { success: false, error: "Failed to unlink user" }
  }
}

export async function resetUserAction(userId: string) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("profiles")
      .update({
        thrill_username: null,
        thrill_username_verified: false,
        thrill_username_locked: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error resetting user:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: { message: "User reset successfully" } }
  } catch (error) {
    console.error("[v0] Error in resetUserAction:", error)
    return { success: false, error: "Failed to reset user" }
  }
}

export async function toggleVerificationAction(userId: string, verified: boolean) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("profiles")
      .update({
        thrill_username_verified: verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error updating verification:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: { message: verified ? "User verified" : "User unverified" } }
  } catch (error) {
    console.error("[v0] Error in toggleVerificationAction:", error)
    return { success: false, error: "Failed to update verification" }
  }
}

export async function toggleLockAction(userId: string, locked: boolean) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("profiles")
      .update({
        thrill_username_locked: locked,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error updating lock status:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: { message: locked ? "User locked" : "User unlocked" } }
  } catch (error) {
    console.error("[v0] Error in toggleLockAction:", error)
    return { success: false, error: "Failed to update lock status" }
  }
}

export async function deleteUserAction(userId: string) {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const adminClient = createAdminClient()

    // Delete user's rewards first (foreign key constraint)
    await adminClient.from("user_rewards").delete().eq("user_id", userId)

    // Delete user's poker qualifiers
    await adminClient.from("poker_qualifiers").delete().eq("user_id", userId)

    // Delete the profile
    const { error: profileError } = await adminClient.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("[v0] Error deleting profile:", profileError)
      return { success: false, error: profileError.message }
    }

    // Delete the auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("[v0] Error deleting auth user:", authError)
      // Don't fail if auth deletion fails, profile is already deleted
    }

    return { success: true, data: { message: "User deleted successfully" } }
  } catch (error) {
    console.error("[v0] Error in deleteUserAction:", error)
    return { success: false, error: "Failed to delete user" }
  }
}

export async function captureQualifiersAction() {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/poker-qualifiers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminKey: process.env.ADMIN_UNLINK_KEY }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.error || "Failed to capture qualifiers" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in captureQualifiersAction:", error)
    return { success: false, error: "Failed to capture qualifiers" }
  }
}

export async function unlinkAllAccountsAction() {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from("profiles")
      .update({
        thrill_username: null,
        thrill_username_verified: false,
        thrill_username_locked: false,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all profiles

    if (error) {
      console.error("[v0] Error unlinking all accounts:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: { message: "All accounts unlinked successfully" } }
  } catch (error) {
    console.error("[v0] Error in unlinkAllAccountsAction:", error)
    return { success: false, error: "Failed to unlink all accounts" }
  }
}

export async function clearLeaderboardCacheAction() {
  if (!validateAdminKey()) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const cacheKeys = [
      "leaderboard:current",
      "leaderboard:past",
      "leaderboard:current:stale",
      "leaderboard:past:stale",
      "leaderboard:current:uncensored",
      "leaderboard:past:uncensored",
    ]

    console.log("[v0] Clearing Redis cache keys:", cacheKeys)

    for (const cacheKey of cacheKeys) {
      await kv.del(cacheKey)
      console.log("[v0] Deleted cache key:", cacheKey)
    }

    return { success: true, data: { message: "Cache cleared successfully", clearedKeys: cacheKeys } }
  } catch (error) {
    console.error("[v0] Error in clearLeaderboardCacheAction:", error)
    return { success: false, error: "Failed to clear cache" }
  }
}

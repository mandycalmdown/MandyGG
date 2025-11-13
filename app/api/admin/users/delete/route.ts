import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, adminKey } = await request.json()

    // Verify admin key
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Delete user's rewards first (foreign key constraint)
    await adminClient.from("user_rewards").delete().eq("user_id", userId)

    // Delete user's poker qualifiers
    await adminClient.from("poker_qualifiers").delete().eq("user_id", userId)

    // Delete the profile
    const { error: profileError } = await adminClient.from("profiles").delete().eq("id", userId)

    if (profileError) {
      console.error("[v0] Error deleting profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Delete the auth user
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("[v0] Error deleting auth user:", authError)
      // Don't fail if auth deletion fails, profile is already deleted
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error in delete route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

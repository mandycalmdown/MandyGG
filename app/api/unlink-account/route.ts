import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { adminKey } = await request.json()

    // Simple admin key check - in production, use proper admin authentication
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized - Invalid admin key" }, { status: 403 })
    }

    // Unlink the account
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        thrill_username: null,
        thrill_username_verified: false,
        thrill_username_locked: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error unlinking account:", updateError)
      return NextResponse.json({ error: "Failed to unlink account" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Account unlinked successfully",
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("[v0] Error in unlink-account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

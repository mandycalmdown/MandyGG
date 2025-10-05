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

    // Unlink all accounts that have a thrill_username
    const { data: updatedProfiles, error: updateError } = await supabase
      .from("profiles")
      .update({
        thrill_username: null,
        thrill_username_verified: false,
        thrill_username_locked: false,
        updated_at: new Date().toISOString(),
      })
      .not("thrill_username", "is", null)
      .select()

    if (updateError) {
      console.error("[v0] Error unlinking all accounts:", updateError)
      return NextResponse.json({ error: "Failed to unlink all accounts" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully unlinked ${updatedProfiles?.length || 0} accounts`,
      count: updatedProfiles?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error in unlink-all-accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, verified, adminKey } = await request.json()

    // Verify admin key
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Update verification status
    const { error } = await supabase
      .from("profiles")
      .update({
        thrill_username_verified: verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error verifying user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: verified ? "User verified successfully" : "User unverified successfully",
    })
  } catch (error) {
    console.error("[v0] Error in verify route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

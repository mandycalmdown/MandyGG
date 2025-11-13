import { createClient } from "@/lib/supabase/server"
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

    const supabase = await createClient()

    // Unlink the Thrill username
    const { error } = await supabase
      .from("profiles")
      .update({
        thrill_username: null,
        thrill_username_locked: false,
        thrill_username_verified: false,
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Error unlinking user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "User unlinked successfully" })
  } catch (error) {
    console.error("[v0] Error in unlink route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { id, is_active } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("announcements")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error toggling announcement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ announcement: data })
  } catch (error) {
    console.error("[v0] Error in toggle announcements:", error)
    return NextResponse.json({ error: "Failed to toggle announcement" }, { status: 500 })
  }
}

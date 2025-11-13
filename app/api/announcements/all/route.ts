import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching all announcements:", error)
      return NextResponse.json({ announcements: [] })
    }

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error) {
    console.error("[v0] Error in all announcements API:", error)
    return NextResponse.json({ announcements: [] })
  }
}

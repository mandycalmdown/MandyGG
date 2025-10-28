import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET all profiles
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, display_name, thrill_username")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching profiles:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error("[v0] Error in profiles GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

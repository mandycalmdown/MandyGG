import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET raffle tickets for the current user (last 7 days)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const admin = createAdminClient()
    const { data: tickets, error } = await admin
      .from("raffle_tickets")
      .select("*")
      .eq("user_id", user.id)
      .gte("raffle_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("raffle_date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching raffle tickets:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ tickets: tickets || [] })
  } catch (error) {
    console.error("[v0] Error in raffle tickets GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

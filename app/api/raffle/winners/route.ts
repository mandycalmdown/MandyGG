import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

function censorUsername(username: string): string {
  if (!username || username.length <= 2) return username
  const first = username[0]
  const last = username[username.length - 1]
  const middle = "*".repeat(Math.max(1, username.length - 2))
  return `${first}${middle}${last}`
}

// GET recent raffle winners (public, censored)
export async function GET() {
  try {
    const admin = createAdminClient()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: winners, error } = await admin
      .from("raffle_winners")
      .select("raffle_date, winning_ticket_number, prize_amount, prize_description, claimed, winner_user_id")
      .gte("raffle_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("raffle_date", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching raffle winners:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch usernames separately
    const userIds = [...new Set((winners || []).map((w: any) => w.winner_user_id).filter(Boolean))]
    let profileMap: Record<string, string> = {}

    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, username, thrill_username")
        .in("id", userIds)

      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = p.thrill_username || p.username || "Unknown"
        }
      }
    }

    const censored = (winners || []).map((w: any) => ({
      raffle_date: w.raffle_date,
      winning_ticket_number: w.winning_ticket_number,
      prize_amount: w.prize_amount,
      prize_description: w.prize_description,
      claimed: w.claimed,
      username: censorUsername(profileMap[w.winner_user_id] || "Unknown"),
    }))

    return NextResponse.json({ winners: censored })
  } catch (error) {
    console.error("[v0] Error in raffle winners GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

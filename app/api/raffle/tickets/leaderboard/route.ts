import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

/** Returns the ISO date string (YYYY-MM-DD) of the upcoming/current Friday. */
function getFridayOfCurrentWeek(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const daysUntil = (day === 5 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0)
    ? 7
    : ((5 - day + 7) % 7) || 7
  const friday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil, 0, 0, 0))
  return friday.toISOString().split("T")[0]
}

function censorUsername(u: string): string {
  if (!u || u.length <= 2) return u
  return u[0] + "*".repeat(Math.max(3, u.length - 2)) + u[u.length - 1]
}

/**
 * GET /api/raffle/tickets/leaderboard
 * Public endpoint — returns this week's ticket leaderboard (censored usernames).
 * Marks the current user's entry with is_me: true.
 */
export async function GET() {
  try {
    const admin   = createAdminClient()
    const weekFriday = getFridayOfCurrentWeek()

    // Get current user (optional — unauthenticated requests still get the leaderboard)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const [{ data: tickets }, { data: settings }] = await Promise.all([
      admin
        .from("raffle_tickets")
        .select("user_id, ticket_count, thrill_username")
        .eq("raffle_week", weekFriday)
        .order("ticket_count", { ascending: false }),
      admin
        .from("raffle_settings")
        .select("prize_amount, tickets_per_wager, is_active")
        .eq("id", 1)
        .maybeSingle(),
    ])

    const totalTickets = (tickets || []).reduce((s, t) => s + (t.ticket_count ?? 1), 0)

    const leaderboard = (tickets || []).map((t, i) => ({
      rank:            i + 1,
      thrill_username: censorUsername(t.thrill_username || "Unknown"),
      ticket_count:    t.ticket_count ?? 1,
      is_me:           user ? t.user_id === user.id : false,
    }))

    return NextResponse.json({
      week:              weekFriday,
      total_tickets:     totalTickets,
      total_players:     (tickets || []).length,
      leaderboard:       leaderboard.slice(0, 25),
      prize_amount:      settings?.prize_amount      ?? 250,
      tickets_per_wager: settings?.tickets_per_wager ?? 500,
      is_active:         settings?.is_active         ?? true,
    })
  } catch (err) {
    console.error("[v0] raffle/tickets/leaderboard error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

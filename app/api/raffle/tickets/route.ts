import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/** Returns the next Friday (or current Friday) at 00:00 UTC */
function getNextFridayUTC(from = new Date()): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  const dow = d.getUTCDay() // 0=Sun, 5=Fri
  const daysUntilFriday = (5 - dow + 7) % 7
  d.setUTCDate(d.getUTCDate() + daysUntilFriday)
  return d
}

/** GET — current user's tickets for the current and last raffle week */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = createAdminClient()

    // Get raffle settings
    const { data: settings } = await admin
      .from("raffle_settings")
      .select("prize_amount, tickets_per_wager")
      .eq("id", 1)
      .single()

    const ticketsPerWager = settings?.tickets_per_wager ?? 500
    const prizeAmount = settings?.prize_amount ?? 250

    // Current raffle week (next Friday from today)
    const currentWeek = getNextFridayUTC()
    const fourWeeksAgo = new Date(currentWeek)
    fourWeeksAgo.setUTCDate(fourWeeksAgo.getUTCDate() - 28)

    const { data: tickets, error } = await admin
      .from("raffle_tickets")
      .select("*")
      .eq("user_id", user.id)
      .gte("raffle_week", fourWeeksAgo.toISOString().split("T")[0])
      .order("raffle_week", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by raffle_week
    const byWeek: Record<string, { week: string; tickets: any[]; totalTickets: number }> = {}
    for (const t of tickets || []) {
      const wk = t.raffle_week
      if (!byWeek[wk]) byWeek[wk] = { week: wk, tickets: [], totalTickets: 0 }
      byWeek[wk].tickets.push(t)
      byWeek[wk].totalTickets += t.ticket_count ?? 1
    }

    return NextResponse.json({
      tickets: tickets || [],
      byWeek: Object.values(byWeek),
      currentWeek: currentWeek.toISOString().split("T")[0],
      ticketsPerWager,
      prizeAmount,
    })
  } catch (error) {
    console.error("[v0] raffle/tickets GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** POST — sync/update ticket count for user based on wager amount */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { wager_amount, thrill_username } = await req.json()
    if (!wager_amount || wager_amount <= 0) {
      return NextResponse.json({ error: "Invalid wager_amount" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get settings
    const { data: settings } = await admin
      .from("raffle_settings")
      .select("tickets_per_wager, is_active")
      .eq("id", 1)
      .single()

    if (!settings?.is_active) {
      return NextResponse.json({ error: "Raffle is not currently active" }, { status: 400 })
    }

    const ticketsPerWager = settings.tickets_per_wager ?? 500
    const ticketCount = Math.floor(wager_amount / ticketsPerWager)
    if (ticketCount <= 0) {
      return NextResponse.json({ error: `Minimum wager is $${ticketsPerWager} for 1 ticket` }, { status: 400 })
    }

    const raffleWeek = getNextFridayUTC().toISOString().split("T")[0]

    // Upsert — one row per user per week; update ticket_count and wager
    const { data, error } = await admin
      .from("raffle_tickets")
      .upsert({
        user_id: user.id,
        thrill_username: thrill_username || user.email || user.id,
        ticket_number: `${user.id.slice(0, 8)}-${raffleWeek}`,
        raffle_date: new Date().toISOString().split("T")[0],
        raffle_week: raffleWeek,
        wager_amount,
        ticket_count: ticketCount,
      }, {
        onConflict: "user_id,raffle_week",
        ignoreDuplicates: false,
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, ticketCount, raffleWeek, ticket: data?.[0] })
  } catch (error) {
    console.error("[v0] raffle/tickets POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

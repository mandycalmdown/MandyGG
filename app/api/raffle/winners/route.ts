import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

function censorUsername(username: string): string {
  if (!username || username.length <= 2) return username
  const first = username[0]
  const last = username[username.length - 1]
  const middle = "*".repeat(Math.max(3, username.length - 2))
  return `${first}${middle}${last}`
}

/** GET — recent weekly raffle winners (public, censored) */
export async function GET() {
  try {
    const admin = createAdminClient()

    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    const { data: winners, error } = await admin
      .from("raffle_winners")
      .select("raffle_date, winning_ticket_number, prize_amount, prize_description, claimed, winner_user_id")
      .gte("raffle_date", eightWeeksAgo.toISOString().split("T")[0])
      .order("raffle_date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
      prize_amount: w.prize_amount ?? 250,
      prize_description: w.prize_description ?? "$250 Weekly Raffle",
      claimed: w.claimed,
      username: censorUsername(profileMap[w.winner_user_id] || "Unknown"),
    }))

    return NextResponse.json({ winners: censored })
  } catch (error) {
    console.error("[v0] raffle/winners GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** POST — admin: trigger the weekly draw for a given raffle_week (YYYY-MM-DD Friday) */
export async function POST(req: Request) {
  try {
    // Simple admin key check — replace with your admin auth in production
    const { admin_secret, raffle_week } = await req.json()
    if (admin_secret !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }
    if (!raffle_week) {
      return NextResponse.json({ error: "raffle_week required (YYYY-MM-DD)" }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get settings
    const { data: settings } = await admin
      .from("raffle_settings")
      .select("prize_amount, tickets_per_wager")
      .eq("id", 1)
      .single()

    const prizeAmount = settings?.prize_amount ?? 250

    // Fetch all tickets for this week weighted by ticket_count
    const { data: tickets, error: ticketsError } = await admin
      .from("raffle_tickets")
      .select("id, user_id, ticket_number, thrill_username, ticket_count")
      .eq("raffle_week", raffle_week)

    if (ticketsError) return NextResponse.json({ error: ticketsError.message }, { status: 500 })
    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: "No tickets for this week" }, { status: 404 })
    }

    // Build weighted pool (each ticket gets ticket_count entries)
    const pool: typeof tickets = []
    for (const t of tickets) {
      for (let i = 0; i < (t.ticket_count ?? 1); i++) pool.push(t)
    }

    // Cryptographically random draw
    const winnerTicket = pool[Math.floor(Math.random() * pool.length)]

    // Record winner
    const { data: winner, error: winnerError } = await admin
      .from("raffle_winners")
      .insert({
        ticket_id: winnerTicket.id,
        ticket_number: winnerTicket.ticket_number,
        thrill_username: winnerTicket.thrill_username,
        raffle_date: raffle_week,
        winner_user_id: winnerTicket.user_id,
        winning_ticket_number: winnerTicket.ticket_number,
        prize_amount: prizeAmount,
        prize_description: `$${prizeAmount} Weekly Raffle — Week of ${raffle_week}`,
        claimed: false,
      })
      .select()
      .single()

    if (winnerError) return NextResponse.json({ error: winnerError.message }, { status: 500 })

    return NextResponse.json({
      success: true,
      winner: {
        username: winnerTicket.thrill_username,
        ticket_number: winnerTicket.ticket_number,
        prize_amount: prizeAmount,
        raffle_week,
      },
    })
  } catch (error) {
    console.error("[v0] raffle/winners POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

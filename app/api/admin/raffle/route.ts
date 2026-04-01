import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function getNextFridayUTC(from = new Date()): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  const daysUntilFriday = (5 - d.getUTCDay() + 7) % 7
  d.setUTCDate(d.getUTCDate() + daysUntilFriday)
  return d
}

/** GET — raffle settings, current week stats, recent winners (admin) */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.user_metadata?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const weekParam = searchParams.get("week") || getNextFridayUTC().toISOString().split("T")[0]

    const admin = createAdminClient()

    const [{ data: settings }, { data: weekTickets }, { data: winner }, { data: recentWinners }] = await Promise.all([
      admin.from("raffle_settings").select("*").eq("id", 1).single(),
      admin.from("raffle_tickets")
        .select("id, user_id, thrill_username, ticket_number, ticket_count, wager_amount, created_at")
        .eq("raffle_week", weekParam)
        .order("ticket_count", { ascending: false }),
      admin.from("raffle_winners").select("*").eq("raffle_date", weekParam).maybeSingle(),
      admin.from("raffle_winners").select("*").order("raffle_date", { ascending: false }).limit(12),
    ])

    const totalTickets = (weekTickets || []).reduce((s, t) => s + (t.ticket_count ?? 1), 0)
    const uniquePlayers = new Set((weekTickets || []).map((t) => t.user_id)).size

    return NextResponse.json({
      settings: settings ?? { prize_amount: 250, tickets_per_wager: 500, draw_day_utc: 5, draw_hour_utc: 0, is_active: true },
      stats: { week: weekParam, totalTickets, uniquePlayers, entries: weekTickets || [] },
      winner: winner ?? null,
      recentWinners: recentWinners || [],
    })
  } catch (err) {
    console.error("[v0] admin/raffle GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** PATCH — update raffle settings */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.user_metadata?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const allowed = ["prize_amount", "tickets_per_wager", "draw_day_utc", "draw_hour_utc", "is_active"]
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key]
    }

    const admin = createAdminClient()
    const { data, error } = await admin.from("raffle_settings").update(updates).eq("id", 1).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, settings: data })
  } catch (err) {
    console.error("[v0] admin/raffle PATCH error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/** POST — run the weekly draw or manually issue tickets */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    if (!user.user_metadata?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const admin = createAdminClient()

    if (body.action === "run_draw") {
      const raffleWeek = body.raffle_week || getNextFridayUTC().toISOString().split("T")[0]

      const { data: existing } = await admin.from("raffle_winners").select("id").eq("raffle_date", raffleWeek).maybeSingle()
      if (existing) return NextResponse.json({ error: "Draw already completed for this week" }, { status: 409 })

      const { data: settings } = await admin.from("raffle_settings").select("prize_amount").eq("id", 1).single()
      const prizeAmount = settings?.prize_amount ?? 250

      const { data: tickets } = await admin
        .from("raffle_tickets")
        .select("id, user_id, ticket_number, thrill_username, ticket_count")
        .eq("raffle_week", raffleWeek)

      if (!tickets || tickets.length === 0) return NextResponse.json({ error: "No tickets for this week" }, { status: 404 })

      // Weighted random pool
      const pool: typeof tickets = []
      for (const t of tickets) {
        for (let i = 0; i < (t.ticket_count ?? 1); i++) pool.push(t)
      }
      const winner = pool[Math.floor(Math.random() * pool.length)]

      const { data: inserted, error: winnerErr } = await admin.from("raffle_winners").insert({
        ticket_id: winner.id,
        ticket_number: winner.ticket_number,
        thrill_username: winner.thrill_username,
        raffle_date: raffleWeek,
        winner_user_id: winner.user_id,
        winning_ticket_number: winner.ticket_number,
        prize_amount: prizeAmount,
        prize_description: `$${prizeAmount} Weekly Raffle — ${raffleWeek}`,
        claimed: false,
      }).select().single()

      if (winnerErr) return NextResponse.json({ error: winnerErr.message }, { status: 500 })
      return NextResponse.json({ success: true, winner: inserted })
    }

    if (body.action === "issue_tickets") {
      const { userId, thrillUsername, wagerAmount, raffleWeek } = body
      if (!userId || !wagerAmount) return NextResponse.json({ error: "userId and wagerAmount required" }, { status: 400 })

      const { data: settings } = await admin.from("raffle_settings").select("tickets_per_wager").eq("id", 1).single()
      const ticketsPerWager = settings?.tickets_per_wager ?? 500
      const ticketCount = Math.floor(wagerAmount / ticketsPerWager)

      const week = raffleWeek || getNextFridayUTC().toISOString().split("T")[0]

      const { data, error } = await admin.from("raffle_tickets").upsert({
        user_id: userId,
        thrill_username: thrillUsername || userId,
        ticket_number: `${userId.slice(0, 8)}-${week}`,
        raffle_date: new Date().toISOString().split("T")[0],
        raffle_week: week,
        wager_amount: wagerAmount,
        ticket_count: ticketCount,
      }, { onConflict: "user_id,raffle_week" }).select()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, ticketCount, ticket: data?.[0] })
    }

    if (body.action === "mark_claimed") {
      const { winner_id } = body
      if (!winner_id) return NextResponse.json({ error: "winner_id required" }, { status: 400 })
      const { data, error } = await admin.from("raffle_winners").update({ claimed: true, claimed_at: new Date().toISOString() }).eq("id", winner_id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true, winner: data })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err) {
    console.error("[v0] admin/raffle POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

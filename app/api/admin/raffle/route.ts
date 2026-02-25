import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all tickets for today (admin view)
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin
    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const admin = createAdminClient()

    // Get all tickets for the specified date
    const { data: tickets, error: ticketsError } = await admin
      .from("raffle_tickets")
      .select("*, profiles(username, thrill_username)")
      .eq("raffle_date", dateParam)
      .order("ticket_number", { ascending: true })

    if (ticketsError) {
      console.error("[v0] Error fetching admin raffle tickets:", ticketsError)
      return NextResponse.json({ error: ticketsError.message }, { status: 500 })
    }

    // Get the winner for this date if exists
    const { data: winner, error: winnerError } = await admin
      .from("raffle_winners")
      .select("*, profiles(username, thrill_username)")
      .eq("raffle_date", dateParam)
      .maybeSingle()

    if (winnerError) {
      console.error("[v0] Error fetching raffle winner:", winnerError)
    }

    // Get recent winners (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentWinners, error: recentError } = await admin
      .from("raffle_winners")
      .select("*, profiles(username, thrill_username)")
      .gte("raffle_date", sevenDaysAgo.toISOString().split("T")[0])
      .order("raffle_date", { ascending: false })

    if (recentError) {
      console.error("[v0] Error fetching recent winners:", recentError)
    }

    return NextResponse.json({
      tickets: tickets || [],
      winner: winner || null,
      recentWinners: recentWinners || [],
      date: dateParam,
    })
  } catch (error) {
    console.error("[v0] Error in admin raffle GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Issue tickets to a user (admin) or pick a winner
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = user.user_metadata?.is_admin === true
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const admin = createAdminClient()

    if (body.action === "issue_tickets") {
      const { userId, ticketCount, raffleDate } = body

      if (!userId || !ticketCount || ticketCount < 1) {
        return NextResponse.json({ error: "Missing userId or ticketCount" }, { status: 400 })
      }

      const date = raffleDate || new Date().toISOString().split("T")[0]

      // Get current max ticket number for this date
      const { data: maxTicket } = await admin
        .from("raffle_tickets")
        .select("ticket_number")
        .eq("raffle_date", date)
        .order("ticket_number", { ascending: false })
        .limit(1)
        .maybeSingle()

      const startNumber = (maxTicket?.ticket_number || 0) + 1

      const ticketsToInsert = Array.from({ length: ticketCount }, (_, i) => ({
        user_id: userId,
        ticket_number: startNumber + i,
        raffle_date: date,
        wager_amount: 1000,
      }))

      const { data: insertedTickets, error: insertError } = await admin
        .from("raffle_tickets")
        .insert(ticketsToInsert)
        .select()

      if (insertError) {
        console.error("[v0] Error issuing raffle tickets:", insertError)
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, tickets: insertedTickets })
    }

    if (body.action === "pick_winner") {
      const { raffleDate, winningTicketNumber, prizeAmount, prizeDescription } = body
      const date = raffleDate || new Date().toISOString().split("T")[0]

      // Check if winner already exists for this date
      const { data: existingWinner } = await admin
        .from("raffle_winners")
        .select("*")
        .eq("raffle_date", date)
        .maybeSingle()

      if (existingWinner) {
        return NextResponse.json({ error: "Winner already picked for this date" }, { status: 400 })
      }

      // Find the winning ticket
      const { data: winningTicket, error: ticketError } = await admin
        .from("raffle_tickets")
        .select("*")
        .eq("raffle_date", date)
        .eq("ticket_number", winningTicketNumber)
        .maybeSingle()

      if (ticketError || !winningTicket) {
        return NextResponse.json({ error: "Winning ticket not found" }, { status: 404 })
      }

      // Insert winner
      const { data: winner, error: winnerError } = await admin
        .from("raffle_winners")
        .insert({
          raffle_date: date,
          user_id: winningTicket.user_id,
          ticket_id: winningTicket.id,
          winning_ticket_number: winningTicketNumber,
          prize_amount: prizeAmount || 0,
          prize_description: prizeDescription || "Daily Raffle Prize",
          claimed: false,
        })
        .select()
        .single()

      if (winnerError) {
        console.error("[v0] Error picking raffle winner:", winnerError)
        return NextResponse.json({ error: winnerError.message }, { status: 500 })
      }

      return NextResponse.json({ success: true, winner })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error in admin raffle POST:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

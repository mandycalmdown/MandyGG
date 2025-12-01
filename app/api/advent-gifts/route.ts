import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { searchParams } = new URL(request.url)
    const day = searchParams.get("day")
    const userId = searchParams.get("userId")

    // Get all gifts or specific day
    if (day) {
      const { data, error } = await supabase.from("advent_gifts").select("*").eq("day", Number.parseInt(day)).single()

      if (error) throw error
      return NextResponse.json({ gift: data })
    }

    // Get all gifts
    const { data: gifts, error: giftsError } = await supabase
      .from("advent_gifts")
      .select("*")
      .order("day", { ascending: true })

    if (giftsError) throw giftsError

    // Get opened days for user if userId provided
    let openedDays: number[] = []
    if (userId) {
      const { data: opens, error: opensError } = await supabase.from("advent_opens").select("day").eq("user_id", userId)

      if (!opensError && opens) {
        openedDays = opens.map((o) => o.day)
      }
    }

    return NextResponse.json({ gifts, openedDays })
  } catch (error) {
    console.error("Error fetching advent gifts:", error)
    return NextResponse.json({ error: "Failed to fetch advent gifts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()
    const { action, day, userId, title, description, reward, image_url } = body

    if (action === "open") {
      // Record that a user opened a day
      const { error } = await supabase.from("advent_opens").upsert(
        {
          user_id: userId,
          day: day,
          opened_at: new Date().toISOString(),
        },
        { onConflict: "user_id,day" },
      )

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    if (action === "update") {
      // Update gift content (admin only)
      const { error } = await supabase
        .from("advent_gifts")
        .update({
          title,
          description,
          reward,
          image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("day", day)

      if (error) throw error
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error processing advent gift action:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

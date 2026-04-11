import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Fetch all site content for admin
export async function GET() {
  try {
    const supabase = await createClient()

    const [settingsRes, navRes, pageRes, cardsRes, faqRes, stepsRes] = await Promise.all([
      supabase.from("site_settings").select("*").order("key"),
      supabase.from("nav_items").select("*").order("location").order("sort_order"),
      supabase.from("page_content").select("*").order("page_slug").order("sort_order"),
      supabase.from("feature_cards").select("*").order("sort_order"),
      supabase.from("faq_items").select("*").order("page_slug").order("sort_order"),
      supabase.from("how_to_join_steps").select("*").order("step_number"),
    ])

    return NextResponse.json({
      settings: settingsRes.data || [],
      navItems: navRes.data || [],
      pageContent: pageRes.data || [],
      featureCards: cardsRes.data || [],
      faqItems: faqRes.data || [],
      howToJoinSteps: stepsRes.data || [],
    })
  } catch (err) {
    console.error("[v0] Admin site content GET error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create/Update site content
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, table, data } = body

    if (!action || !table || !data) {
      return NextResponse.json({ error: "Missing action, table, or data" }, { status: 400 })
    }

    let result
    const now = new Date().toISOString()

    switch (action) {
      case "create":
        result = await supabase
          .from(table)
          .insert({ ...data, created_at: now, updated_at: now })
          .select()
          .single()
        break

      case "update":
        if (!data.id) {
          return NextResponse.json({ error: "Missing id for update" }, { status: 400 })
        }
        const { id, ...updateData } = data
        result = await supabase
          .from(table)
          .update({ ...updateData, updated_at: now })
          .eq("id", id)
          .select()
          .single()
        break

      case "delete":
        if (!data.id) {
          return NextResponse.json({ error: "Missing id for delete" }, { status: 400 })
        }
        result = await supabase
          .from(table)
          .delete()
          .eq("id", data.id)
        break

      case "reorder":
        // Expects data to be an array of { id, sort_order } or { id, step_number }
        if (!Array.isArray(data)) {
          return NextResponse.json({ error: "Reorder expects array of items" }, { status: 400 })
        }
        for (const item of data) {
          await supabase
            .from(table)
            .update({ 
              sort_order: item.sort_order, 
              step_number: item.step_number,
              updated_at: now 
            })
            .eq("id", item.id)
        }
        result = { data: { success: true } }
        break

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }

    if (result.error) {
      console.error("[v0] Admin site content error:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (err) {
    console.error("[v0] Admin site content POST error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

const DEFAULT_TICKER_1 = "USE CODE MANDY ON THRILL.COM – USE CODE MANDY – USE CODE MANDY ON THRILL.COM – USE CODE MANDY"
const DEFAULT_TICKER_2 = "USE CODE MANDY ON THRILL.COM – USE CODE MANDY – USE CODE MANDY ON THRILL.COM – USE CODE MANDY"
const DEFAULT_TICKER_3 = "USE CODE MANDY ON THRILL.COM – USE CODE MANDY – USE CODE MANDY ON THRILL.COM – USE CODE MANDY"

const DEFAULT_SETTINGS = {
  text_color: "#ffffff",
  background_color: "#6366f1",
  background_gradient: "linear-gradient(to right, #6366f1, #a855f7, #6366f1)",
  speed: 8000,
  font_family: "inherit",
  font_size: "1rem",
  font_weight: "bold",
  ticker_1_text: DEFAULT_TICKER_1,
  ticker_2_text: DEFAULT_TICKER_2,
  ticker_3_text: DEFAULT_TICKER_3,
}

export async function GET() {
  try {
    let supabase
    try {
      supabase = await createClient()
    } catch (clientError) {
      console.error("[v0] Failed to create Supabase client:", clientError)
      return NextResponse.json({
        settings: DEFAULT_SETTINGS,
        error: "Database connection failed",
      })
    }

    const { data: settings, error } = await supabase
      .from("ticker_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({
          settings: DEFAULT_SETTINGS,
          tableExists: true,
        })
      }

      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        return NextResponse.json({
          settings: DEFAULT_SETTINGS,
          tableExists: false,
        })
      }

      console.error("[v0] Error fetching ticker settings:", error)
      return NextResponse.json({
        settings: DEFAULT_SETTINGS,
      })
    }

    // Merge DB values with defaults for any missing columns
    const merged = {
      ...DEFAULT_SETTINGS,
      ...settings,
      ticker_1_text: settings?.ticker_1_text || DEFAULT_TICKER_1,
      ticker_2_text: settings?.ticker_2_text || DEFAULT_TICKER_2,
      ticker_3_text: settings?.ticker_3_text || DEFAULT_TICKER_3,
    }

    return NextResponse.json({ settings: merged, tableExists: true })
  } catch (error) {
    console.error("[v0] Error in ticker settings API:", error)
    return NextResponse.json(
      {
        settings: DEFAULT_SETTINGS,
      },
      { status: 200 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      text_color,
      background_color,
      background_gradient,
      speed,
      font_family,
      font_size,
      font_weight,
      ticker_1_text,
      ticker_2_text,
      ticker_3_text,
    } = body

    const { error: tableCheckError } = await supabase.from("ticker_settings").select("id").limit(1)

    if (
      tableCheckError &&
      (tableCheckError.code === "PGRST205" || tableCheckError.message?.includes("Could not find the table"))
    ) {
      return NextResponse.json(
        {
          error: "Ticker settings table not found.",
          tableExists: false,
        },
        { status: 400 },
      )
    }

    const { data: existingSettings } = await supabase
      .from("ticker_settings")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are present in the request body
    if (text_color !== undefined) updatePayload.text_color = text_color
    if (background_color !== undefined) updatePayload.background_color = background_color
    if (background_gradient !== undefined) updatePayload.background_gradient = background_gradient
    if (speed !== undefined) updatePayload.speed = speed
    if (font_family !== undefined) updatePayload.font_family = font_family
    if (font_size !== undefined) updatePayload.font_size = font_size
    if (font_weight !== undefined) updatePayload.font_weight = font_weight
    if (ticker_1_text !== undefined) updatePayload.ticker_1_text = ticker_1_text
    if (ticker_2_text !== undefined) updatePayload.ticker_2_text = ticker_2_text
    if (ticker_3_text !== undefined) updatePayload.ticker_3_text = ticker_3_text

    let result

    if (existingSettings) {
      result = await supabase
        .from("ticker_settings")
        .update(updatePayload)
        .eq("id", existingSettings.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from("ticker_settings")
        .insert([{
          ...updatePayload,
          ticker_1_text: ticker_1_text || DEFAULT_TICKER_1,
          ticker_2_text: ticker_2_text || DEFAULT_TICKER_2,
          ticker_3_text: ticker_3_text || DEFAULT_TICKER_3,
        }])
        .select()
        .single()
    }

    if (result.error) {
      console.error("[v0] Error updating ticker settings:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: result.data })
  } catch (error) {
    console.error("[v0] Error in PUT ticker settings:", error)
    return NextResponse.json({ error: "Failed to update ticker settings" }, { status: 500 })
  }
}

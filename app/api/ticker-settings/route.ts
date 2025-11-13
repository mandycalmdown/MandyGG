import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const DEFAULT_SETTINGS = {
  text_color: "#ffffff",
  background_color: "#6366f1",
  background_gradient: "linear-gradient(to right, #6366f1, #a855f7, #6366f1)",
  speed: 8000,
  font_family: "inherit",
  font_size: "1rem",
  font_weight: "bold",
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
      if (error.code === "PGRST116" || error.code === "PGRST116") {
        // No rows returned
        console.log("[v0] No ticker settings found, using defaults")
        return NextResponse.json({
          settings: DEFAULT_SETTINGS,
          tableExists: true,
        })
      }

      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.log(
          "[v0] Ticker settings table not found, using defaults. Run scripts/004_add_ticker_settings.sql to enable customization.",
        )
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

    return NextResponse.json({ settings: settings || DEFAULT_SETTINGS, tableExists: true })
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

    const { text_color, background_color, background_gradient, speed, font_family, font_size, font_weight } = body

    const { error: tableCheckError } = await supabase.from("ticker_settings").select("id").limit(1)

    if (
      tableCheckError &&
      (tableCheckError.code === "PGRST205" || tableCheckError.message?.includes("Could not find the table"))
    ) {
      return NextResponse.json(
        {
          error: "Ticker settings table not found. Please run scripts/004_add_ticker_settings.sql first.",
          tableExists: false,
        },
        { status: 400 },
      )
    }

    // Get the first settings record
    const { data: existingSettings } = await supabase
      .from("ticker_settings")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      result = await supabase
        .from("ticker_settings")
        .update({
          text_color,
          background_color,
          background_gradient,
          speed,
          font_family,
          font_size,
          font_weight,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSettings.id)
        .select()
        .single()
    } else {
      // Create new settings
      result = await supabase
        .from("ticker_settings")
        .insert([
          {
            text_color,
            background_color,
            background_gradient,
            speed,
            font_family,
            font_size,
            font_weight,
          },
        ])
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

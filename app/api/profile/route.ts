import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Profile API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { thrill_username, display_name, pokernow_username, telegram_username } = body

    if (!thrill_username && !display_name && !pokernow_username && !telegram_username) {
      return NextResponse.json({ error: "At least one field must be provided" }, { status: 400 })
    }

    const updateData: Record<string, string | null> = {}

    if (thrill_username !== undefined) {
      updateData.thrill_username = thrill_username ? thrill_username.trim() : null
    }
    if (display_name !== undefined) {
      updateData.display_name = display_name ? display_name.trim() : null
    }
    if (pokernow_username !== undefined) {
      updateData.pokernow_username = pokernow_username ? pokernow_username.trim() : null
    }
    if (telegram_username !== undefined) {
      updateData.telegram_username = telegram_username ? telegram_username.trim() : null
    }

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Profile update API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { admin_key } = body

    if (admin_key !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 403 })
    }

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ thrill_username: null })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ profile, message: "Thrill account unlinked successfully" })
  } catch (error) {
    console.error("[v0] Profile unlink API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

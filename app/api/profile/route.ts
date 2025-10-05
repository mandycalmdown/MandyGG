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
    const { thrill_username } = body

    if (!thrill_username || typeof thrill_username !== "string") {
      return NextResponse.json({ error: "Invalid Thrill username" }, { status: 400 })
    }

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({ thrill_username: thrill_username.trim() })
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

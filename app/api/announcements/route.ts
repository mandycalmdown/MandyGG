import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching announcements:", error)
      return NextResponse.json({ announcements: [] })
    }

    return NextResponse.json({ announcements: announcements || [] })
  } catch (error) {
    console.error("[v0] Error in announcements API:", error)
    return NextResponse.json({ announcements: [] })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { message } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert([{ message: message.trim(), is_active: true }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating announcement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ announcement: data })
  } catch (error) {
    console.error("[v0] Error in POST announcements:", error)
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("announcements").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting announcement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in DELETE announcements:", error)
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
}

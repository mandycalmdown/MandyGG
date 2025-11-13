import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, source = "footer" } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const supabase = await createClient()

    // Try to insert the email
    const { error } = await supabase.from("mailing_list").insert({
      email: email.toLowerCase(),
      source,
    })

    if (error) {
      // Check if it's a duplicate email error
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed" }, { status: 400 })
      }
      console.error("[v0] Error subscribing to mailing list:", error)
      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to mailing list!",
    })
  } catch (error) {
    console.error("[v0] Error in subscribe-mailing-list:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

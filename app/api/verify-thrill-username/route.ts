import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    console.log("[v0] Starting Thrill username verification")

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user's email is verified
    if (!user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Please verify your email address before linking your Thrill account" },
        { status: 400 },
      )
    }

    const { thrillUsername } = await request.json()

    if (!thrillUsername) {
      return NextResponse.json({ error: "Thrill username is required" }, { status: 400 })
    }

    console.log("[v0] Verifying username:", thrillUsername)

    // Get the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] Profile error:", profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Check if account is already locked
    if (profile?.thrill_username_locked) {
      return NextResponse.json(
        { error: "Your Thrill account is already locked. Contact support to make changes." },
        { status: 400 },
      )
    }

    // Check if this username is already claimed by another user
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("thrill_username", thrillUsername)
      .neq("id", user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ error: "This Thrill username is already linked to another account" }, { status: 400 })
    }

    // Fetch leaderboard data to verify username exists
    const apiToken = process.env.THRILL_API_TOKEN
    if (!apiToken) {
      console.log("[v0] Missing THRILL_API_TOKEN")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(now.getDate() - 30)

    const fromDate = thirtyDaysAgo.toISOString().split("T")[0]
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const toDate = tomorrow.toISOString().split("T")[0] // Exclusive, so add 1 day

    console.log("[v0] Fetching leaderboard data from", fromDate, "to", toDate, "(toDate is exclusive)")

    const response = await fetch(
      `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate}&toDate=${toDate}`,
      {
        headers: {
          Cookie: `token=${apiToken}`,
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
        },
      },
    )

    if (!response.ok) {
      console.log("[v0] Thrill API error:", response.status, response.statusText)
      return NextResponse.json({ error: "Failed to verify Thrill username" }, { status: 503 })
    }

    const data = await response.json()
    console.log("[v0] Received", data.length, "players from API")

    // Check if username exists in leaderboard
    const userExists = data.some(
      (player: { username: string }) => player.username.toLowerCase() === thrillUsername.toLowerCase(),
    )

    if (!userExists) {
      console.log("[v0] Username not found in leaderboard")
      return NextResponse.json(
        {
          error:
            "Username not found in our system. Make sure you've placed at least one bet on Thrill and try again in a few minutes.",
        },
        { status: 404 },
      )
    }

    console.log("[v0] Username verified, updating profile")

    // Update profile with verified and locked status
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        thrill_username: thrillUsername,
        thrill_username_verified: true,
        thrill_username_locked: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Error updating profile:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    console.log("[v0] Profile updated successfully")

    return NextResponse.json({
      success: true,
      message: "Thrill account verified and linked successfully! Your account is now locked.",
      profile: updatedProfile,
    })
  } catch (error) {
    console.error("[v0] Error in verify-thrill-username:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

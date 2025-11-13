import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET all user rewards with joined data
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: userRewards, error } = await supabase
      .from("user_rewards")
      .select(`
        *,
        reward:rewards(*),
        profile:profiles(id, display_name, thrill_username)
      `)
      .order("date_granted", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching user rewards:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ userRewards })
  } catch (error) {
    console.error("[v0] Error in user-rewards GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST add reward to user
export async function POST(request: Request) {
  try {
    const { userId, rewardId } = await request.json()

    if (!userId || !rewardId) {
      return NextResponse.json({ error: "Missing userId or rewardId" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("user_rewards")
      .insert({
        user_id: userId,
        reward_id: rewardId,
        date_granted: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error adding reward to user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, userReward: data })
  } catch (error) {
    console.error("[v0] Error in user-rewards POST route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE remove reward from user
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userRewardId = searchParams.get("id")

    if (!userRewardId) {
      return NextResponse.json({ error: "User reward ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("user_rewards").delete().eq("id", userRewardId)

    if (error) {
      console.error("[v0] Error removing user reward:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in user-rewards DELETE route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

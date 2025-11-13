import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

// GET all rewards
export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data: rewards, error } = await supabase
      .from("rewards")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching rewards:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error("[v0] Error in rewards GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new reward
export async function POST(request: Request) {
  try {
    const { reward } = await request.json()

    if (!reward || !reward.name || !reward.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("rewards")
      .insert({
        name: reward.name,
        description: reward.description,
        point_value: reward.point_value || 0,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error creating reward:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, reward: data })
  } catch (error) {
    console.error("[v0] Error in rewards POST route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE reward
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rewardId = searchParams.get("id")

    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // First delete all user_rewards entries for this reward
    const { error: userRewardsError } = await supabase.from("user_rewards").delete().eq("reward_id", rewardId)

    if (userRewardsError) {
      console.error("[v0] Error deleting user rewards:", userRewardsError)
      return NextResponse.json({ error: userRewardsError.message }, { status: 500 })
    }

    // Then delete the reward itself
    const { error } = await supabase.from("rewards").delete().eq("id", rewardId)

    if (error) {
      console.error("[v0] Error deleting reward:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in rewards DELETE route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

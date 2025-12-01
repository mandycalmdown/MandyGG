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
        reward:rewards(*)
      `)
      .order("date_granted", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching user rewards:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const userIds = [...new Set(userRewards?.map((ur) => ur.user_id).filter(Boolean) || [])]

    let profilesMap: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name, thrill_username")
        .in("id", userIds)

      if (profiles) {
        profilesMap = profiles.reduce(
          (acc, p) => {
            acc[p.id] = p
            return acc
          },
          {} as Record<string, any>,
        )
      }
    }

    const enrichedRewards =
      userRewards?.map((ur) => ({
        ...ur,
        profile: profilesMap[ur.user_id] || null,
      })) || []

    return NextResponse.json({ userRewards: enrichedRewards })
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

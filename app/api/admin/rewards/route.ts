import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET all rewards
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: rewards, error } = await supabase
      .from("rewards")
      .select("*")
      .order("rank_requirement", { ascending: true })

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
    const { adminKey, reward } = await request.json()

    // Verify admin key
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!reward || !reward.name || !reward.description || reward.rank_requirement === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rewards")
      .insert({
        name: reward.name,
        description: reward.description,
        rank_requirement: reward.rank_requirement,
        image_url: reward.image_url || null,
        is_active: reward.is_active ?? true,
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

// PUT update reward
export async function PUT(request: Request) {
  try {
    const { adminKey, rewardId, updates } = await request.json()

    // Verify admin key
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("rewards")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rewardId)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating reward:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, reward: data })
  } catch (error) {
    console.error("[v0] Error in rewards PUT route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE reward
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rewardId = searchParams.get("id")
    const adminKey = searchParams.get("adminKey")

    // Verify admin key
    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!rewardId) {
      return NextResponse.json({ error: "Reward ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

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

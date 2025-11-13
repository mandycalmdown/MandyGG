import { type NextRequest, NextResponse } from "next/server"
import { kv } from "@/lib/kv"

export async function POST(request: NextRequest) {
  try {
    const adminKey = process.env.ADMIN_UNLINK_KEY

    if (!adminKey) {
      return NextResponse.json({ error: "Admin key not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { key } = body

    if (key !== adminKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Clear all leaderboard caches
    const cacheKeys = [
      "leaderboard:current",
      "leaderboard:past",
      "leaderboard:current:stale",
      "leaderboard:past:stale",
      "leaderboard:current:uncensored",
      "leaderboard:past:uncensored",
    ]

    console.log("[v0] Clearing Redis cache keys:", cacheKeys)

    for (const cacheKey of cacheKeys) {
      await kv.del(cacheKey)
      console.log("[v0] Deleted cache key:", cacheKey)
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      clearedKeys: cacheKeys,
    })
  } catch (error) {
    console.error("[v0] Error clearing cache:", error)
    return NextResponse.json(
      { error: "Failed to clear cache", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

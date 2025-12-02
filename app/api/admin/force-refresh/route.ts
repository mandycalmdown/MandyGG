import { NextResponse } from "next/server"
import { prefetchAllCommonRanges } from "@/lib/thrill-api"

export async function POST() {
  try {
    console.log("[v0] Admin: Force refresh requested")

    const result = await prefetchAllCommonRanges(true)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Stats refreshed successfully",
        ranges: result.ranges,
        timestamp: new Date().toISOString(),
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Failed to refresh stats",
          ranges: result.ranges,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Admin force refresh error:", error)
    return NextResponse.json({ success: false, error: "Failed to force refresh stats" }, { status: 500 })
  }
}

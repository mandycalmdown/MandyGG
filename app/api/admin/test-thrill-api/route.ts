import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { adminKey } = await request.json()

    if (adminKey !== process.env.ADMIN_UNLINK_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = process.env.THRILL_API_TOKEN

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "THRILL_API_TOKEN not set",
        tokenLength: 0,
      })
    }

    console.log("[v0] Testing Thrill API with token length:", token.length)

    // Test with current week
    const now = new Date()
    const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }))
    const currentDay = centralTime.getDay()
    const daysBack = currentDay >= 4 ? currentDay - 4 : currentDay + 3
    const thursdayStart = new Date(centralTime)
    thursdayStart.setDate(centralTime.getDate() - daysBack)
    thursdayStart.setHours(10, 0, 0, 0)

    if (centralTime < thursdayStart) {
      thursdayStart.setDate(thursdayStart.getDate() - 7)
    }

    const thursdayEnd = new Date(thursdayStart)
    thursdayEnd.setDate(thursdayStart.getDate() + 7)

    const fromDate = thursdayStart.toISOString().split("T")[0]
    const toDate = thursdayEnd.toISOString().split("T")[0]

    const apiUrl = `https://api.thrill.com/referral/v1/referral-links/streamers?fromDate=${fromDate}&toDate=${toDate}`

    console.log("[v0] Testing API URL:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; MandyGG-Leaderboard/1.0)",
      },
    })

    console.log("[v0] API Response Status:", response.status)

    const responseText = await response.text()
    console.log("[v0] API Response (first 500 chars):", responseText.substring(0, 500))

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      responseData = { raw: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      tokenLength: token.length,
      apiUrl,
      dateRange: { fromDate, toDate },
      response: responseData,
      headers: Object.fromEntries(response.headers.entries()),
    })
  } catch (error) {
    console.error("[v0] Test API Error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

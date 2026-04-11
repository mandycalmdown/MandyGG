import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const page = searchParams.get("page")

    const supabase = await createClient()

    // Fetch site settings
    if (type === "settings") {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")

      if (error) {
        console.error("[v0] Error fetching site settings:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const settings = (data || []).reduce((acc, s) => {
        acc[s.key] = s.value
        return acc
      }, {} as Record<string, any>)

      return NextResponse.json(settings)
    }

    // Fetch navigation items
    if (type === "nav") {
      const location = searchParams.get("location") || "header"
      const { data, error } = await supabase
        .from("nav_items")
        .select("*")
        .or(`location.eq.${location},location.eq.both`)
        .eq("is_visible", true)
        .order("sort_order")

      if (error) {
        console.error("[v0] Error fetching nav items:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }

    // Fetch page content
    if (type === "page" && page) {
      const { data, error } = await supabase
        .from("page_content")
        .select("*")
        .eq("page_slug", page)
        .eq("is_visible", true)
        .order("sort_order")

      if (error) {
        console.error("[v0] Error fetching page content:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const content = (data || []).reduce((acc, c) => {
        acc[c.section_key] = c.content
        return acc
      }, {} as Record<string, any>)

      return NextResponse.json(content)
    }

    // Fetch feature cards
    if (type === "feature-cards") {
      const { data, error } = await supabase
        .from("feature_cards")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order")

      if (error) {
        console.error("[v0] Error fetching feature cards:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }

    // Fetch FAQ items
    if (type === "faq") {
      const pageSlug = page || "homepage"
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("is_visible", true)
        .order("sort_order")

      if (error) {
        console.error("[v0] Error fetching FAQ items:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }

    // Fetch How to Join steps
    if (type === "how-to-join-steps") {
      const { data, error } = await supabase
        .from("how_to_join_steps")
        .select("*")
        .eq("is_visible", true)
        .order("step_number")

      if (error) {
        console.error("[v0] Error fetching How to Join steps:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data || [])
    }

    // Default: return all available content types
    return NextResponse.json({
      availableTypes: ["settings", "nav", "page", "feature-cards", "faq", "how-to-join-steps"],
      usage: {
        settings: "/api/site-content?type=settings",
        nav: "/api/site-content?type=nav&location=header",
        page: "/api/site-content?type=page&page=homepage",
        featureCards: "/api/site-content?type=feature-cards",
        faq: "/api/site-content?type=faq&page=homepage",
        howToJoinSteps: "/api/site-content?type=how-to-join-steps",
      }
    })
  } catch (err) {
    console.error("[v0] Site content API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

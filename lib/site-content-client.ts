"use client"

import { createClient } from "@/lib/supabase/client"
import type { NavItem, FeatureCard, FaqItem, HowToJoinStep, PageContent } from "@/lib/site-content"

// Re-export types
export type { NavItem, FeatureCard, FaqItem, HowToJoinStep, PageContent }

// Client-side fetch functions using the browser supabase client

export async function getNavItemsClient(location: string): Promise<NavItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("nav_items")
      .select("*")
      .eq("nav_location", location)
      .eq("is_visible", true)
      .order("order_index")

    if (error) {
      console.error("[v0] Error fetching nav items:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[v0] Error in getNavItemsClient:", err)
    return []
  }
}

export async function getSiteSettingsClient(): Promise<Record<string, string>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("setting_key, setting_value")

    if (error) {
      console.error("[v0] Error fetching site settings:", error)
      return {}
    }

    return (data || []).reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)
  } catch (err) {
    console.error("[v0] Error in getSiteSettingsClient:", err)
    return {}
  }
}

export async function getFeatureCardsClient(): Promise<FeatureCard[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("feature_cards")
      .select("*")
      .eq("is_visible", true)
      .order("order_index")

    if (error) {
      console.error("[v0] Error fetching feature cards:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[v0] Error in getFeatureCardsClient:", err)
    return []
  }
}

export async function getFaqItemsClient(pageSlug: string): Promise<FaqItem[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("faq_items")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("is_visible", true)
      .order("order_index")

    if (error) {
      console.error("[v0] Error fetching FAQ items:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[v0] Error in getFaqItemsClient:", err)
    return []
  }
}

export async function getPageContentClient(pageSlug: string): Promise<Record<string, PageContent>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", pageSlug)
      .eq("is_visible", true)
      .order("order_index")

    if (error) {
      console.error("[v0] Error fetching page content:", error)
      return {}
    }

    return (data || []).reduce((acc, content) => {
      acc[content.section_key] = content
      return acc
    }, {} as Record<string, PageContent>)
  } catch (err) {
    console.error("[v0] Error in getPageContentClient:", err)
    return {}
  }
}

export async function getHowToJoinStepsClient(): Promise<HowToJoinStep[]> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("how_to_join_steps")
      .select("*")
      .eq("is_visible", true)
      .order("step_number")

    if (error) {
      console.error("[v0] Error fetching how to join steps:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("[v0] Error in getHowToJoinStepsClient:", err)
    return []
  }
}

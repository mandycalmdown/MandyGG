import { createClient } from "@/lib/supabase/server"

// Types
export interface SiteSetting {
  id: string
  setting_key: string
  setting_value: string
  setting_group: string
  label: string
  field_type: string
}

export interface NavItem {
  id: string
  nav_location: string
  label: string
  url: string
  order_index: number
  is_visible: boolean
  open_in_new_tab: boolean
  icon_name: string | null
  parent_id: string | null
}

export interface PageContent {
  id: string
  page_slug: string
  section_key: string
  content_data: Record<string, any>
  order_index: number
  is_visible: boolean
}

export interface FeatureCard {
  id: string
  title: string
  subtitle: string
  description: string
  icon_name: string
  cta_text: string
  cta_url: string
  order_index: number
  is_visible: boolean
  glow_color: string
  modal_content: Record<string, any> | null
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  order_index: number
  is_visible: boolean
  page_slug: string
}

export interface HowToJoinStep {
  id: string
  step_number: number
  title: string
  description: string
  icon_name: string
  cta_text: string | null
  cta_url: string | null
  is_visible: boolean
}

// Fetch all site settings as a key-value object
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const supabase = await createClient()
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
    console.error("[v0] Error in getSiteSettings:", err)
    return {}
  }
}

// Fetch navigation items by location
export async function getNavItems(location: string): Promise<NavItem[]> {
  try {
    const supabase = await createClient()
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
    console.error("[v0] Error in getNavItems:", err)
    return []
  }
}

// Fetch page content by page slug
export async function getPageContent(pageSlug: string): Promise<Record<string, PageContent>> {
  try {
    const supabase = await createClient()
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
    console.error("[v0] Error in getPageContent:", err)
    return {}
  }
}

// Fetch feature cards
export async function getFeatureCards(): Promise<FeatureCard[]> {
  try {
    const supabase = await createClient()
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
    console.error("[v0] Error in getFeatureCards:", err)
    return []
  }
}

// Fetch FAQ items by page
export async function getFaqItems(pageSlug: string): Promise<FaqItem[]> {
  try {
    const supabase = await createClient()
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
    console.error("[v0] Error in getFaqItems:", err)
    return []
  }
}

// Fetch How to Join steps
export async function getHowToJoinSteps(): Promise<HowToJoinStep[]> {
  try {
    const supabase = await createClient()
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
    console.error("[v0] Error in getHowToJoinSteps:", err)
    return []
  }
}

// Get a single setting with fallback
export async function getSetting(key: string, fallback: string = ""): Promise<string> {
  const settings = await getSiteSettings()
  return settings[key] || fallback
}

// Get all content for homepage
export async function getHomepageContent() {
  const [settings, pageContent, featureCards, faqItems] = await Promise.all([
    getSiteSettings(),
    getPageContent("homepage"),
    getFeatureCards(),
    getFaqItems("homepage"),
  ])

  return {
    settings,
    hero: pageContent.hero?.content_data || {},
    featureCards,
    faqItems,
  }
}

// Default/fallback content for when database is empty
export const DEFAULT_CONTENT = {
  hero: {
    title: "MANDY.GG",
    tagline: "The Ultimate Gaming Community",
    cta_text: "JOIN NOW",
    cta_url: "https://www.thrill.com/?r=mandygg",
  },
  settings: {
    site_name: "Mandy.GG",
    referral_url: "https://www.thrill.com/?r=mandygg",
    referral_code: "mandygg",
    support_email: "support@mandy.gg",
    discord_url: "https://discord.gg/mandygg",
    twitter_url: "https://twitter.com/mandygg",
    telegram_url: "https://t.me/mandygg",
    instagram_url: "https://instagram.com/mandygg",
    footer_copyright: "2025 Mandy.GG. All rights reserved.",
    footer_disclaimer: "Gambling involves risk. Please gamble responsibly.",
  },
}

import { createClient } from "@/lib/supabase/server"

// Types matching actual database schema
export interface SiteSetting {
  id: string
  key: string
  value: Record<string, any>
  created_at: string
  updated_at: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  location: string  // 'header' | 'footer' | 'both'
  sort_order: number
  is_external: boolean
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface PageContent {
  id: string
  page_slug: string
  section_key: string
  content: Record<string, any>
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface FeatureCard {
  id: string
  title: string
  subtitle: string
  description: string
  icon_name: string
  cta_text: string
  cta_url: string
  sort_order: number
  is_visible: boolean
  glow_color: string
  modal_content: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  sort_order: number
  is_visible: boolean
  page_slug: string
  created_at: string
  updated_at: string
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
  created_at: string
  updated_at: string
}

// Fetch all site settings as a key-value map
export async function getSiteSettings(): Promise<Record<string, any>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")

    if (error) {
      console.error("[v0] Error fetching site settings:", error)
      return {}
    }

    return (data || []).reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, any>)
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
      .or(`location.eq.${location},location.eq.both`)
      .eq("is_visible", true)
      .order("sort_order")

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
      .order("sort_order")

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
      .order("sort_order")

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
      .order("sort_order")

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

// Get a single setting by key with fallback
export async function getSetting(key: string, fallback: any = {}): Promise<any> {
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
    hero: pageContent.hero?.content || {},
    updatesSection: pageContent.updates_section?.content || {},
    blogSection: pageContent.blog_section?.content || {},
    faqSection: pageContent.faq_section?.content || {},
    featureCards,
    faqItems,
  }
}

// Default/fallback content for when database is empty
export const DEFAULT_CONTENT = {
  brand: {
    site_name: "MANDY.GG",
    tagline: "YEAH, I'M A GIRL AND I GAMBLE.",
    referral_code: "MANDY",
    referral_url: "https://thrill.com/?r=MANDY",
  },
  social_links: {
    telegram_chat: "https://t.me/mandyggchat",
    telegram_channel: "https://t.me/mandygg",
    discord: "https://discord.gg/mandygg",
    kick: "https://kick.com/mandycalmdown",
    twitter: "https://twitter.com/mandycalmdown",
    support_bot: "https://t.me/mandysupport_bot",
  },
  effect_settings: {
    holo_text_src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4",
    holo_btn_webm: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm",
    holo_btn_mp4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4",
    primary_accent: "#5cfec0",
    secondary_accent: "#3C7BFF",
    glow_intensity: 1.0,
  },
}

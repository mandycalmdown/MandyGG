"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Save,
  RefreshCw,
  Globe,
  Navigation,
  Layout,
  FileText,
  Palette,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Types
interface SiteSetting {
  id: string
  key: string
  value: Record<string, any>
  created_at: string
  updated_at: string
}

interface NavItem {
  id: string
  location: string
  label: string
  href: string
  sort_order: number
  is_visible: boolean
  is_external: boolean
  icon_name?: string | null
}

interface PageContent {
  id: string
  page_slug: string
  section_key: string
  content: Record<string, any>
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

interface FeatureCard {
  id: string
  title: string
  description: string
  image_url: string | null
  button_label: string
  button_href: string
  is_external_link: boolean
  is_modal_trigger: boolean
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

interface FaqItem {
  id: string
  question: string
  answer: string
  answer_html: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

interface HowToJoinStep {
  id: string
  step_number: number
  title: string
  body: string
  accent_color: string
  image_url: string | null
  image_alt: string | null
  cta_label: string | null
  cta_href: string | null
  checks: any[]
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export function AdminSiteContentEditor() {
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState("global")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  
  // Check if Supabase is available
  if (!supabase) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60 mb-4">Site Content Editor requires Supabase to be configured.</p>
        <p className="text-white/40 text-sm">Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.</p>
      </div>
    )
  }

  // Data states
  const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([])
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const [pageContent, setPageContent] = useState<PageContent[]>([])
  const [featureCards, setFeatureCards] = useState<FeatureCard[]>([])
  const [faqItems, setFaqItems] = useState<FaqItem[]>([])
  const [howToJoinSteps, setHowToJoinSteps] = useState<HowToJoinStep[]>([])

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      const [settingsRes, navRes, pageRes, cardsRes, faqRes, stepsRes] = await Promise.all([
        supabase.from("site_settings").select("*").order("key"),
        supabase.from("nav_items").select("*").order("location").order("sort_order"),
        supabase.from("page_content").select("*").order("page_slug").order("sort_order"),
        supabase.from("feature_cards").select("*").order("sort_order"),
        supabase.from("faq_items").select("*").order("sort_order"),
        supabase.from("how_to_join_steps").select("*").order("step_number"),
      ])

      if (settingsRes.data) setSiteSettings(settingsRes.data)
      if (navRes.data) setNavItems(navRes.data)
      if (pageRes.data) setPageContent(pageRes.data)
      if (cardsRes.data) setFeatureCards(cardsRes.data)
      if (faqRes.data) setFaqItems(faqRes.data)
      if (stepsRes.data) setHowToJoinSteps(stepsRes.data)
    } catch (err) {
      console.error("[v0] Error fetching site content:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Save setting
  const handleSaveSetting = async (setting: SiteSetting) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: setting.value, updated_at: new Date().toISOString() })
        .eq("id", setting.id)

      if (error) throw error
      setSaveStatus("Setting saved!")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("[v0] Error saving setting:", err)
      setSaveStatus("Error saving setting")
    } finally {
      setIsSaving(false)
    }
  }

  // Update setting in state
  const updateSettingValue = (id: string, key: string, fieldValue: any) => {
    setSiteSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value: { ...s.value, [key]: fieldValue } } : s))
    )
  }

  // Nav item handlers
  const handleSaveNavItem = async (item: NavItem) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("nav_items")
        .update({
          label: item.label,
          href: item.href,
          sort_order: item.sort_order,
          is_visible: item.is_visible,
          is_external: item.is_external,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      if (error) throw error
      setSaveStatus("Navigation saved!")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("[v0] Error saving nav item:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddNavItem = async (loc: string) => {
    const maxOrder = navItems.filter((n) => n.location === loc).length
    const newItem = {
      location: loc,
      label: "New Link",
      href: "/",
      sort_order: maxOrder,
      is_visible: true,
      is_external: false,
    }

    try {
      const { data, error } = await supabase.from("nav_items").insert(newItem).select().single()
      if (error) throw error
      if (data) setNavItems((prev) => [...prev, data])
    } catch (err) {
      console.error("[v0] Error adding nav item:", err)
    }
  }

  const handleDeleteNavItem = async (id: string) => {
    if (!confirm("Delete this navigation item?")) return
    try {
      const { error } = await supabase.from("nav_items").delete().eq("id", id)
      if (error) throw error
      setNavItems((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error("[v0] Error deleting nav item:", err)
    }
  }

  const updateNavItem = (id: string, updates: Partial<NavItem>) => {
    setNavItems((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)))
  }

  // Feature card handlers
  const handleSaveFeatureCard = async (card: FeatureCard) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("feature_cards")
        .update({
          title: card.title,
          subtitle: card.subtitle,
          description: card.description,
          icon_name: card.icon_name,
          cta_text: card.cta_text,
          cta_url: card.cta_url,
          sort_order: card.sort_order,
          is_visible: card.is_visible,
          glow_color: card.glow_color,
          modal_content: card.modal_content,
        })
        .eq("id", card.id)

      if (error) throw error
      setSaveStatus("Feature card saved!")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("[v0] Error saving feature card:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const updateFeatureCard = (id: string, updates: Partial<FeatureCard>) => {
    setFeatureCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  // FAQ handlers
  const handleSaveFaqItem = async (item: FaqItem) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("faq_items")
        .update({
          question: item.question,
          answer: item.answer,
          sort_order: item.sort_order,
          is_visible: item.is_visible,
        })
        .eq("id", item.id)

      if (error) throw error
      setSaveStatus("FAQ saved!")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("[v0] Error saving FAQ:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddFaqItem = async (pageSlug: string) => {
    const maxOrder = faqItems.filter((f) => f.page_slug === pageSlug).length
    const newItem = {
      page_slug: pageSlug,
      question: "New Question",
      answer: "Answer goes here",
      sort_order: maxOrder,
      is_visible: true,
    }

    try {
      const { data, error } = await supabase.from("faq_items").insert(newItem).select().single()
      if (error) throw error
      if (data) setFaqItems((prev) => [...prev, data])
    } catch (err) {
      console.error("[v0] Error adding FAQ:", err)
    }
  }

  const handleDeleteFaqItem = async (id: string) => {
    if (!confirm("Delete this FAQ item?")) return
    try {
      const { error } = await supabase.from("faq_items").delete().eq("id", id)
      if (error) throw error
      setFaqItems((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      console.error("[v0] Error deleting FAQ:", err)
    }
  }

  const updateFaqItem = (id: string, updates: Partial<FaqItem>) => {
    setFaqItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  // Page content handlers
  const handleSavePageContent = async (content: PageContent) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("page_content")
        .update({
          content: content.content,
          sort_order: content.sort_order,
          is_visible: content.is_visible,
          updated_at: new Date().toISOString(),
        })
        .eq("id", content.id)

      if (error) throw error
      setSaveStatus("Page content saved!")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("[v0] Error saving page content:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const updatePageContent = (id: string, updates: Partial<PageContent>) => {
    setPageContent((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  // How to join step handlers
  const handleSaveHowToJoinStep = async (step: HowToJoinStep) => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("how_to_join_steps")
        .update({
          title: step.title,
          description: step.description,
          icon_name: step.icon_name,
          cta_text: step.cta_text,
          cta_url: step.cta_url,
          is_visible: step.is_visible,
        })
        .eq("id", step.id)

      if (error) throw error
      setSaveStatus("Step saved!")
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (err) {
      console.error("[v0] Error saving step:", err)
    } finally {
      setIsSaving(false)
    }
  }

  const updateHowToJoinStep = (id: string, updates: Partial<HowToJoinStep>) => {
    setHowToJoinSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  // Reorder helpers
  const moveItem = async (
    table: string,
    items: any[],
    setItems: (items: any[]) => void,
    id: string,
    direction: "up" | "down"
  ) => {
    const idx = items.findIndex((i) => i.id === id)
    if (idx === -1) return
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === items.length - 1) return

    const newIdx = direction === "up" ? idx - 1 : idx + 1
    const newItems = [...items]
    const temp = newItems[idx]
    newItems[idx] = newItems[newIdx]
    newItems[newIdx] = temp

    // Update sort_order
    newItems.forEach((item, i) => {
      item.sort_order = i
    })
    setItems(newItems)

    // Persist to DB
    for (const item of newItems) {
      await supabase.from(table).update({ sort_order: item.sort_order }).eq("id", item.id)
    }
  }

  // Settings are organized by key (brand, social_links, effect_settings)
  // Each setting has a JSONB value with multiple properties

  // Group nav items by location
  const headerNav = navItems.filter((n) => n.location === "header" || n.location === "both")
  const footerNav = navItems.filter((n) => n.location === "footer" || n.location === "both")

  // Group page content by page
  const contentByPage = pageContent.reduce((acc, content) => {
    if (!acc[content.page_slug]) acc[content.page_slug] = []
    acc[content.page_slug].push(content)
    return acc
  }, {} as Record<string, PageContent[]>)

  // Group FAQ by page
  const faqByPage = faqItems.reduce((acc, faq) => {
    if (!acc[faq.page_slug]) acc[faq.page_slug] = []
    acc[faq.page_slug].push(faq)
    return acc
  }, {} as Record<string, FaqItem[]>)

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
        Loading site content...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {saveStatus && (
        <div className="fixed top-20 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {saveStatus}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <Button
          variant={activeSection === "global" ? "default" : "ghost"}
          onClick={() => setActiveSection("global")}
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          Global Settings
        </Button>
        <Button
          variant={activeSection === "navigation" ? "default" : "ghost"}
          onClick={() => setActiveSection("navigation")}
          className="gap-2"
        >
          <Navigation className="h-4 w-4" />
          Navigation
        </Button>
        <Button
          variant={activeSection === "homepage" ? "default" : "ghost"}
          onClick={() => setActiveSection("homepage")}
          className="gap-2"
        >
          <Layout className="h-4 w-4" />
          Homepage
        </Button>
        <Button
          variant={activeSection === "pages" ? "default" : "ghost"}
          onClick={() => setActiveSection("pages")}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Pages
        </Button>
        <Button
          variant={activeSection === "effects" ? "default" : "ghost"}
          onClick={() => setActiveSection("effects")}
          className="gap-2"
        >
          <Palette className="h-4 w-4" />
          Effects
        </Button>
      </div>

      {/* Global Settings Section */}
      {activeSection === "global" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">Global Site Settings</h2>
          <p className="text-muted-foreground">
            Manage brand settings, social links, and site-wide configuration.
          </p>

          {siteSettings.map((setting) => (
            <Card key={setting.id} className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground capitalize">
                  {setting.key.replace(/_/g, " ")}
                </h3>
                <Button onClick={() => handleSaveSetting(setting)} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(setting.value || {}).map(([propKey, propValue]) => {
                  const isColor = propKey.includes("color") || propKey.includes("accent")
                  const isUrl = propKey.includes("url") || propKey.includes("src") || propKey.includes("href")
                  const stringValue = typeof propValue === "string" ? propValue : String(propValue)
                  
                  return (
                    <div key={propKey}>
                      <Label className="text-muted-foreground capitalize">
                        {propKey.replace(/_/g, " ")}
                      </Label>
                      {isColor ? (
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={stringValue}
                            onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                            className="w-16 h-10 p-1 bg-background border-border"
                          />
                          <Input
                            value={stringValue}
                            onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                            className="bg-background border-border text-foreground flex-1"
                          />
                        </div>
                      ) : isUrl && stringValue.length > 60 ? (
                        <Textarea
                          value={stringValue}
                          onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                          className="bg-background border-border text-foreground mt-1 font-mono text-xs"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={stringValue}
                          onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                          className="bg-background border-border text-foreground mt-1"
                          type={isUrl ? "url" : "text"}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Navigation Section */}
      {activeSection === "navigation" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">Navigation Editor</h2>

          {/* Header Navigation */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Header Navigation</h3>
              <Button onClick={() => handleAddNavItem("header")} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>
            <div className="space-y-3">
              {headerNav.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem("nav_items", headerNav, (items) => {
                        setNavItems(prev => prev.filter(n => n.location !== "header" && n.location !== "both").concat(items))
                      }, item.id, "up")}
                      disabled={idx === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem("nav_items", headerNav, (items) => {
                        setNavItems(prev => prev.filter(n => n.location !== "header" && n.location !== "both").concat(items))
                      }, item.id, "down")}
                      disabled={idx === headerNav.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      value={item.label}
                      onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                      placeholder="Label"
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateNavItem(item.id, { url: e.target.value })}
                      placeholder="URL"
                      className="bg-background border-border text-foreground"
                    />
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.is_visible}
                          onCheckedChange={(checked) => updateNavItem(item.id, { is_visible: checked })}
                        />
                        <span className="text-sm text-muted-foreground">Visible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.open_in_new_tab}
                          onCheckedChange={(checked) => updateNavItem(item.id, { open_in_new_tab: checked })}
                        />
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveNavItem(item)} size="sm" className="gap-1">
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button onClick={() => handleDeleteNavItem(item.id)} size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {headerNav.length === 0 && (
                <p className="text-muted-foreground text-center py-4">No header navigation items</p>
              )}
            </div>
          </Card>

          {/* Footer Navigation */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Footer Navigation</h3>
              <Button onClick={() => handleAddNavItem("footer")} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Link
              </Button>
            </div>
            <div className="space-y-3">
              {footerNav.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      value={item.label}
                      onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                      placeholder="Label"
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateNavItem(item.id, { url: e.target.value })}
                      placeholder="URL"
                      className="bg-background border-border text-foreground"
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.is_visible}
                        onCheckedChange={(checked) => updateNavItem(item.id, { is_visible: checked })}
                      />
                      <span className="text-sm text-muted-foreground">Visible</span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveNavItem(item)} size="sm" className="gap-1">
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button onClick={() => handleDeleteNavItem(item.id)} size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Social Links */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Social Links</h3>
              <Button onClick={() => handleAddNavItem("footer_social")} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Social
              </Button>
            </div>
            <div className="space-y-3">
              {footerSocial.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      value={item.label}
                      onChange={(e) => updateNavItem(item.id, { label: e.target.value })}
                      placeholder="Platform (e.g., Twitter)"
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateNavItem(item.id, { url: e.target.value })}
                      placeholder="URL"
                      className="bg-background border-border text-foreground"
                    />
                    <Input
                      value={item.icon_name || ""}
                      onChange={(e) => updateNavItem(item.id, { icon_name: e.target.value })}
                      placeholder="Icon name (e.g., twitter)"
                      className="bg-background border-border text-foreground"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveNavItem(item)} size="sm" className="gap-1">
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button onClick={() => handleDeleteNavItem(item.id)} size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Homepage Section */}
      {activeSection === "homepage" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">Homepage Content</h2>

          {/* Hero Section */}
          {contentByPage["homepage"]?.filter((c) => c.section_key === "hero").map((content) => (
            <Card key={content.id} className="p-6 bg-card border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Hero Section</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Main Title (Video Text)</Label>
                  <Input
                    value={content.content.title || ""}
                    onChange={(e) =>
                      updatePageContent(content.id, {
                        content: { ...content.content, title: e.target.value },
                      })
                    }
                    className="bg-background border-border text-foreground mt-1"
                    placeholder="MANDY.GG"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This text will display with the video texture overlay effect
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tagline</Label>
                  <Input
                    value={content.content.tagline || ""}
                    onChange={(e) =>
                      updatePageContent(content.id, {
                        content: { ...content.content, tagline: e.target.value },
                      })
                    }
                    className="bg-background border-border text-foreground mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">CTA Button Text</Label>
                  <Input
                    value={content.content.cta_text || ""}
                    onChange={(e) =>
                      updatePageContent(content.id, {
                        content: { ...content.content, cta_text: e.target.value },
                      })
                    }
                    className="bg-background border-border text-foreground mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">CTA Button URL</Label>
                  <Input
                    value={content.content.cta_url || ""}
                    onChange={(e) =>
                      updatePageContent(content.id, {
                        content: { ...content.content, cta_url: e.target.value },
                      })
                    }
                    className="bg-background border-border text-foreground mt-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={content.is_visible}
                    onCheckedChange={(checked) => updatePageContent(content.id, { is_visible: checked })}
                  />
                  <span className="text-muted-foreground">Section Visible</span>
                </div>
                <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Hero
                </Button>
              </div>
            </Card>
          ))}

          {/* Feature Cards */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Feature Cards</h3>
            <div className="space-y-4">
              {featureCards.map((card, idx) => (
                <div key={card.id} className="p-4 bg-accent/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">Card {idx + 1}: {card.title}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          moveItem("feature_cards", featureCards, setFeatureCards, card.id, "up")
                        }
                        disabled={idx === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          moveItem("feature_cards", featureCards, setFeatureCards, card.id, "down")
                        }
                        disabled={idx === featureCards.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-muted-foreground text-sm">Title</Label>
                      <Input
                        value={card.title}
                        onChange={(e) => updateFeatureCard(card.id, { title: e.target.value })}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Subtitle</Label>
                      <Input
                        value={card.subtitle}
                        onChange={(e) => updateFeatureCard(card.id, { subtitle: e.target.value })}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-muted-foreground text-sm">Description</Label>
                      <Textarea
                        value={card.description}
                        onChange={(e) => updateFeatureCard(card.id, { description: e.target.value })}
                        className="bg-background border-border text-foreground mt-1"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Icon Name</Label>
                      <Input
                        value={card.icon_name}
                        onChange={(e) => updateFeatureCard(card.id, { icon_name: e.target.value })}
                        className="bg-background border-border text-foreground mt-1"
                        placeholder="e.g., trophy, gift, users"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">Glow Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          value={card.glow_color}
                          onChange={(e) => updateFeatureCard(card.id, { glow_color: e.target.value })}
                          className="w-12 h-10 p-1 bg-background border-border"
                        />
                        <Input
                          value={card.glow_color}
                          onChange={(e) => updateFeatureCard(card.id, { glow_color: e.target.value })}
                          className="bg-background border-border text-foreground"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">CTA Text</Label>
                      <Input
                        value={card.cta_text}
                        onChange={(e) => updateFeatureCard(card.id, { cta_text: e.target.value })}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground text-sm">CTA URL</Label>
                      <Input
                        value={card.cta_url}
                        onChange={(e) => updateFeatureCard(card.id, { cta_url: e.target.value })}
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={card.is_visible}
                        onCheckedChange={(checked) => updateFeatureCard(card.id, { is_visible: checked })}
                      />
                      <span className="text-sm text-muted-foreground">Visible</span>
                    </div>
                    <Button onClick={() => handleSaveFeatureCard(card)} size="sm" className="gap-1">
                      <Save className="h-3 w-3" />
                      Save Card
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* FAQ Section */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Homepage FAQ</h3>
              <Button onClick={() => handleAddFaqItem("homepage")} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add FAQ
              </Button>
            </div>
            <div className="space-y-3">
              {(faqByPage["homepage"] || []).map((faq, idx) => (
                <div key={faq.id} className="p-4 bg-accent/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-card-foreground">FAQ {idx + 1}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          moveItem("faq_items", faqByPage["homepage"] || [], (items) => {
                            setFaqItems((prev) =>
                              prev.filter((f) => f.page_slug !== "homepage").concat(items)
                            )
                          }, faq.id, "up")
                        }
                        disabled={idx === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          moveItem("faq_items", faqByPage["homepage"] || [], (items) => {
                            setFaqItems((prev) =>
                              prev.filter((f) => f.page_slug !== "homepage").concat(items)
                            )
                          }, faq.id, "down")
                        }
                        disabled={idx === (faqByPage["homepage"]?.length || 0) - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Question</Label>
                    <Input
                      value={faq.question}
                      onChange={(e) => updateFaqItem(faq.id, { question: e.target.value })}
                      className="bg-background border-border text-foreground mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Answer</Label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => updateFaqItem(faq.id, { answer: e.target.value })}
                      className="bg-background border-border text-foreground mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={faq.is_visible}
                        onCheckedChange={(checked) => updateFaqItem(faq.id, { is_visible: checked })}
                      />
                      <span className="text-sm text-muted-foreground">Visible</span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleSaveFaqItem(faq)} size="sm" className="gap-1">
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button onClick={() => handleDeleteFaqItem(faq.id)} size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Pages Section */}
      {activeSection === "pages" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">Page Content</h2>

          <Tabs defaultValue="how-to-join" className="w-full">
            <TabsList className="bg-accent/30 border border-border">
              <TabsTrigger value="how-to-join">How to Join</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="raffle">Raffle</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="casinos">Casinos</TabsTrigger>
            </TabsList>

            {/* How to Join */}
            <TabsContent value="how-to-join" className="space-y-4 mt-4">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">How to Join Steps</h3>
                <div className="space-y-4">
                  {howToJoinSteps.map((step) => (
                    <div key={step.id} className="p-4 bg-accent/30 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">{step.step_number}</span>
                        <span className="font-medium text-card-foreground">{step.title}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-muted-foreground text-sm">Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => updateHowToJoinStep(step.id, { title: e.target.value })}
                            className="bg-background border-border text-foreground mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">Icon Name</Label>
                          <Input
                            value={step.icon_name}
                            onChange={(e) => updateHowToJoinStep(step.id, { icon_name: e.target.value })}
                            className="bg-background border-border text-foreground mt-1"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-muted-foreground text-sm">Description</Label>
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateHowToJoinStep(step.id, { description: e.target.value })}
                            className="bg-background border-border text-foreground mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">CTA Text (optional)</Label>
                          <Input
                            value={step.cta_text || ""}
                            onChange={(e) => updateHowToJoinStep(step.id, { cta_text: e.target.value || null })}
                            className="bg-background border-border text-foreground mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-sm">CTA URL (optional)</Label>
                          <Input
                            value={step.cta_url || ""}
                            onChange={(e) => updateHowToJoinStep(step.id, { cta_url: e.target.value || null })}
                            className="bg-background border-border text-foreground mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={step.is_visible}
                            onCheckedChange={(checked) => updateHowToJoinStep(step.id, { is_visible: checked })}
                          />
                          <span className="text-sm text-muted-foreground">Visible</span>
                        </div>
                        <Button onClick={() => handleSaveHowToJoinStep(step)} size="sm" className="gap-1">
                          <Save className="h-3 w-3" />
                          Save Step
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* How to Join Page Header */}
              {contentByPage["how-to-join"]?.filter((c) => c.section_key === "header").map((content) => (
                <Card key={content.id} className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Page Header</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Title (Video Text)</Label>
                      <Input
                        value={content.content.title || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, title: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Subtitle</Label>
                      <Input
                        value={content.content.subtitle || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, subtitle: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save Header
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Rewards Page */}
            <TabsContent value="rewards" className="space-y-4 mt-4">
              {contentByPage["rewards"]?.map((content) => (
                <Card key={content.id} className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 capitalize">
                    {content.section_key.replace(/_/g, " ")} Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Title</Label>
                      <Input
                        value={content.content.title || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, title: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Description</Label>
                      <Textarea
                        value={content.content.description || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, description: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                        rows={3}
                      />
                    </div>
                    <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Leaderboard Page */}
            <TabsContent value="leaderboard" className="space-y-4 mt-4">
              {contentByPage["leaderboard"]?.map((content) => (
                <Card key={content.id} className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 capitalize">
                    {content.section_key.replace(/_/g, " ")} Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Title</Label>
                      <Input
                        value={content.content.title || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, title: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    {content.content.prizes && (
                      <div>
                        <Label className="text-muted-foreground">Prize Amounts (JSON)</Label>
                        <Textarea
                          value={JSON.stringify(content.content.prizes, null, 2)}
                          onChange={(e) => {
                            try {
                              const prizes = JSON.parse(e.target.value)
                              updatePageContent(content.id, {
                                content: { ...content.content, prizes },
                              })
                            } catch {}
                          }}
                          className="bg-background border-border text-foreground mt-1 font-mono text-sm"
                          rows={6}
                        />
                      </div>
                    )}
                    <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Raffle Page */}
            <TabsContent value="raffle" className="space-y-4 mt-4">
              {contentByPage["raffle"]?.map((content) => (
                <Card key={content.id} className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 capitalize">
                    {content.section_key.replace(/_/g, " ")} Section
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(content.content).map(([key, value]) => (
                      <div key={key}>
                        <Label className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</Label>
                        {typeof value === "string" && value.length > 100 ? (
                          <Textarea
                            value={value}
                            onChange={(e) =>
                              updatePageContent(content.id, {
                                content: { ...content.content, [key]: e.target.value },
                              })
                            }
                            className="bg-background border-border text-foreground mt-1"
                            rows={3}
                          />
                        ) : (
                          <Input
                            value={typeof value === "string" ? value : JSON.stringify(value)}
                            onChange={(e) =>
                              updatePageContent(content.id, {
                                content: { ...content.content, [key]: e.target.value },
                              })
                            }
                            className="bg-background border-border text-foreground mt-1"
                          />
                        )}
                      </div>
                    ))}
                    <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Blog Page */}
            <TabsContent value="blog" className="space-y-4 mt-4">
              {contentByPage["blog"]?.map((content) => (
                <Card key={content.id} className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 capitalize">
                    {content.section_key.replace(/_/g, " ")} Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Title (Video Text)</Label>
                      <Input
                        value={content.content.title || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, title: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Subtitle</Label>
                      <Input
                        value={content.content.subtitle || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, subtitle: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            {/* Casinos Page */}
            <TabsContent value="casinos" className="space-y-4 mt-4">
              {contentByPage["casinos"]?.map((content) => (
                <Card key={content.id} className="p-6 bg-card border-border">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4 capitalize">
                    {content.section_key.replace(/_/g, " ")} Section
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Title</Label>
                      <Input
                        value={content.content.title || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, title: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Subtitle</Label>
                      <Input
                        value={content.content.subtitle || ""}
                        onChange={(e) =>
                          updatePageContent(content.id, {
                            content: { ...content.content, subtitle: e.target.value },
                          })
                        }
                        className="bg-background border-border text-foreground mt-1"
                      />
                    </div>
                    <Button onClick={() => handleSavePageContent(content)} disabled={isSaving} className="gap-2">
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Effects Section */}
      {activeSection === "effects" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-card-foreground">Visual Effects Settings</h2>
          <p className="text-muted-foreground">
            Control glow colors, video textures, and interactive effect settings used throughout the site.
          </p>

          {/* Effect Settings from site_settings (effect_settings key) */}
          {siteSettings.filter(s => s.key === "effect_settings").map((setting) => (
            <Card key={setting.id} className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">Global Effect Settings</h3>
                <Button onClick={() => handleSaveSetting(setting)} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(setting.value || {}).map(([propKey, propValue]) => {
                  const isColor = propKey.includes("color") || propKey.includes("accent")
                  const isUrl = propKey.includes("url") || propKey.includes("src")
                  const stringValue = typeof propValue === "string" ? propValue : String(propValue)
                  
                  return (
                    <div key={propKey}>
                      <Label className="text-muted-foreground capitalize">
                        {propKey.replace(/_/g, " ")}
                      </Label>
                      {isColor ? (
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="color"
                            value={stringValue.startsWith("#") ? stringValue : "#5cfec0"}
                            onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                            className="w-16 h-10 p-1 bg-background border-border"
                          />
                          <Input
                            value={stringValue}
                            onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                            className="bg-background border-border text-foreground flex-1"
                          />
                        </div>
                      ) : isUrl ? (
                        <Textarea
                          value={stringValue}
                          onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                          className="bg-background border-border text-foreground mt-1 font-mono text-xs"
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={stringValue}
                          onChange={(e) => updateSettingValue(setting.id, propKey, e.target.value)}
                          className="bg-background border-border text-foreground mt-1"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}

          {/* Per-Card Glow Settings */}
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Feature Card Glow Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureCards.map((card) => (
                <div key={card.id} className="p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-card-foreground">{card.title}</span>
                    <div
                      className="w-6 h-6 rounded border border-border"
                      style={{ backgroundColor: card.glow_color }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={card.glow_color}
                      onChange={(e) => updateFeatureCard(card.id, { glow_color: e.target.value })}
                      className="w-12 h-8 p-1 bg-background border-border"
                    />
                    <Input
                      value={card.glow_color}
                      onChange={(e) => updateFeatureCard(card.id, { glow_color: e.target.value })}
                      className="bg-background border-border text-foreground text-sm flex-1"
                    />
                    <Button onClick={() => handleSaveFeatureCard(card)} size="sm">
                      <Save className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

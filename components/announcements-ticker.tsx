"use client"

import { useEffect, useState } from "react"

interface Announcement {
  id: string
  message: string
  is_active: boolean
  created_at: string
}

interface TickerSettings {
  text_color: string
  background_color: string
  background_gradient: string
  speed: number
  font_family: string
  font_size: string
  font_weight: string
}

export function AnnouncementsTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [settings, setSettings] = useState<TickerSettings>({
    text_color: "#ffffff",
    background_color: "#6366f1",
    background_gradient: "linear-gradient(to right, #6366f1, #a855f7, #6366f1)",
    speed: 8000,
    font_family: "inherit",
    font_size: "1rem",
    font_weight: "bold",
  })

  useEffect(() => {
    fetchAnnouncements()
    fetchSettings()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements")
      const data = await response.json()
      if (data.announcements && data.announcements.length > 0) {
        setAnnouncements(data.announcements)
      }
    } catch (error) {
      console.error("[v0] Error fetching announcements:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/ticker-settings")
      const data = await response.json()
      if (data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("[v0] Error fetching ticker settings:", error)
    }
  }

  if (announcements.length === 0) {
    return null
  }

  const combinedMessage = announcements.map((a) => a.message).join(" • ")

  const animationDuration = `${settings.speed / 1000}s`

  return (
    <div
      className="w-full py-3 overflow-hidden relative"
      style={{
        background: settings.background_gradient || settings.background_color,
      }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex whitespace-nowrap">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="inline-block px-8 animate-marquee-scroll"
            style={{
              color: settings.text_color,
              fontFamily: settings.font_family,
              fontSize: settings.font_size,
              fontWeight: settings.font_weight,
              animationDuration: animationDuration,
            }}
          >
            {combinedMessage}
          </div>
        ))}
      </div>
    </div>
  )
}

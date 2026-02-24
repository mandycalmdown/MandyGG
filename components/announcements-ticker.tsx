"use client"

import { useEffect, useState } from "react"

interface TickerSettings {
  ticker_1_text?: string
  ticker_2_text?: string
  ticker_3_text?: string
}

const DEFAULT_TICKER_TEXT = "USE CODE MANDY ON THRILL.COM \u2013 USE CODE MANDY \u2013 USE CODE MANDY ON THRILL.COM \u2013 USE CODE MANDY"

interface AnnouncementsTickerProps {
  tickerKey?: "ticker_1_text" | "ticker_2_text" | "ticker_3_text"
}

export function AnnouncementsTicker({ tickerKey = "ticker_1_text" }: AnnouncementsTickerProps) {
  const [tickerText, setTickerText] = useState(DEFAULT_TICKER_TEXT)

  useEffect(() => {
    fetchTickerText()
  }, [])

  const fetchTickerText = async () => {
    try {
      const response = await fetch("/api/ticker-settings")
      const data = await response.json()
      if (data.settings) {
        // Support legacy format (announcements array) and new format (ticker settings)
        if (data.settings[tickerKey]) {
          setTickerText(data.settings[tickerKey])
        }
      }
      // Also try legacy announcements endpoint
      const announcementsResponse = await fetch("/api/announcements")
      const announcementsData = await announcementsResponse.json()
      if (announcementsData.announcements && announcementsData.announcements.length > 0) {
        const combinedMessage = announcementsData.announcements
          .map((a: { message: string }) => a.message)
          .join(" \u2013 ")
        setTickerText(combinedMessage)
      }
    } catch (error) {
      // Silently fail, use default text
    }
  }

  return (
    <div
      className="w-full py-2 overflow-hidden relative"
      style={{ backgroundColor: "#0085FF" }}
    >
      <div className="flex whitespace-nowrap">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="inline-block px-8 animate-marquee-scroll"
            style={{
              color: "#FFFFFF",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "12px",
              fontWeight: 400,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              animationDuration: "20s",
            }}
          >
            {tickerText}
          </div>
        ))}
      </div>
    </div>
  )
}

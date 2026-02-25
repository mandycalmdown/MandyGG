"use client"

import { useEffect, useState } from "react"

const DEFAULT_TICKER_TEXT = "USE CODE MANDY ON THRILL.COM – USE CODE MANDY – USE CODE MANDY ON THRILL.COM – USE CODE MANDY"

/* Color + speed config per ticker slot */
const TICKER_CONFIG: Record<string, { bg: string; text: string; speed: number }> = {
  ticker_1_text: { bg: "#0085FF", text: "#FFFFFF", speed: 18 },
  ticker_2_text: { bg: "#FFFFFF", text: "#000000", speed: 24 },
  ticker_3_text: { bg: "#CCFF00", text: "#000000", speed: 14 },
}

interface AnnouncementsTickerProps {
  tickerKey?: "ticker_1_text" | "ticker_2_text" | "ticker_3_text"
}

export function AnnouncementsTicker({ tickerKey = "ticker_1_text" }: AnnouncementsTickerProps) {
  const [tickerText, setTickerText] = useState(DEFAULT_TICKER_TEXT)
  const config = TICKER_CONFIG[tickerKey] ?? TICKER_CONFIG.ticker_1_text

  useEffect(() => {
    fetchTickerText()
  }, [])

  const fetchTickerText = async () => {
    try {
      const response = await fetch("/api/ticker-settings")
      const data = await response.json()
      if (data.settings) {
        if (data.settings[tickerKey]) {
          setTickerText(data.settings[tickerKey])
        }
      }
      const announcementsResponse = await fetch("/api/announcements")
      const announcementsData = await announcementsResponse.json()
      if (announcementsData.announcements && announcementsData.announcements.length > 0) {
        const combinedMessage = announcementsData.announcements
          .map((a: { message: string }) => a.message)
          .join(" – ")
        setTickerText(combinedMessage)
      }
    } catch (error) {
      // Silently fail, use default text
    }
  }

  /* Build a single continuous string with no gap between repeats */
  const separator = " \u00A0\u00A0\u2013\u00A0\u00A0 "
  const continuousText = `${tickerText}${separator}`

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{ backgroundColor: config.bg, height: "32px", lineHeight: "32px" }}
    >
      <div className="flex whitespace-nowrap h-full items-center">
        {[...Array(6)].map((_, index) => (
          <span
            key={index}
            className="animate-marquee-scroll inline-block"
            style={{
              color: config.text,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              animationDuration: `${config.speed}s`,
            }}
          >
            {continuousText}
          </span>
        ))}
      </div>
    </div>
  )
}

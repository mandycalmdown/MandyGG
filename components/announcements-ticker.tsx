"use client"

import { useEffect, useState, useRef } from "react"

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
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchTickerText()
  }, [])

  /* Kick off a pure JS requestAnimationFrame loop for guaranteed mobile animation */
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    let offset = 0
    let raf: number
    const pxPerSecond = (el.scrollWidth / 2) / config.speed
    let last = performance.now()

    function step(now: number) {
      const dt = (now - last) / 1000
      last = now
      offset -= pxPerSecond * dt
      if (offset <= -(el!.scrollWidth / 2)) offset = 0
      el!.style.transform = `translate3d(${offset}px, 0, 0)`
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [tickerText, config.speed])

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

  const separator = " \u00A0\u00A0\u2013\u00A0\u00A0 "
  const chunk = `${tickerText}${separator}`

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{ backgroundColor: config.bg, height: "32px", lineHeight: "32px" }}
    >
      <div
        ref={trackRef}
        className="flex whitespace-nowrap h-full items-center will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
      >
        {/* Render the text twice so the second copy seamlessly follows the first */}
        {[0, 1].map((i) => (
          <span
            key={i}
            className="inline-block shrink-0"
            style={{
              color: config.text,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: "15px",
              fontWeight: 600,
              textTransform: "uppercase" as const,
              letterSpacing: "0.06em",
            }}
          >
            {chunk}{chunk}{chunk}
          </span>
        ))}
      </div>
    </div>
  )
}

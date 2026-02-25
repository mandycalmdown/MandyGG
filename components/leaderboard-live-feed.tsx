"use client"

import { useState, useEffect, useCallback } from "react"

const ALERT_COLORS = [
  { bg: "#CCFF00", text: "#000000", label: "neon-yellow" },
  { bg: "#2A69DB", text: "#000000", label: "electric-blue" },
  { bg: "#FF2F8B", text: "#000000", label: "hot-pink" },
]

interface FeedAlert {
  id: string
  message: string
  colorIndex: number
  timestamp: number
}

const EVENT_TEMPLATES = [
  { msg: (u: string) => `${u} moved up 2 spots!`, weight: 15 },
  { msg: (u: string) => `${u} moved up 3 spots!`, weight: 8 },
  { msg: (u: string) => `${u} has entered the Top 3!`, weight: 3 },
  { msg: (u: string) => `${u} just hit a huge win!`, weight: 10 },
  { msg: (u: string) => `${u} is on a hot streak!`, weight: 10 },
  { msg: (u: string) => `${u} claimed the #1 spot!`, weight: 2 },
  { msg: (u: string) => `${u} dropped 5 spots... ouch!`, weight: 8 },
  { msg: (u: string) => `${u} just joined the race!`, weight: 12 },
  { msg: (u: string) => `${u} wagered $5,000 in 10 minutes!`, weight: 6 },
  { msg: (u: string) => `${u} is climbing the ranks fast!`, weight: 10 },
  { msg: (u: string) => `New player alert: ${u} entered the leaderboard!`, weight: 8 },
  { msg: (u: string) => `${u} just overtook the #2 spot!`, weight: 4 },
  { msg: (u: string) => `${u} is closing in on the Top 5!`, weight: 7 },
  { msg: (u: string) => `${u} unlocked a bonus reward!`, weight: 5 },
]

const FAKE_USERS = [
  "J****N", "S***L", "D****E", "C***K", "M****A",
  "R***Y", "T****S", "A***X", "P****R", "L***E",
  "B****N", "K***O", "V****A", "W***D", "F****Z",
  "H***S", "G****T", "N***I", "Q****M", "X***Y",
]

function getWeightedRandom(): { msg: (u: string) => string } {
  const total = EVENT_TEMPLATES.reduce((sum, t) => sum + t.weight, 0)
  let rand = Math.random() * total
  for (const template of EVENT_TEMPLATES) {
    rand -= template.weight
    if (rand <= 0) return template
  }
  return EVENT_TEMPLATES[0]
}

export function LeaderboardLiveFeed() {
  const [alerts, setAlerts] = useState<FeedAlert[]>([])

  const generateAlert = useCallback(() => {
    const user = FAKE_USERS[Math.floor(Math.random() * FAKE_USERS.length)]
    const template = getWeightedRandom()
    const colorIndex = Math.floor(Math.random() * ALERT_COLORS.length)

    const newAlert: FeedAlert = {
      id: `${Date.now()}-${Math.random()}`,
      message: template.msg(user),
      colorIndex,
      timestamp: Date.now(),
    }

    setAlerts((prev) => {
      const updated = [newAlert, ...prev]
      return updated.slice(0, 20)
    })
  }, [])

  useEffect(() => {
    // Generate initial alerts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => generateAlert(), i * 200)
    }

    // Generate new alerts periodically
    const interval = setInterval(() => {
      generateAlert()
    }, 3000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [generateAlert])

  return (
    <div className="max-w-4xl mx-auto mt-8 md:mt-12 px-2 md:px-0">
      <h2
        className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-4 text-center"
        style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
      >
        LIVE FEED:
      </h2>

      <div className="space-y-2 max-h-[320px] overflow-hidden relative">
        {/* Fade-out gradient at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#000000] to-transparent z-10 pointer-events-none" />

        {alerts.map((alert, idx) => {
          const color = ALERT_COLORS[alert.colorIndex]
          return (
            <div
              key={alert.id}
              className="rounded-lg px-4 py-3 transition-all duration-500"
              style={{
                backgroundColor: color.bg,
                color: color.text,
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontWeight: 600,
                fontSize: "0.85rem",
                opacity: idx < 6 ? 1 - idx * 0.1 : 0.3,
                animation: idx === 0 ? "slideInLeft 0.4s ease-out" : undefined,
              }}
            >
              {alert.message}
            </div>
          )
        })}
      </div>
    </div>
  )
}

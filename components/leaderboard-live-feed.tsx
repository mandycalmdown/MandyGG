"use client"

import { useState, useEffect, useRef } from "react"

const ALERT_COLORS = [
  { bg: "#CCFF00", text: "#000000" },
  { bg: "#2A69DB", text: "#000000" },
  { bg: "#FF2F8B", text: "#000000" },
]

interface LeaderboardEntry {
  id: number
  username: string
  wager: number
  prize: number
  rank: number
}

interface FeedAlert {
  id: string
  message: string
  colorIndex: number
}

interface LeaderboardLiveFeedProps {
  entries: LeaderboardEntry[]
  previousEntries: LeaderboardEntry[]
}

function generateEventsFromData(
  entries: LeaderboardEntry[],
  previousEntries: LeaderboardEntry[]
): FeedAlert[] {
  const alerts: FeedAlert[] = []
  if (entries.length === 0) return alerts

  const prevMap = new Map<string, number>()
  previousEntries.forEach((e) => prevMap.set(e.username, e.rank))

  for (const entry of entries) {
    const prevRank = prevMap.get(entry.username)

    if (prevRank === undefined) {
      // New entry
      alerts.push({
        id: `${Date.now()}-new-${entry.username}`,
        message: `New player alert: ${entry.username} entered the leaderboard!`,
        colorIndex: 2,
      })
    } else if (prevRank > entry.rank) {
      const moved = prevRank - entry.rank
      if (entry.rank <= 3 && prevRank > 3) {
        alerts.push({
          id: `${Date.now()}-top3-${entry.username}`,
          message: `${entry.username} has entered the Top 3!`,
          colorIndex: 0,
        })
      } else if (entry.rank === 1) {
        alerts.push({
          id: `${Date.now()}-first-${entry.username}`,
          message: `${entry.username} claimed the #1 spot!`,
          colorIndex: 0,
        })
      } else {
        alerts.push({
          id: `${Date.now()}-up-${entry.username}`,
          message: `${entry.username} moved up ${moved} spot${moved !== 1 ? "s" : ""}!`,
          colorIndex: 1,
        })
      }
    } else if (prevRank < entry.rank) {
      const dropped = entry.rank - prevRank
      if (dropped >= 3) {
        alerts.push({
          id: `${Date.now()}-drop-${entry.username}`,
          message: `${entry.username} dropped ${dropped} spots... ouch!`,
          colorIndex: 2,
        })
      }
    }
  }

  // Add some context alerts from the data
  if (entries.length > 0) {
    const top = entries[0]
    if (top.wager > 100000) {
      alerts.push({
        id: `${Date.now()}-whale-${top.username}`,
        message: `${top.username} is on a hot streak with $${(top.wager / 1000).toFixed(0)}K wagered!`,
        colorIndex: 0,
      })
    }
    const closeFight = entries.find(
      (e, i) => i > 0 && entries[i - 1] && entries[i - 1].wager - e.wager < 1000
    )
    if (closeFight) {
      alerts.push({
        id: `${Date.now()}-close-${closeFight.username}`,
        message: `${closeFight.username} is closing in on the spot above!`,
        colorIndex: 1,
      })
    }
  }

  return alerts
}

export function LeaderboardLiveFeed({ entries, previousEntries }: LeaderboardLiveFeedProps) {
  const [alerts, setAlerts] = useState<FeedAlert[]>([])
  const isInitial = useRef(true)

  // When entries change, generate real events
  useEffect(() => {
    if (entries.length === 0) return

    if (isInitial.current) {
      // On first load, generate some summary alerts from current state
      const initial: FeedAlert[] = entries.slice(0, 5).map((entry, i) => ({
        id: `init-${i}-${entry.username}`,
        message:
          entry.rank === 1
            ? `${entry.username} is holding the #1 spot!`
            : entry.rank <= 3
              ? `${entry.username} is in the Top 3!`
              : `${entry.username} is in the race at #${entry.rank}!`,
        colorIndex: i % 3,
      }))
      setAlerts(initial)
      isInitial.current = false
      return
    }

    // Generate real diff-based events
    const newAlerts = generateEventsFromData(entries, previousEntries)
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20))
    }
  }, [entries, previousEntries])

  if (alerts.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto mt-8 md:mt-12 px-2 md:px-0">
      <h2
        className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-4 text-center"
        style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
      >
        LIVE FEED:
      </h2>

      <div className="space-y-2 max-h-[320px] overflow-hidden relative">
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

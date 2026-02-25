"use client"

import { useState, useEffect, useRef } from "react"

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
      // New player
      alerts.push({
        id: `${Date.now()}-new-${entry.username}`,
        message: `NEW PLAYER: ${entry.username} has joined Code Mandy!`,
      })
    } else if (prevRank > entry.rank) {
      const moved = prevRank - entry.rank
      if (entry.rank <= 10 && prevRank > 10) {
        alerts.push({
          id: `${Date.now()}-top10-${entry.username}`,
          message: `${entry.username} joined the Top 10!`,
        })
      } else if (entry.rank <= 3 && prevRank > 3) {
        alerts.push({
          id: `${Date.now()}-top3-${entry.username}`,
          message: `${entry.username} climbed into the Top 3!`,
        })
      } else {
        alerts.push({
          id: `${Date.now()}-up-${entry.username}`,
          message: `${entry.username} climbed ${moved} place${moved !== 1 ? "s" : ""}!`,
        })
      }
    } else if (prevRank < entry.rank) {
      const dropped = entry.rank - prevRank
      alerts.push({
        id: `${Date.now()}-drop-${entry.username}`,
        message: `${entry.username} fell ${dropped} place${dropped !== 1 ? "s" : ""}`,
      })
    }
  }

  // Extra context events
  if (entries.length > 0) {
    const top = entries[0]
    if (top.wager > 50000) {
      alerts.push({
        id: `${Date.now()}-whale-${top.username}`,
        message: `${top.username} is on a heater with $${(top.wager / 1000).toFixed(0)}K wagered!`,
      })
    }

    // Raffle ticket event for high wagerers
    const bigWagerers = entries.filter((e) => e.wager >= 10000)
    if (bigWagerers.length > 0) {
      const pick = bigWagerers[Math.floor(Date.now() / 60000) % bigWagerers.length]
      const tickets = Math.floor(pick.wager / 1000)
      alerts.push({
        id: `${Date.now()}-raffle-${pick.username}`,
        message: `${pick.username} earned ${tickets} raffle ticket${tickets !== 1 ? "s" : ""}!`,
      })
    }

    // Poker night qualifier
    const qualifiers = entries.filter((e) => e.wager >= 5000)
    if (qualifiers.length > 0) {
      const pick = qualifiers[Math.floor(Date.now() / 120000) % qualifiers.length]
      alerts.push({
        id: `${Date.now()}-poker-${pick.username}`,
        message: `${pick.username} qualified for Poker Night!`,
      })
    }

    // Close battle
    const closeFight = entries.find(
      (e, i) => i > 0 && entries[i - 1] && entries[i - 1].wager - e.wager < 1000
    )
    if (closeFight) {
      alerts.push({
        id: `${Date.now()}-close-${closeFight.username}`,
        message: `${closeFight.username} is closing in on the spot above!`,
      })
    }
  }

  return alerts
}

export function LeaderboardLiveFeed({ entries, previousEntries }: LeaderboardLiveFeedProps) {
  const [alerts, setAlerts] = useState<FeedAlert[]>([])
  const isInitial = useRef(true)

  useEffect(() => {
    if (entries.length === 0) return

    if (isInitial.current) {
      const initial: FeedAlert[] = entries.slice(0, 6).map((entry, i) => ({
        id: `init-${i}-${entry.username}`,
        message:
          entry.rank === 1
            ? `${entry.username} is holding the #1 spot!`
            : entry.rank <= 3
              ? `${entry.username} is battling in the Top 3!`
              : entry.rank <= 10
                ? `${entry.username} joined the Top 10!`
                : `${entry.username} has joined Code Mandy!`,
      }))
      setAlerts(initial)
      isInitial.current = false
      return
    }

    const newAlerts = generateEventsFromData(entries, previousEntries)
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 20))
    }
  }, [entries, previousEntries])

  if (alerts.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto mt-8 md:mt-12 px-2 md:px-0">
      <div
        className="bg-[#0a0a0a] rounded-xl border border-white/20 p-4 md:p-6 transition-all duration-500 hover:border-[#2A69DB]/60 hover:shadow-[0_0_25px_rgba(42,105,219,0.15)]"
      >
        <h2
          className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-4 text-center"
          style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
        >
          LIVE FEED
        </h2>

        <div className="space-y-2 max-h-[320px] overflow-hidden relative">
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

          {alerts.map((alert, idx) => (
            <div
              key={alert.id}
              className="rounded-lg px-4 py-3 transition-all duration-500"
              style={{
                backgroundColor: "#2A69DB",
                color: "#FFFFFF",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontWeight: 600,
                fontSize: "0.85rem",
                opacity: idx < 8 ? 1 - idx * 0.08 : 0.25,
                animation: idx === 0 ? "slideInLeft 0.4s ease-out" : undefined,
              }}
            >
              {alert.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  type: "new" | "climb" | "fall" | "top10" | "top3" | "whale" | "raffle" | "poker" | "close" | "join"
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
      alerts.push({
        id: `${Date.now()}-new-${entry.username}`,
        message: `${entry.username} joined Code Mandy`,
        type: "join",
      })
    } else if (prevRank > entry.rank) {
      const moved = prevRank - entry.rank
      if (entry.rank <= 10 && prevRank > 10) {
        alerts.push({ id: `${Date.now()}-top10-${entry.username}`, message: `${entry.username} joined Top 10`, type: "top10" })
      } else if (entry.rank <= 3 && prevRank > 3) {
        alerts.push({ id: `${Date.now()}-top3-${entry.username}`, message: `${entry.username} Top 3!`, type: "top3" })
      } else {
        alerts.push({ id: `${Date.now()}-up-${entry.username}`, message: `${entry.username} +${moved}`, type: "climb" })
      }
    } else if (prevRank < entry.rank) {
      const dropped = entry.rank - prevRank
      alerts.push({ id: `${Date.now()}-drop-${entry.username}`, message: `${entry.username} -${dropped}`, type: "fall" })
    }
  }

  if (entries.length > 0) {
    const top = entries[0]
    if (top.wager > 50000) {
      alerts.push({ id: `${Date.now()}-whale-${top.username}`, message: `${top.username} $${(top.wager / 1000).toFixed(0)}K wagered`, type: "whale" })
    }

    const bigWagerers = entries.filter((e) => e.wager >= 10000)
    if (bigWagerers.length > 0) {
      const pick = bigWagerers[Math.floor(Date.now() / 60000) % bigWagerers.length]
      const tickets = Math.floor(pick.wager / 500)
      alerts.push({ id: `${Date.now()}-raffle-${pick.username}`, message: `${pick.username} earned ${tickets} tickets`, type: "raffle" })
    }

    const qualifiers = entries.filter((e) => e.wager >= 5000)
    if (qualifiers.length > 0) {
      const pick = qualifiers[Math.floor(Date.now() / 120000) % qualifiers.length]
      alerts.push({ id: `${Date.now()}-poker-${pick.username}`, message: `${pick.username} Poker Night`, type: "poker" })
    }

    const closeFight = entries.find(
      (e, i) => i > 0 && entries[i - 1] && entries[i - 1].wager - e.wager < 1000
    )
    if (closeFight) {
      alerts.push({ id: `${Date.now()}-close-${closeFight.username}`, message: `${closeFight.username} closing in!`, type: "close" })
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
      const initial: FeedAlert[] = entries.slice(0, 8).map((entry, i) => ({
        id: `init-${i}-${entry.username}`,
        message:
          entry.rank === 1
            ? `${entry.username} #1`
            : entry.rank <= 3
              ? `${entry.username} Top 3`
              : entry.rank <= 10
                ? `${entry.username} Top 10`
                : `${entry.username} joined`,
        type: (entry.rank === 1 ? "whale" : entry.rank <= 3 ? "top3" : entry.rank <= 10 ? "top10" : "join") as FeedAlert["type"],
      }))
      setAlerts(initial)
      isInitial.current = false
      return
    }

    const newAlerts = generateEventsFromData(entries, previousEntries)
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 24))
    }
  }, [entries, previousEntries])

  if (alerts.length === 0) return null

  return (
    <div className="max-w-4xl mx-auto mt-8 md:mt-12 px-2 md:px-0">
      <div className="bg-[#000000] rounded-xl border border-white/20 p-4 md:p-6 transition-all duration-500 hover:border-[#CCFF00]/60 hover:shadow-[0_0_25px_rgba(204,255,0,0.1)]">
        <h2
          className="text-2xl md:text-3xl text-[#FFFFFF] uppercase mb-4 text-center"
          style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
        >
          LIVE FEED
        </h2>

        <div className="relative max-h-[260px] overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#000000] to-transparent z-10 pointer-events-none" />

          <div className="flex flex-wrap gap-2">
            {alerts.map((alert, idx) => (
              <div
                key={alert.id}
                className="rounded-md px-3 py-1.5 text-sm font-semibold whitespace-nowrap border border-[#CCFF00]/30"
                style={{
                  backgroundColor: "rgba(204,255,0,0.1)",
                  color: "#CCFF00",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  opacity: idx < 16 ? 1 - idx * 0.04 : 0.3,
                  animation: idx === 0 ? "slideInLeft 0.3s ease-out" : undefined,
                }}
              >
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

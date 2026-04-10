"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"
import { DailyRaffle } from "@/components/leaderboard-daily-raffle"
import FlipCountdown from "@/components/FlipCountdown"
import { isAdminSessionValid } from "@/lib/admin-session"
import { clearLeaderboardCacheAction } from "@/app/actions/admin-actions"

/* ── Theme constants ─ cool-toned blacks only ── */
const HOLO_BG_MP4   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"
const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"
const HEADER_IMG    = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDY_THRILL_LOGO_BLUE-Lz0ZbCXRoUM1B34hDApWmfjyR9PLal.webp"

/* Solid black background with holographic accents */
const PAGE_BG  = "#000000"   // solid black
const CARD_BG  = "#0a0a0a"   // almost black cards
const CARD_BG2 = "#0f0f0f"   // slightly lighter

// Holographic accent colors from video overlay
const HOLO_BLUE    = "#3C7BFF"
const HOLO_CYAN    = "#5ac3ff"
const HOLO_PURPLE  = "#a855f7"
const HOLO_PINK    = "#ff94b4"
const HOLO_GREEN   = "#4ade80"
const HOLO_YELLOW  = "#fbbf24"
// Aliases used throughout component
const LIME   = HOLO_BLUE
const BLUE   = HOLO_CYAN
const PURPLE = HOLO_PURPLE
const PINK   = HOLO_PINK

function HoloButton({ href, external, onClick, children, small }: {
  href?: string; external?: boolean; onClick?: () => void;
  children: React.ReactNode; small?: boolean
}) {
  const pad = small ? "0.45rem 1.1rem" : "0.75rem 2rem"
  const fs  = small ? "0.7rem" : "0.78rem"
  const mw  = small ? "110px"  : "160px"
  const inner = (
    <>
      <video autoPlay loop muted playsInline aria-hidden="true" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        objectFit: "cover", zIndex: 0, borderRadius: "inherit", pointerEvents: "none",
      }}>
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4}  type="video/mp4" />
      </video>
      <span style={{ position: "relative", zIndex: 1, color: "#000", fontWeight: 800, fontSize: fs, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-poppins), sans-serif" }}>
        {children}
      </span>
    </>
  )
  const base: React.CSSProperties = {
    position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center",
    justifyContent: "center", padding: pad, border: "none", borderRadius: "8px",
    cursor: "pointer", textDecoration: "none", minWidth: mw,
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  }
  if (onClick) return <button type="button" onClick={onClick} style={base}>{inner}</button>
  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" style={base}>{inner}</a>
  return <Link href={href!} style={base}>{inner}</Link>
}

interface LeaderboardEntry { id: number; username: string; wager: number; prize: number; rank: number }
interface ApiResponse { entries: LeaderboardEntry[]; totalCount: number; lastUpdated: string; period?: string; status?: string }
interface CachedData { data: LeaderboardEntry[]; timestamp: number }

const mockData: LeaderboardEntry[] = [
  { id: 1,  username: "Y*****M",     wager: 3000000, prize: 1200, rank: 1 },
  { id: 2,  username: "N*********S", wager: 90000,   prize: 900,  rank: 2 },
  { id: 3,  username: "S*****Y",     wager: 30000,   prize: 600,  rank: 3 },
  { id: 4,  username: "G*******3",   wager: 25000,   prize: 300,  rank: 4 },
  { id: 5,  username: "H*******R",   wager: 20000,   prize: 200,  rank: 5 },
  { id: 6,  username: "C*****G",     wager: 15000,   prize: 120,  rank: 6 },
  { id: 7,  username: "P*****O",     wager: 12000,   prize: 80,   rank: 7 },
  { id: 8,  username: "S*****R",     wager: 10000,   prize: 50,   rank: 8 },
  { id: 9,  username: "B*****S",     wager: 8000,    prize: 30,   rank: 9 },
  { id: 10, username: "R*****N",     wager: 6000,    prize: 20,   rank: 10 },
]

/* Next-Friday-midnight-UTC countdown */
function getCountdownToFridayUTC() {
  const now = new Date()
  const day = now.getUTCDay() // 0=Sun … 5=Fri
  // days until next Friday (day 5)
  const daysUntil = day === 5 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0
    ? 7
    : ((5 - day + 7) % 7) || 7
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil, 0, 0, 0))
  const diff = Math.max(0, next.getTime() - now.getTime())
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

export function Leaderboard() {
  const [entries,          setEntries         ] = useState<LeaderboardEntry[]>(mockData)
  const [previousEntries,  setPreviousEntries  ] = useState<LeaderboardEntry[]>([])
  const [raffleWinners,    setRaffleWinners    ] = useState<any[]>([])
  const [isLoading,        setIsLoading        ] = useState(true)
  const [error,            setError            ] = useState<string | null>(null)
  const [activeTab,        setActiveTab        ] = useState<"current" | "past">("current")
  const [isRefreshing,     setIsRefreshing     ] = useState(false)
  const [isAdmin,          setIsAdmin          ] = useState(false)
  const [countdown,        setCountdown        ] = useState(getCountdownToFridayUTC())

  const currentCache = useRef<CachedData | null>(null)
  const pastCache    = useRef<CachedData | null>(null)
  const raffleCache  = useRef<{ data: any[]; timestamp: number } | null>(null)

  useEffect(() => { setIsAdmin(isAdminSessionValid()) }, [])

  /* Countdown to next Friday midnight UTC */
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdownToFridayUTC()), 1000)
    return () => clearInterval(t)
  }, [])

  /* Fetch leaderboard data */
  useEffect(() => {
    const load = async () => {
      try {
        const cache = activeTab === "current" ? currentCache.current : pastCache.current
        const now   = Date.now()
        if (cache && now - cache.timestamp < 120_000) { setEntries(cache.data); setIsLoading(false); return }
        setIsLoading(true); setError(null)
        const res  = await fetch(`/api/leaderboard?period=${activeTab}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ApiResponse = await res.json()
        if (data.entries?.length) {
          setPreviousEntries(entries); setEntries(data.entries)
          const slot = { data: data.entries, timestamp: now }
          activeTab === "current" ? (currentCache.current = slot) : (pastCache.current = slot)
        } else { setEntries(mockData) }
        /* Raffle */
        const rafAge = raffleCache.current ? now - raffleCache.current.timestamp : Infinity
        if (rafAge >= 120_000) {
          try {
            const r  = await fetch("/api/raffle/winners")
            const rd = await r.json()
            if (rd.winners) { setRaffleWinners(rd.winners); raffleCache.current = { data: rd.winners, timestamp: now } }
          } catch {}
        } else if (raffleCache.current) setRaffleWinners(raffleCache.current.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed")
        const c = activeTab === "current" ? currentCache.current : pastCache.current
        setEntries(c ? c.data : mockData)
      } finally { setIsLoading(false) }
    }
    load()
    const t = setInterval(load, 120_000)
    return () => clearInterval(t)
  }, [activeTab])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (isAdmin) await clearLeaderboardCacheAction()
      const res  = await fetch(`/api/leaderboard?period=${activeTab}&refresh=true`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ApiResponse = await res.json()
      if (data.entries?.length) {
        setPreviousEntries(entries); setEntries(data.entries)
        const now = Date.now(); const slot = { data: data.entries, timestamp: now }
        activeTab === "current" ? (currentCache.current = slot) : (pastCache.current = slot)
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Refresh failed") }
    finally { setIsRefreshing(false) }
  }

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
  const pad = (n: number) => String(n).padStart(2, "0")
  const timeLeft = `${pad(countdown.days)}:${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`

  const topThree = entries.slice(0, 3)
  const rest     = entries.slice(3)

  /* Podium order: desktop shows 2nd / 1st / 3rd, but we render 1st/2nd/3rd in DOM order for mobile */
  const PODIUM_RANK_COLORS = [LIME, LIME, LIME]

  const cardBase: React.CSSProperties = {
    background: CARD_BG,
    border: "1.5px solid rgba(255,255,255,0.07)",
    borderRadius: "16px",
    boxShadow: "0 4px 32px rgba(0,0,4,0.7)",
  }

  return (
    <>
      <SiteNavigation currentPage="leaderboard" />
      <div style={{ minHeight: "100vh", background: PAGE_BG, color: "#fff", fontFamily: "var(--font-poppins), sans-serif", paddingTop: "90px" }}>

      {/* ── Header image ── */}
      <div style={{ background: PAGE_BG, padding: "2rem 1rem 0", textAlign: "center" }}>
        <img
          src={HEADER_IMG}
          alt="$3500 Weekly Race"
          style={{ width: "min(400px, 85vw)", height: "auto", display: "inline-block" }}
        />
      </div>

      {/* ── Countdown + controls ── */}
      <div style={{ background: PAGE_BG, padding: "1.5rem 1rem 0", textAlign: "center" }}>
        <p style={{ fontWeight: 700, fontSize: "clamp(0.65rem,2vw,0.8rem)", letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff", marginBottom: "0.25rem" }}>
          TIME REMAINING
        </p>
        <FlipCountdown timeString={timeLeft} />

        {/* Title */}
        <h1 style={{ fontWeight: 900, fontSize: "clamp(1.4rem,5vw,2.8rem)", letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", marginBottom: "1.25rem", lineHeight: 1.1, marginTop: "1rem" }}>
          <span style={{ color: LIME }}>$3500</span>{" "}WEEKLY LEADERBOARD
        </h1>

        {/* CTA — above the tab buttons */}
        <div style={{ marginBottom: "1rem" }}>
          <HoloButton href="https://thrill.com/?r=MANDY" external>JOIN THE RACE</HoloButton>
        </div>

        {/* Tab buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.6rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {(["current", "past"] as const).map((tab) => {
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  position: "relative", overflow: "hidden",
                  padding: "0.4rem 1.1rem", borderRadius: "6px", cursor: "pointer",
                  fontFamily: "var(--font-poppins), sans-serif", fontWeight: 800, fontSize: "0.68rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  border: isActive ? "none" : "1.5px solid rgba(255,255,255,0.18)",
                  background: isActive ? "transparent" : CARD_BG,
                  color: isActive ? "#000" : "#fff",
                  minWidth: "100px",
                  transition: "all 0.18s ease",
                }}
              >
                {isActive && (
                  <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, borderRadius: "inherit", pointerEvents: "none" }}>
                    <source src={HOLO_BTN_WEBM} type="video/webm" />
                    <source src={HOLO_BTN_MP4}  type="video/mp4" />
                  </video>
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  {tab === "current" ? "CURRENT WEEK" : "PAST WEEK"}
                </span>
              </button>
            )
          })}
        </div>

        {isLoading && <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginTop: "0.75rem", letterSpacing: "0.06em" }}>Loading…</p>}
        {error     && <p style={{ fontSize: "0.72rem", color: PINK, marginTop: "0.75rem", letterSpacing: "0.06em" }}>Using cached data</p>}
        {isAdmin   && (
          <button onClick={handleRefresh} disabled={isRefreshing} style={{ marginTop: "0.75rem", padding: "0.35rem 0.9rem", background: CARD_BG, border: `1px solid ${PURPLE}`, borderRadius: "6px", color: PURPLE, fontSize: "0.68rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em" }}>
            {isRefreshing ? "REFRESHING…" : "REFRESH (ADMIN)"}
          </button>
        )}
      </div>

      {/* ── Holo bg — podium + table float on top ── */}
      <div style={{ position: "relative", marginTop: "2rem" }}>
        <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,2,10,0.5)", zIndex: 1 }} />

        <div style={{ position: "relative", zIndex: 2, padding: "2.5rem 1rem 2.5rem", maxWidth: "900px", margin: "0 auto" }}>

          {/* ── Podium — 2nd / 1st / 3rd on desktop, stacked 1/2/3 on mobile ── */}
          <style>{`
            @media (min-width: 640px) {
              .lb-podium { flex-direction: row !important; align-items: flex-end; }
              .lb-podium-card-0 { order: 2; }
              .lb-podium-card-1 { order: 1; }
              .lb-podium-card-2 { order: 3; }
            }
          `}</style>
          <div className="lb-podium" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[0, 1, 2].map((rank) => {
              const entry  = topThree[rank]
              const accent = PODIUM_RANK_COLORS[rank]
              const rankNum = rank + 1
              return (
                <div
                  key={rank}
                  className={`lb-podium-card-${rank}`}
                  style={{
                    ...cardBase,
                    padding: rank === 0 ? "1.75rem 1.5rem" : "1.4rem 1.25rem",
                    textAlign: "center",
                    flex: rank === 0 ? "0 0 38%" : "0 0 29%",
                  }}
                >
                  {/* Big rank number — matches screenshot */}
                  <p style={{ fontSize: rank === 0 ? "clamp(3rem,10vw,5rem)" : "clamp(2.5rem,8vw,4rem)", fontWeight: 900, color: "#fff", lineHeight: 1, marginBottom: "0.4rem" }}>
                    {rankNum}
                  </p>
                  <p style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: accent, marginBottom: "0.3rem" }}>
                    {entry?.username ?? "U*******E"}
                  </p>
                  <p style={{ fontSize: "clamp(1.2rem,3.5vw,1.8rem)", fontWeight: 900, color: "#fff", marginBottom: "0.15rem" }}>
                    {fmt(entry?.wager ?? 0)}
                  </p>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase" }}>
                    PRIZE: {fmt(entry?.prize ?? 0)}
                  </p>
                </div>
              )
            })}
          </div>

          {/* ── Table header ── */}
          <div style={{ display: "grid", gridTemplateColumns: "2.5rem 1fr 1fr 1fr", gap: "0.5rem", padding: "1.25rem 1.25rem 0.5rem", marginTop: "1.5rem" }}>
            {["RANK", "PLAYER", "WAGERED", "PRIZE"].map((h, i) => (
              <span key={h} style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase", textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
            ))}
          </div>

          {/* ── Ranks 4–10 ── */}
          {rest.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>NO ADDITIONAL ENTRIES YET.</p>
          ) : rest.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: "grid", gridTemplateColumns: "2.5rem 1fr 1fr 1fr", gap: "0.5rem",
                padding: "0.7rem 1.25rem",
                background: i % 2 === 0 ? CARD_BG : CARD_BG2,
                borderTop: "1px solid rgba(255,255,255,0.04)",
                borderRadius: i === rest.length - 1 ? "0 0 12px 12px" : "0",
              }}
            >
              <span style={{ fontWeight: 900, color: BLUE, fontSize: "0.8rem" }}>{entry.rank}</span>
              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.username}</span>
              <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#fff", textAlign: "right" }}>{fmt(entry.wager)}</span>
              <span style={{ fontWeight: 800, fontSize: "0.8rem", color: LIME, textAlign: "right" }}>{fmt(entry.prize)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Weekly Raffle ── */}
      <div style={{ background: PAGE_BG, position: "relative", zIndex: 2 }}>
        <DailyRaffle winners={raffleWinners} />
      </div>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", overflow: "hidden", paddingTop: "3rem", paddingBottom: "2rem" }}>
        <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "0 1rem", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: "clamp(2.5rem,10vw,5rem)", color: "#000", letterSpacing: "-0.01em", marginBottom: "0.25rem", fontFamily: "var(--font-poppins), sans-serif" }}>MANDY.GG</p>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.15em", color: "#000", marginBottom: "1.5rem" }}>YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
          <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem 1.5rem", marginBottom: "1.5rem" }}>
            {[
              { label: "HOW TO JOIN",   href: "/how-to-join" },
              { label: "REWARDS",       href: "/rewards" },
              { label: "WEEKLY RACE",   href: "/leaderboard" },
              { label: "RAFFLE",        href: "/raffle" },
              { label: "GOSSIP",        href: "/blog" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.1em", color: "#000", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </nav>

          <div style={{ marginTop: "2rem", borderTop: "2px solid rgba(0,0,0,0.45)", paddingTop: "1.25rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#000", letterSpacing: "0.06em" }}>© 2025 MANDY.GG. ALL RIGHTS RESERVED.</p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              {[{ label: "PRIVACY", href: "/privacy" }, { label: "TERMS", href: "/terms" }, { label: "SUPPORT", href: "https://t.me/mandysupport_bot" }].map((l) => (
                <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontSize: "0.72rem", fontWeight: 700, color: "#000", textDecoration: "none", letterSpacing: "0.06em" }}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

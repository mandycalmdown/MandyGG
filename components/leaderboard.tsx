"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"
import { LeaderboardLiveFeed } from "@/components/leaderboard-live-feed"
import { DailyRaffle } from "@/components/leaderboard-daily-raffle"
import { isAdminSessionValid } from "@/lib/admin-session"
import { clearLeaderboardCacheAction } from "@/app/actions/admin-actions"
import MailingListForm from "@/components/MailingListForm"

/* ── Theme constants ── */
const HOLO_BG_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"

const CARD_BG   = "#080b10"
const LIME      = "#b5dc58"
const PINK      = "#ff94b4"
const PURPLE    = "#6859d5"
const BLUE      = "#5ac3ff"

function HoloButton({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  const inner = (
    <>
      <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, borderRadius: "inherit" }}>
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4}  type="video/mp4" />
      </video>
      <span style={{ position: "relative", zIndex: 1, color: "#000", fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-poppins), sans-serif" }}>
        {children}
      </span>
    </>
  )
  const baseStyle: React.CSSProperties = {
    position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center",
    justifyContent: "center", padding: "0.75rem 2rem", border: "none", borderRadius: "8px",
    cursor: "pointer", textDecoration: "none", minWidth: "160px",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  }
  if (external) {
    return <a href={href} target="_blank" rel="noopener noreferrer" style={baseStyle}>{inner}</a>
  }
  return <Link href={href} style={baseStyle}>{inner}</Link>
}

interface LeaderboardEntry { id: number; username: string; wager: number; prize: number; rank: number; xp?: number }
interface ApiResponse { entries: LeaderboardEntry[]; totalCount: number; lastUpdated: string; period?: string; status?: string }
interface CachedData { data: LeaderboardEntry[]; timestamp: number }

const mockData: LeaderboardEntry[] = [
  { id: 1, username: "Y*****M",    wager: 3000000, prize: 1200, rank: 1 },
  { id: 2, username: "N*********S",wager: 90000,   prize: 900,  rank: 2 },
  { id: 3, username: "S*****Y",    wager: 30000,   prize: 600,  rank: 3 },
  { id: 4, username: "G*******3",  wager: 25000,   prize: 300,  rank: 4 },
  { id: 5, username: "H*******R",  wager: 20000,   prize: 200,  rank: 5 },
  { id: 6, username: "C*****G",    wager: 15000,   prize: 120,  rank: 6 },
  { id: 7, username: "P*****O",    wager: 12000,   prize: 80,   rank: 7 },
  { id: 8, username: "S*****R",    wager: 10000,   prize: 50,   rank: 8 },
  { id: 9, username: "B*****S",    wager: 8000,    prize: 30,   rank: 9 },
  { id: 10, username: "R*****N",   wager: 6000,    prize: 20,   rank: 10 },
]

const PODIUM_VIDEOS = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold_mandy-9pX50BDoGrYOwjdjBgvDsA81XNnbzS.webm",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/silver_mandy-QLwCilpDVX7yYn5lwHX2x55OPkDBZZ.webm",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bronze-ezgif.com-gif-to-webm-converter-RoLVPGw8RXwCgrEfDo86QZ9Kvc24J7.webm",
]
const PODIUM_COLORS = [LIME, "#C0C0C0", "#CD7F32"]
const PODIUM_ORDER  = [1, 0, 2] // desktop: 2nd, 1st, 3rd

export function Leaderboard() {
  const [entries, setEntries]               = useState<LeaderboardEntry[]>(mockData)
  const [previousEntries, setPreviousEntries] = useState<LeaderboardEntry[]>([])
  const [raffleWinners, setRaffleWinners]   = useState<any[]>([])
  const [isLoading, setIsLoading]           = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [activeTab, setActiveTab]           = useState<"current" | "past">("current")
  const currentDataCache = useRef<CachedData | null>(null)
  const pastDataCache    = useRef<CachedData | null>(null)
  const raffleCache      = useRef<{ data: any[]; timestamp: number } | null>(null)
  const [isRefreshing, setIsRefreshing]     = useState(false)
  const [isAdmin, setIsAdmin]               = useState(false)
  const [dataStatus, setDataStatus]         = useState("")
  const [countdown, setCountdown]           = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => { setIsAdmin(isAdminSessionValid()) }, [])

  useEffect(() => {
    const calc = () => {
      const now = new Date()
      const ct = now.toLocaleString("en-US", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
      const [dp, tp] = ct.split(", ")
      const [m, d, y] = dp.split("/")
      const [h, mn, s] = tp.split(":")
      const central = new Date(+y, +m - 1, +d, +h, +mn, +s)
      const day = central.getDay(), hour = central.getHours()
      let daysUntil = day === 4 && hour < 18 ? 0 : day === 4 ? 7 : day > 4 ? 7 - (day - 4) : 4 - day
      const next = new Date(central); next.setDate(central.getDate() + daysUntil); next.setHours(18,0,0,0)
      const diff = next.getTime() - central.getTime()
      if (diff > 0) {
        setCountdown({ days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000) })
      }
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const cache = activeTab === "current" ? currentDataCache.current : pastDataCache.current
        const now = Date.now()
        if (cache && now - cache.timestamp < 120000) { setEntries(cache.data); setIsLoading(false); return }
        setIsLoading(true); setError(null)
        const res  = await fetch(`/api/leaderboard?period=${activeTab}`, { headers: { "Content-Type": "application/json" } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: ApiResponse = await res.json()
        setDataStatus(data.status || "")
        if (data.entries?.length) {
          setPreviousEntries(entries); setEntries(data.entries)
          activeTab === "current" ? (currentDataCache.current = { data: data.entries, timestamp: now }) : (pastDataCache.current = { data: data.entries, timestamp: now })
        } else { setEntries(mockData) }
        const rafAge = raffleCache.current ? now - raffleCache.current.timestamp : Infinity
        if (rafAge >= 120000) {
          try { const r = await fetch("/api/raffle/winners"); const rd = await r.json(); if (rd.winners) { setRaffleWinners(rd.winners); raffleCache.current = { data: rd.winners, timestamp: now } } } catch {}
        } else if (raffleCache.current) setRaffleWinners(raffleCache.current.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed")
        const c = activeTab === "current" ? currentDataCache.current : pastDataCache.current
        setEntries(c ? c.data : mockData)
      } finally { setIsLoading(false) }
    }
    fetch_()
    const t = setInterval(fetch_, 120000)
    return () => clearInterval(t)
  }, [activeTab])

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (isAdmin) await clearLeaderboardCacheAction()
      const res = await fetch(`/api/leaderboard?period=${activeTab}&refresh=true`, { headers: { "Content-Type": "application/json" } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: ApiResponse = await res.json()
      if (data.entries?.length) { setPreviousEntries(entries); setEntries(data.entries); const now = Date.now(); activeTab === "current" ? (currentDataCache.current = { data: data.entries, timestamp: now }) : (pastDataCache.current = { data: data.entries, timestamp: now }) }
    } catch (err) { setError(err instanceof Error ? err.message : "Refresh failed") }
    finally { setIsRefreshing(false) }
  }

  const topThree = entries.slice(0, 3)
  const rest     = entries.slice(3)

  const cardStyle = (accent = LIME): React.CSSProperties => ({
    background: CARD_BG,
    border: `1.5px solid rgba(255,255,255,0.07)`,
    borderRadius: "16px",
    boxShadow: "0 2px 24px rgba(0,0,0,0.8)",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
  })

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#fff", fontFamily: "var(--font-poppins), sans-serif", position: "relative" }}>

      {/* Sticky ticker + nav are handled by SiteNavigation */}
      <SiteNavigation currentPage="leaderboard" />

      {/* ── Banner video ── */}
      <section style={{ width: "100%" }}>
        <video autoPlay muted loop playsInline style={{ width: "100%", height: "auto", objectFit: "cover", display: "block" }}>
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-leaderboard-header-banner-b693AAvhq4kfJGiTD6o3xHvpVTK5zS.webm" type="video/webm" />
        </video>
      </section>

      {/* ── Countdown ── */}
      <div style={{ background: "#000", padding: "2rem 1rem 0", textAlign: "center" }}>
        <p style={{ fontWeight: 700, fontSize: "clamp(0.75rem,2vw,1rem)", letterSpacing: "0.18em", textTransform: "uppercase", color: LIME, marginBottom: "0.5rem" }}>
          THIS RACE ENDS IN
        </p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.25rem", flexWrap: "wrap", padding: "0.5rem 0 1.25rem" }}>
          {([["DAYS", countdown.days], ["HOURS", countdown.hours], ["MINUTES", countdown.minutes], ["SECONDS", countdown.seconds]] as const).map(([label, val], idx) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: "60px" }}>
                <div style={{ fontSize: "clamp(0.6rem,1.5vw,0.75rem)", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.55)", marginBottom: "2px" }}>{label}</div>
                <div style={{ fontSize: "clamp(2rem,6vw,3.5rem)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>{String(val).padStart(2,"0")}</div>
              </div>
              {idx < 3 && <span style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)", color: "rgba(255,255,255,0.3)", margin: "0 0.25rem", marginTop: "1rem" }}>:</span>}
            </div>
          ))}
        </div>

        {/* ── Tab buttons ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          {(["current", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.6rem 1.8rem", borderRadius: "8px", border: "none", cursor: "pointer",
                fontFamily: "var(--font-poppins), sans-serif", fontWeight: 800, fontSize: "0.78rem",
                letterSpacing: "0.1em", textTransform: "uppercase",
                background: activeTab === tab ? LIME : CARD_BG,
                color: activeTab === tab ? "#000" : "#fff",
                boxShadow: activeTab === tab ? `0 0 18px ${LIME}55` : "none",
                transition: "all 0.18s ease",
              }}
            >
              {tab === "current" ? "Current Week" : "Past Week"}
            </button>
          ))}
        </div>

        <HoloButton href="https://thrill.com/?r=MANDY" external>JOIN THE ACTION</HoloButton>

        {isLoading && <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", marginTop: "0.75rem", letterSpacing: "0.06em" }}>Loading {activeTab} leaderboard…</p>}
        {error    && <p style={{ fontSize: "0.75rem", color: PINK, marginTop: "0.75rem", letterSpacing: "0.06em" }}>Using cached data — API temporarily unavailable</p>}
        {isAdmin && (
          <button onClick={handleRefresh} disabled={isRefreshing} style={{ marginTop: "0.75rem", padding: "0.4rem 1rem", background: CARD_BG, border: `1px solid ${PURPLE}`, borderRadius: "6px", color: PURPLE, fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", letterSpacing: "0.08em" }}>
            {isRefreshing ? "REFRESHING…" : "REFRESH (ADMIN)"}
          </button>
        )}

        <div style={{ height: "2rem", background: "linear-gradient(to bottom, #000, transparent)" }} />
      </div>

      {/* ── Holo bg section ── */}
      <div style={{ position: "relative" }}>
        <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1 }} />

        {/* ── Podium ── */}
        <div style={{ position: "relative", zIndex: 2, padding: "3rem 1rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.5rem)", letterSpacing: "0.12em", color: LIME, marginBottom: "2.5rem", textTransform: "uppercase" }}>
            TOP PLAYERS
          </h2>

          {/* Mobile: stacked 1/2/3. Desktop: 2nd / 1st / 3rd */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }} className="lb-podium">
            {/* 1st on mobile always first */}
            {[0, 1, 2].map((rank) => {
              const entry = topThree[rank]
              const accentColor = PODIUM_COLORS[rank]
              const isFirst = rank === 0
              return (
                <div
                  key={rank}
                  style={{
                    ...cardStyle(accentColor),
                    padding: isFirst ? "1.5rem" : "1.2rem",
                    textAlign: "center",
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <div style={{ position: "absolute", top: "-3.5rem", left: "50%", transform: "translateX(-50%)" }}>
                    <video autoPlay loop muted playsInline style={{ width: isFirst ? "120px" : "96px", height: isFirst ? "120px" : "96px", objectFit: "contain", pointerEvents: "none" }}>
                      <source src={PODIUM_VIDEOS[rank]} type="video/webm" />
                    </video>
                  </div>
                  <div style={{ paddingTop: "2.5rem" }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.15em", color: accentColor, marginBottom: "0.25rem" }}>
                      #{rank + 1} PLACE
                    </p>
                    <h3 style={{ fontSize: "clamp(1rem,3vw,1.4rem)", fontWeight: 900, color: "#fff", marginBottom: "0.4rem" }}>{entry?.username ?? "—"}</h3>
                    <p style={{ fontSize: "clamp(1.2rem,3.5vw,1.8rem)", fontWeight: 900, color: accentColor }}>{fmt(entry?.wager ?? 0)}</p>
                    <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: "0.25rem" }}>PRIZE: {fmt(entry?.prize ?? 0)}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Ranks 4–10 table ── */}
          <div style={{ ...cardStyle(), marginTop: "2rem", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem 0.5rem", display: "grid", gridTemplateColumns: "2rem 1fr 1fr 1fr", gap: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["#", "PLAYER", "WAGERED", "PRIZE"].map((h) => (
                <span key={h} style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.12em", color: LIME }}>{h}</span>
              ))}
            </div>
            {rest.map((entry, i) => (
              <div
                key={entry.id}
                style={{ padding: "0.75rem 1.25rem", display: "grid", gridTemplateColumns: "2rem 1fr 1fr 1fr", gap: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
              >
                <span style={{ fontWeight: 900, color: BLUE, fontSize: "0.82rem" }}>{entry.rank}</span>
                <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.username}</span>
                <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "#fff" }}>{fmt(entry.wager)}</span>
                <span style={{ fontWeight: 800, fontSize: "0.82rem", color: LIME }}>{fmt(entry.prize)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live Feed ── */}
      <div style={{ background: "#000", position: "relative", zIndex: 2 }}>
        <LeaderboardLiveFeed entries={entries} previousEntries={previousEntries} />
      </div>

      {/* ── Daily Raffle ── */}
      <div style={{ background: "#000", position: "relative", zIndex: 2 }}>
        <DailyRaffle winners={raffleWinners} />
      </div>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", overflow: "hidden", paddingTop: "3rem", paddingBottom: "2rem" }}>
        <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "0 1rem", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: "clamp(2rem,8vw,4rem)", color: "#000", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>MANDY.GG</p>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.15em", color: "#000", marginBottom: "1.5rem" }}>YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
          <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem 1.5rem", marginBottom: "1.5rem" }}>
            {[
              { label: "HOW TO JOIN", href: "/how-to-join" },
              { label: "REWARDS", href: "/rewards" },
              { label: "WEEKLY RACE", href: "/leaderboard" },
              { label: "TOOLS", href: "/tools" },
              { label: "GOSSIP", href: "/blog" },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: "#000", textDecoration: "none" }}>{l.label}</Link>
            ))}
          </nav>
          <MailingListForm />
          <div style={{ borderTop: "2px solid rgba(0,0,0,0.3)", marginTop: "1.5rem", paddingTop: "1rem", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#000", letterSpacing: "0.06em" }}>© 2026 MANDY.GG — ALL RIGHTS RESERVED</span>
            <div style={{ display: "flex", gap: "1rem" }}>
              {[{ label: "PRIVACY", href: "/privacy" }, { label: "TERMS", href: "/terms" }, { label: "RESPONSIBLE GAMBLING", href: "/responsible-gambling" }].map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: "0.7rem", fontWeight: 700, color: "#000", textDecoration: "none" }}>{l.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 640px) {
          .lb-podium {
            flex-direction: row !important;
            align-items: flex-end;
            justify-content: center;
          }
          .lb-podium > *:nth-child(1) { order: 2; flex: 1; margin-top: 0; transform: scale(1.06); }
          .lb-podium > *:nth-child(2) { order: 1; flex: 1; }
          .lb-podium > *:nth-child(3) { order: 3; flex: 1; }
        }
        .lb-podium > * { flex: 1; min-width: 0; }
      `}</style>
    </div>
  )
}

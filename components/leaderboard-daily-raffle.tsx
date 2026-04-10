"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

/* ── Theme — solid black with holographic accents ── */
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"
const RAFFLE_ICON   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_RAFFLE_ELEMENT-2R1zyKNqx7bHHMtC4xyKlIOZmVZ63c.webp"

const PAGE_BG  = "#000000"  // Solid black
const CARD_BG  = "#0a0a0a"  // Almost black
const CARD_BG2 = "#0f0f0f"  // Slightly lighter black
// Holographic accent colors from video overlay
const HOLO_BLUE    = "#3C7BFF"
const HOLO_CYAN    = "#5ac3ff"
const HOLO_PURPLE  = "#a855f7"
const HOLO_PINK    = "#ff94b4"
const HOLO_GREEN   = "#4ade80"
const HOLO_YELLOW  = "#fbbf24"

/* ── Countdown to next Friday midnight UTC ── */
function getTimeToFridayUTC() {
  const now = new Date()
  const day = now.getUTCDay()
  const daysUntil = (day === 5 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0)
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

interface RaffleWinner {
  raffle_date:           string
  winning_ticket_number: number | string
  prize_amount:          number
  prize_description?:    string
  claimed:               boolean
  username:              string
}

interface TicketEntry {
  rank:             number
  thrill_username:  string
  ticket_count:     number
  is_me:            boolean
}

interface WeeklyRaffleProps {
  winners?: RaffleWinner[]
}

function HoloBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "relative", overflow: "hidden", display: "inline-flex",
        alignItems: "center", justifyContent: "center",
        padding: "0.75rem 2rem", border: "none", borderRadius: "8px",
        cursor: "pointer", textDecoration: "none", minWidth: "190px",
        transition: "transform 0.15s ease",
      }}
    >
      <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, borderRadius: "inherit", pointerEvents: "none" }}>
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4}  type="video/mp4" />
      </video>
      <span style={{ position: "relative", zIndex: 1, color: "#000", fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-poppins), sans-serif" }}>
        {children}
      </span>
    </a>
  )
}

export function DailyRaffle({ winners: externalWinners }: WeeklyRaffleProps) {
  const [countdown,            setCountdown           ] = useState(getTimeToFridayUTC())
  const [recentWinners,        setRecentWinners       ] = useState<RaffleWinner[]>(externalWinners || [])
  const [showPreviousWinners,  setShowPreviousWinners ] = useState(false)
  const [userTickets,          setUserTickets         ] = useState<number | null>(null)
  const [totalTickets,         setTotalTickets        ] = useState<number>(0)
  const [totalPlayers,         setTotalPlayers        ] = useState<number>(0)
  const [ticketLeaderboard,    setTicketLeaderboard   ] = useState<TicketEntry[]>([])
  const [showLeaderboard,      setShowLeaderboard     ] = useState(false)
  const [prizeAmount,          setPrizeAmount         ] = useState(250)
  const [ticketsPerWager,      setTicketsPerWager     ] = useState(500)

  /* Countdown tick */
  useEffect(() => {
    const t = setInterval(() => setCountdown(getTimeToFridayUTC()), 1000)
    return () => clearInterval(t)
  }, [])

  /* Fetch winners */
  useEffect(() => {
    if (externalWinners && externalWinners.length > 0) { setRecentWinners(externalWinners); return }
    fetch("/api/raffle/winners")
      .then((r) => r.json())
      .then((d) => { if (d.winners) setRecentWinners(d.winners) })
      .catch(() => {})
  }, [externalWinners])

  /* Fetch tickets — runs every 5 min to stay live */
  useEffect(() => {
    const load = () => {
      fetch("/api/raffle/tickets")
        .then((r) => r.json())
        .then((d) => {
          // The GET response shape: { byWeek, currentWeek, ticketsPerWager, prizeAmount }
          // byWeek[0] = current week's grouped entry
          if (d.byWeek && d.byWeek.length > 0) {
            setUserTickets(d.byWeek[0].totalTickets ?? null)
          }
          if (typeof d.prizeAmount === "number")    setPrizeAmount(d.prizeAmount)
          if (typeof d.ticketsPerWager === "number") setTicketsPerWager(d.ticketsPerWager)
          // Fetch public leaderboard too
          fetch("/api/raffle/tickets/leaderboard").catch(() => {})
        })
        .catch(() => {})
    }
    load()
    const t = setInterval(load, 300_000) // refresh every 5 min
    return () => clearInterval(t)
  }, [])

  /* Fetch public ticket leaderboard (all players, no auth needed) */
  useEffect(() => {
    fetch("/api/raffle/tickets/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.leaderboard)  setTicketLeaderboard(d.leaderboard)
        if (d.total_tickets) setTotalTickets(d.total_tickets)
        if (d.total_players) setTotalPlayers(d.total_players)
        if (typeof d.prize_amount === "number")     setPrizeAmount(d.prize_amount)
        if (typeof d.tickets_per_wager === "number") setTicketsPerWager(d.tickets_per_wager)
      })
      .catch(() => {})
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")
  const latestWinner    = recentWinners[0] ?? null
  const previousWinners = recentWinners.slice(1)

  const infoBox: React.CSSProperties = {
    background:    "rgba(255,255,255,0.02)",
    border:        "1px solid rgba(255,255,255,0.06)",
    borderRadius:  "10px",
    padding:       "1rem 1.25rem",
    marginBottom:  "1rem",
  }

  return (
    <div
      id="raffle"
      style={{ background: PAGE_BG, maxWidth: "860px", margin: "0 auto", padding: "3rem 1rem 5rem" }}
    >
      {/* ── Raffle icon floats above card ── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "-3rem", position: "relative", zIndex: 2 }}>
        <img
          src={RAFFLE_ICON}
          alt="Mandy Raffle Tickets"
          style={{ width: "min(220px, 55vw)", height: "auto", filter: "drop-shadow(0 6px 24px rgba(0,0,0,0.6))" }}
        />
      </div>

      {/* ── Card ── */}
      <div style={{
        background:    CARD_BG,
        border:        "1.5px solid rgba(255,255,255,0.07)",
        borderRadius:  "16px",
        boxShadow:     "none",
        paddingTop:    "5rem",
        paddingLeft:   "clamp(1.25rem, 4vw, 2rem)",
        paddingRight:  "clamp(1.25rem, 4vw, 2rem)",
        paddingBottom: "2rem",
        position:      "relative",
        zIndex:        1,
        transition:    "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 32px rgba(60,123,255,0.15)"}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
      >

        {/* Title */}
        <h2 style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 900, fontSize: "clamp(1.5rem,4.5vw,2.4rem)", color: "#fff", textTransform: "uppercase", textAlign: "center", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
          <span style={{ color: LIME }}>${prizeAmount}</span> WEEKLY RAFFLE
        </h2>
        <p style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", marginBottom: "2rem", textTransform: "uppercase" }}>
          EVERY FRIDAY AT MIDNIGHT UTC · 1 TICKET PER ${ticketsPerWager} WAGERED
        </p>

        {/* ── Live stats in compact bento grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {[
            { label: "Total Tickets", value: totalTickets || "—",  accent: HOLO_CYAN },
            { label: "Players",       value: totalPlayers || "—",  accent: HOLO_PURPLE },
            { label: "Prize Pool",    value: `$${prizeAmount}`,    accent: HOLO_PINK },
            ...(userTickets !== null ? [{ label: "Your Tickets", value: userTickets, accent: HOLO_BLUE }] : []),
          ].map((stat) => (
            <div key={stat.label} style={{ background: CARD_BG2, border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.75rem 0.85rem", textAlign: "center", transition: "border-color 0.3s ease" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "rgba(60,123,255,0.25)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
            >
              <div style={{ fontSize: "clamp(1.2rem,3.5vw,1.6rem)", fontWeight: 900, color: stat.accent, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginTop: "3px", textTransform: "uppercase" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Countdown ── */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            NEXT DRAW IN
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
            {([["DAYS", countdown.days], ["HRS", countdown.hours], ["MIN", countdown.minutes], ["SEC", countdown.seconds]] as [string, number][]).map(([label, val], idx) => (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(1.4rem,4.5vw,2.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em", background: CARD_BG2, borderRadius: "6px", padding: "0.2rem 0.5rem", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {pad(val)}
                  </div>
                  <div style={{ fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)", marginTop: "3px" }}>{label}</div>
                </div>
                {idx < 3 && <span style={{ fontSize: "clamp(1rem,3.5vw,1.6rem)", color: "rgba(255,255,255,0.18)", margin: "0 3px", marginBottom: "1rem" }}>:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div style={infoBox}>
          <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase", marginBottom: "0.75rem" }}>HOW IT WORKS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              `Every $${ticketsPerWager} wagered on Thrill with code MANDY = 1 raffle ticket`,
              "Ticket counts update throughout the week as you play",
              `One winner receives $${prizeAmount} cash every Friday at midnight UTC`,
              "More you wager, more tickets you earn — better your odds",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ color: LIME, fontWeight: 900, fontSize: "0.7rem", marginTop: "2px", flexShrink: 0 }}>—</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.78)", lineHeight: 1.55 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ticket leaderboard toggle ── */}
        {ticketLeaderboard.length > 0 && (
          <div style={{ ...infoBox, marginBottom: "1.25rem" }}>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", color: BLUE, textTransform: "uppercase" }}>
                THIS WEEK&apos;S TICKET STANDINGS ({totalPlayers} players)
              </span>
              <ChevronDown style={{ width: 15, height: 15, color: BLUE, transition: "transform 0.25s", transform: showLeaderboard ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
            </button>

            {showLeaderboard && (
              <div style={{ marginTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {ticketLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    style={{
                      display: "grid", gridTemplateColumns: "2rem 1fr auto",
                      gap: "0.5rem", alignItems: "center",
                      padding: "0.5rem 0.75rem", borderRadius: "8px",
                      background: entry.is_me ? "rgba(60,123,255,0.08)" : "rgba(255,255,255,0.03)",
                      border: entry.is_me ? `1px solid rgba(60,123,255,0.25)` : "1px solid transparent",
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: "0.7rem", color: entry.rank <= 3 ? LIME : "rgba(255,255,255,0.4)" }}>#{entry.rank}</span>
                    <span style={{ fontWeight: 700, fontSize: "0.78rem", color: entry.is_me ? LIME : "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {entry.thrill_username}{entry.is_me ? " (you)" : ""}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: "0.78rem", color: BLUE, textAlign: "right" }}>
                      {entry.ticket_count} {entry.ticket_count === 1 ? "ticket" : "tickets"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Rules ── */}
        <div style={infoBox}>
          <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase", marginBottom: "0.75rem" }}>RULES</p>
          <ol style={{ paddingLeft: "1.1rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {[
              <>Must be registered on Thrill.com with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" style={{ color: LIME, fontWeight: 800, textDecoration: "none" }}>MANDY</a></>,
              `$${ticketsPerWager} USD wagered = 1 raffle ticket (tracked weekly Mon–Fri)`,
              "1 winner drawn every Friday at 00:00:00 UTC",
              <>Message <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, fontWeight: 800, textDecoration: "none" }}>@MandySupportBot</a> on Telegram to claim</>,
              "Prizes must be claimed within 7 days or are forfeited",
              "Prizes may take up to 72 hours to be sent",
            ].map((rule, i) => (
              <li key={i} style={{ fontSize: "0.76rem", fontWeight: 600, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>{rule}</li>
            ))}
          </ol>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <HoloBtn href="https://thrill.com/?r=MANDY">ENTER THE RAFFLE</HoloBtn>
        </div>

        {/* ── Most recent winner ── */}
        <div style={infoBox}>
          <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase", marginBottom: "0.75rem" }}>LAST WINNER</p>

          {latestWinner ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.38)", marginBottom: "3px" }}>{latestWinner.raffle_date}</p>
                  <p style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>
                    {latestWinner.username}{" "}
                    <span style={{ color: LIME, fontWeight: 700, fontSize: "0.82rem" }}>
                      (Ticket #{latestWinner.winning_ticket_number})
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.38)", marginBottom: "3px" }}>PRIZE</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 900, color: LIME }}>${latestWinner.prize_amount}</p>
                </div>
              </div>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, color: latestWinner.claimed ? LIME : PINK, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {latestWinner.claimed ? "CLAIMED" : "UNCLAIMED — Contact @MandySupportBot on Telegram"}
              </p>

              {previousWinners.length > 0 && (
                <div style={{ marginTop: "0.85rem" }}>
                  <button
                    onClick={() => setShowPreviousWinners(!showPreviousWinners)}
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    Previous winners
                    <ChevronDown style={{ width: 13, height: 13, transition: "transform 0.25s", transform: showPreviousWinners ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>

                  {showPreviousWinners && (
                    <div style={{ marginTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                      {previousWinners.map((w) => (
                        <div key={w.raffle_date} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.68)" }}>
                            <span style={{ color: "rgba(255,255,255,0.35)", marginRight: "0.5rem" }}>{w.raffle_date}</span>
                            {w.username} <span style={{ color: LIME }}>#{w.winning_ticket_number}</span>
                          </span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: w.claimed ? LIME : PINK }}>
                            {w.claimed ? "CLAIMED" : "UNCLAIMED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: "0.85rem", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", lineHeight: 1.55 }}>
                  Won the raffle? Message{" "}
                  <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, fontWeight: 800, textDecoration: "none" }}>
                    @MandySupportBot on Telegram
                  </a>{" "}
                  to claim your prize within 7 days.
                </p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>
              No winners drawn yet. First draw happens every Friday at midnight UTC — sign up with code MANDY on Thrill.com to enter.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

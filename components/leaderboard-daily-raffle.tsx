"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

/* ── Theme ── */
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"
const RAFFLE_ICON   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAFFLE_ICON-wEJ9OoZlJBMcU6kfx1FskugZgAaH53.webp"

const PAGE_BG = "#00020a"
const CARD_BG = "#080c14"
const LIME    = "#b5dc58"
const PINK    = "#ff94b4"
const BLUE    = "#5ac3ff"

/* ── Countdown to next Friday midnight UTC ── */
function getTimeToFridayUTC() {
  const now = new Date()
  const day = now.getUTCDay() // 5 = Friday
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

interface RaffleWinner {
  raffle_date:           string
  winning_ticket_number: number | string
  prize_amount:          number
  prize_description?:    string
  claimed:               boolean
  username:              string
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
        padding: "0.7rem 2rem", border: "none", borderRadius: "8px",
        cursor: "pointer", textDecoration: "none", minWidth: "180px",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
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
  const [countdown,           setCountdown          ] = useState(getTimeToFridayUTC())
  const [recentWinners,       setRecentWinners      ] = useState<RaffleWinner[]>(externalWinners || [])
  const [showPreviousWinners, setShowPreviousWinners] = useState(false)
  const [userTickets,         setUserTickets        ] = useState<number | null>(null)

  /* Countdown tick */
  useEffect(() => {
    const t = setInterval(() => setCountdown(getTimeToFridayUTC()), 1000)
    return () => clearInterval(t)
  }, [])

  /* Fetch winners if not provided */
  useEffect(() => {
    if (externalWinners && externalWinners.length > 0) { setRecentWinners(externalWinners); return }
    fetch("/api/raffle/winners")
      .then((r) => r.json())
      .then((d) => { if (d.winners) setRecentWinners(d.winners) })
      .catch(() => {})
  }, [externalWinners])

  /* Fetch current user's tickets for this week */
  useEffect(() => {
    fetch("/api/raffle/tickets")
      .then((r) => r.json())
      .then((d) => { if (typeof d.ticket_count === "number") setUserTickets(d.ticket_count) })
      .catch(() => {})
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")
  const latestWinner   = recentWinners[0] ?? null
  const previousWinners = recentWinners.slice(1)

  return (
    <div
      id="raffle"
      style={{ maxWidth: "860px", margin: "0 auto", padding: "3rem 1rem 4rem" }}
    >
      {/* ── Raffle icon half-hanging above card ── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "-3.5rem", position: "relative", zIndex: 2 }}>
        <img
          src={RAFFLE_ICON}
          alt="Raffle Ticket"
          style={{ width: "min(200px, 50vw)", height: "auto", filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.7))" }}
        />
      </div>

      {/* ── Card ── */}
      <div style={{
        background: CARD_BG,
        border: "1.5px solid rgba(255,255,255,0.07)",
        borderRadius: "20px",
        boxShadow: "0 4px 48px rgba(0,2,10,0.8)",
        paddingTop: "4.5rem",
        paddingLeft: "clamp(1.25rem, 4vw, 2.5rem)",
        paddingRight: "clamp(1.25rem, 4vw, 2.5rem)",
        paddingBottom: "2rem",
        position: "relative",
        zIndex: 1,
      }}>

        {/* Title */}
        <h2 style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 900, fontSize: "clamp(1.4rem,4vw,2.2rem)", color: "#fff", textTransform: "uppercase", textAlign: "center", letterSpacing: "0.05em", marginBottom: "0.3rem" }}>
          <span style={{ color: LIME }}>$250</span> WEEKLY RAFFLE
        </h2>
        <p style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: "2rem", textTransform: "uppercase" }}>
          EVERY FRIDAY AT MIDNIGHT UTC
        </p>

        {/* ── User ticket count ── */}
        {userTickets !== null && (
          <div style={{ background: "rgba(181,220,88,0.08)", border: `1px solid ${LIME}44`, borderRadius: "10px", padding: "0.85rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>Your tickets this week</span>
            <span style={{ fontSize: "1.4rem", fontWeight: 900, color: LIME }}>{userTickets}</span>
          </div>
        )}

        {/* ── Countdown ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.6rem" }}>
            NEXT DRAW IN
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.25rem", flexWrap: "wrap" }}>
            {([["DAYS", countdown.days], ["HRS", countdown.hours], ["MIN", countdown.minutes], ["SEC", countdown.seconds]] as [string, number][]).map(([label, val], idx) => (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(1.6rem,5vw,2.8rem)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.02em" }}>
                    {pad(val)}
                  </div>
                  <div style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>{label}</div>
                </div>
                {idx < 3 && <span style={{ fontSize: "clamp(1.2rem,4vw,2rem)", color: "rgba(255,255,255,0.2)", margin: "0 4px", marginBottom: "1rem" }}>:</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase", marginBottom: "0.75rem" }}>HOW IT WORKS</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              `Every ${"$500"} wagered on Thrill = 1 raffle ticket`,
              "Tickets accumulate throughout the week",
              `1 winner receives ${"$250"} every Friday at midnight UTC`,
              "Ticket counts update in real time as you play",
            ].map((line, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ color: LIME, fontWeight: 900, fontSize: "0.7rem", marginTop: "2px", flexShrink: 0 }}>—</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Rules ── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase", marginBottom: "0.75rem" }}>RULES</p>
          <ol style={{ paddingLeft: "1rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            {[
              <>Must be registered on Thrill.com with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" style={{ color: LIME, fontWeight: 800, textDecoration: "none" }}>MANDY</a></>,
              "$500 USD wagered = 1 raffle ticket (tracked weekly Mon–Fri)",
              "1 winner drawn every Friday at 00:00:00 UTC",
              <>Message <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, fontWeight: 800, textDecoration: "none" }}>@MandySupportBot</a> on Telegram to claim</>,
              "Prizes must be claimed within 7 days or are forfeited",
              "Prizes may take up to 72 hours to be sent",
            ].map((rule, i) => (
              <li key={i} style={{ fontSize: "0.76rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{rule}</li>
            ))}
          </ol>
        </div>

        {/* ── CTA ── */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <HoloBtn href="https://thrill.com/?r=MANDY">ENTER THE RAFFLE</HoloBtn>
        </div>

        {/* ── Most recent winner ── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "1.25rem 1.5rem" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase", marginBottom: "0.75rem" }}>LAST WINNER</p>

          {latestWinner ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>{latestWinner.raffle_date}</p>
                  <p style={{ fontSize: "1rem", fontWeight: 900, color: "#fff" }}>
                    {latestWinner.username}{" "}
                    <span style={{ color: LIME, fontWeight: 700, fontSize: "0.85rem" }}>
                      (Ticket #{latestWinner.winning_ticket_number})
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>PRIZE</p>
                  <p style={{ fontSize: "1rem", fontWeight: 900, color: LIME }}>${latestWinner.prize_amount}</p>
                </div>
              </div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: latestWinner.claimed ? LIME : PINK, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {latestWinner.claimed ? "CLAIMED" : "UNCLAIMED — Contact @MandySupportBot on Telegram"}
              </p>

              {previousWinners.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    onClick={() => setShowPreviousWinners(!showPreviousWinners)}
                    style={{ display: "flex", alignItems: "center", gap: "0.35rem", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    Previous winners
                    <ChevronDown style={{ width: 14, height: 14, transition: "transform 0.25s", transform: showPreviousWinners ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>

                  {showPreviousWinners && (
                    <div style={{ marginTop: "0.6rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "0.6rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {previousWinners.map((w) => (
                        <div key={w.raffle_date} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.25rem" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
                            <span style={{ color: "rgba(255,255,255,0.4)", marginRight: "0.5rem" }}>{w.raffle_date}</span>
                            {w.username} <span style={{ color: LIME }}>#{w.winning_ticket_number}</span>
                          </span>
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: w.claimed ? LIME : PINK }}>
                            {w.claimed ? "CLAIMED" : "UNCLAIMED"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  Won the raffle? Message{" "}
                  <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" style={{ color: BLUE, fontWeight: 800, textDecoration: "none" }}>
                    @MandySupportBot on Telegram
                  </a>{" "}
                  to claim your prize within 7 days.
                </p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.45)" }}>No winners drawn yet. First draw is every Friday at midnight UTC.</p>
          )}
        </div>
      </div>
    </div>
  )
}

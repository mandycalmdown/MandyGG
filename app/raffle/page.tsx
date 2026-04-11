import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import { DailyRaffle } from "@/components/leaderboard-daily-raffle"
import type { Metadata } from "next"
import "@/styles/mandy-home.css"

export const metadata: Metadata = {
  title: "Weekly Raffle | Mandy.gg",
  description: "Every $500 wagered on Thrill = 1 raffle ticket. $250 prize drawn every Friday at midnight UTC. Code: MANDY.",
}

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"

const PAGE_BG = "#000000"

export default function RafflePage() {
  return (
    <>
      <SiteNavigation currentPage="raffle" />
      <div className="mandy-home" style={{ minHeight: "100vh", background: PAGE_BG, color: "#fff", fontFamily: "var(--font-poppins), sans-serif" }}>

        {/* Holo header */}
        <div style={{ textAlign: "center", padding: "4rem 1rem 1rem" }}>
          <div className="holo-mask" style={{ marginBottom: "0.75rem" }}>
            <h1 className="holo-mask__letters" style={{
              fontSize: "clamp(2rem, 8vw, 4.5rem)",
              fontFamily: "Poppins, var(--font-poppins), sans-serif",
              fontWeight: 900,
              letterSpacing: "0.02em",
            }}>
              WEEKLY RAFFLE
            </h1>
            <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
              <source src={HOLO_TEXT_SRC} type="video/mp4" />
            </video>
            <span className="holo-sheen" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>
            EVERY FRIDAY · MIDNIGHT UTC · CODE: MANDY
          </p>
        </div>

      {/* Raffle component */}
      <DailyRaffle />

      <SiteFooter />
      </div>
    </>
  )
}

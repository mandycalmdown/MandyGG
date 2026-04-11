import { SiteNavigation } from "@/components/site-navigation"
import { DailyRaffle } from "@/components/leaderboard-daily-raffle"
import Link from "next/link"
import type { Metadata } from "next"
import "@/styles/mandy-home.css"

export const metadata: Metadata = {
  title: "Weekly Raffle | Mandy.gg",
  description: "Every $500 wagered on Thrill = 1 raffle ticket. $250 prize drawn every Friday at midnight UTC. Code: MANDY.",
}

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"
const HOLO_BG_MP4   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"

const PAGE_BG = "#00020a"

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

      {/* Footer */}
      <footer style={{ position: "relative", overflow: "hidden", paddingTop: "3rem", paddingBottom: "2rem" }}>
        <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>
        <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "0 1rem", textAlign: "center" }}>
          <p style={{ fontWeight: 900, fontSize: "clamp(2.5rem,10vw,5rem)", color: "#000", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>MANDY.GG</p>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.15em", color: "#000", marginBottom: "1.5rem" }}>YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
          <nav style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem 1.5rem", marginBottom: "1.5rem" }}>
            {[
              { label: "HOW TO JOIN",  href: "/how-to-join" },
              { label: "REWARDS",      href: "/rewards" },
              { label: "LEADERBOARD",  href: "/leaderboard" },
              { label: "RAFFLE",       href: "/raffle" },
              { label: "GOSSIP",       href: "/blog" },
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

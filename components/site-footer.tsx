"use client"

import Link from "next/link"
import { AnnouncementsTicker } from "@/components/announcements-ticker"

const HOLO_BG_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"

const NAV_LINKS = [
  { label: "HOME",            href: "/" },
  { label: "HOW TO JOIN",     href: "/how-to-join" },
  { label: "CASINOS",         href: "/casinos" },
  { label: "REWARDS",         href: "/rewards" },
  { label: "LEADERBOARD",     href: "/leaderboard" },
  { label: "RAFFLE",          href: "/raffle" },
  // { label: "GOSSIP",          href: "/blog" },  // HIDDEN
  { label: "DEGEN DASHBOARD", href: "/dashboard" },
  { label: "FAQ",             href: "/#faq" },
]

const SOCIAL_LINKS = [
  { label: "TELEGRAM CHAT",    href: "https://t.me/mandyggchat" },
  { label: "TELEGRAM CHANNEL", href: "https://t.me/mandygg" },
  { label: "DISCORD",          href: "https://discord.gg/mandygg" },
  { label: "KICK",             href: "https://kick.com/mandycalmdown" },
  { label: "TWITTER / X",      href: "https://twitter.com/mandycalmdown" },
]

export function SiteFooter() {
  return (
    <footer style={{ position: "relative" }}>
      {/* Ticker at the top of footer */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <AnnouncementsTicker />
      </div>
      
      <div style={{ paddingTop: "3.5rem", paddingBottom: "2rem", position: "relative", overflow: "hidden" }}>
        {/* Holographic video background */}
        <video
          autoPlay loop muted playsInline aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
        >
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem" }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <p style={{ fontWeight: 900, fontSize: "clamp(2.5rem,10vw,5rem)", color: "#000", letterSpacing: "-0.01em", lineHeight: 1, marginBottom: "0.25rem", fontFamily: "var(--font-poppins), sans-serif" }}>
            MANDY.GG
          </p>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.18em", color: "#000", textTransform: "uppercase" }}>
            YEAH, I&apos;M A GIRL AND I GAMBLE.
          </p>
        </div>

        {/* Nav links */}
        <nav
          aria-label="Footer navigation"
          style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem 1.25rem", marginBottom: "1.5rem" }}
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em", color: "#000", textDecoration: "none", textTransform: "uppercase" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Social links */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.4rem 1.25rem", marginBottom: "2rem" }}>
          {SOCIAL_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "#000", textDecoration: "none", textTransform: "uppercase", opacity: 0.75 }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ borderTop: "1.5px solid rgba(0,0,0,0.3)", paddingTop: "1.25rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 600, color: "rgba(0,0,0,0.7)", lineHeight: 1.6, textAlign: "center", maxWidth: "680px", margin: "0 auto 1rem" }}>
            Gambling involves risk. Never wager more than you can afford to lose. If gambling is affecting your life or the lives of those around you, please seek help. Resources: <a href="https://www.ncpgambling.org" target="_blank" rel="noopener noreferrer" style={{ color: "#000", fontWeight: 800 }}>NCPG</a> · <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" style={{ color: "#000", fontWeight: 800 }}>BeGambleAware</a>. Must be 18+ (21+ where applicable) to participate. Mandy.GG is not a gambling operator.
          </p>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
          <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "#000", letterSpacing: "0.06em" }}>
            © 2026 MANDY.GG. ALL RIGHTS RESERVED.
          </p>
          <div style={{ display: "flex", gap: "1.25rem" }}>
            {[
              { label: "PRIVACY", href: "/privacy" },
              { label: "TERMS",   href: "/terms" },
              { label: "SUPPORT", href: "https://t.me/mandysupport_bot" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{ fontSize: "0.68rem", fontWeight: 700, color: "#000", textDecoration: "none", letterSpacing: "0.06em" }}
              >
                {l.label}
              </a>
            ))}
        </div>
      </div>
    </footer>
  )
}

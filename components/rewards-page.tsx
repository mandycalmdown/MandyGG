"use client"

import { SiteNavigation } from "@/components/site-navigation"
import "@/styles/mandy-home.css"

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"

function HoloText() {
  return (
    <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
      <source src={HOLO_TEXT_SRC} type="video/mp4" />
    </video>
  )
}

export function RewardsPage() {
  return (
    <div className="mandy-home">
      <SiteNavigation currentPage="rewards" />

      {/* Hero Section with Holo Title */}
      <section className="hero" style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "6rem" }}>
        <div
          className="holo-mask"
          style={{ marginBottom: "2rem" }}
        >
          <h1 className="holo-mask__letters" style={{
            fontSize: "clamp(3rem, 12vw, 8rem)",
            fontFamily: "Poppins, var(--font-poppins), sans-serif",
            fontWeight: 900,
            letterSpacing: "0.02em",
          }}>
            REWARDS
          </h1>
          <HoloText />
          <span className="holo-sheen" aria-hidden="true" />
        </div>

        {/* Coming Soon Content */}
        <div style={{ textAlign: "center", maxWidth: "600px", padding: "0 1.5rem" }}>
          <p style={{
            fontFamily: "Poppins, var(--font-poppins), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
            color: "#3C7BFF",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "1.5rem",
          }}>
            COMING SOON
          </p>
          <p style={{
            fontFamily: "Poppins, var(--font-poppins), sans-serif",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "#ffffff",
            marginBottom: "0.75rem",
          }}>
            {"Sorry, I have ADHD."}
          </p>
          <p style={{
            fontFamily: "Poppins, var(--font-poppins), sans-serif",
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
          }}>
            Exciting rewards are on the way. Stay tuned!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer" style={{ marginTop: "auto" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", padding: "4rem 1rem 3rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-logo-small-REJQ74xYMktKwzxz1LsyZINIDXNKJs.webp"
              alt="Mandy.gg logo"
              style={{ height: "2.5rem", width: "auto" }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {[
              { href: "/privacy", label: "PRIVACY POLICY" },
              { href: "/terms", label: "TERMS OF SERVICE" },
              { href: "https://t.me/mandysupport_bot", label: "SUPPORT", external: true },
            ].map(item => (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                style={{
                  fontFamily: "Poppins, var(--font-poppins), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          <p style={{
            fontFamily: "Poppins, var(--font-poppins), sans-serif",
            fontSize: "0.7rem",
            fontWeight: 700,
            color: "rgba(255,255,255,0.45)",
            marginTop: "2rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            lineHeight: 1.6,
          }}>
            {"© 2025 MANDY.GG. ALL RIGHTS RESERVED. PLAY RESPONSIBLY. CRYPTOCURRENCY GAMBLING INVOLVES RISK. MUST BE 18+ TO PARTICIPATE."}
          </p>
        </div>
      </footer>
    </div>
  )
}

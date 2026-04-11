"use client"

import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
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
    <>
      <SiteNavigation currentPage="rewards" />
      <div className="mandy-home">

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

      <SiteFooter />
    </div>
    </>
  )
}

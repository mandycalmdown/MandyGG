"use client"

import { useEffect, useState } from "react"
import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import "@/styles/mandy-home.css"

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"

const CARD = "#010101"
const BORDER = "rgba(255,255,255,0.5)"

interface Casino {
  id: string
  name: string
  description: string | null
  referral_url: string
  logo_url: string | null
}

function HoloButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center",
        justifyContent: "center", padding: "0.7rem 1.75rem", borderRadius: "8px",
        border: "none", cursor: "pointer", textDecoration: "none",
      }}
    >
      <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, borderRadius: "inherit" }}>
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4} type="video/mp4" />
      </video>
      <span style={{ position: "relative", zIndex: 1, color: "#000", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-poppins), sans-serif" }}>
        {children}
      </span>
    </a>
  )
}

export default function CasinosPage() {
  const [casinos, setCasinos] = useState<Casino[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/casinos")
      .then((r) => r.json())
      .then((d) => setCasinos(d.casinos ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SiteNavigation currentPage="casinos" />
      <div className="mandy-home" style={{ minHeight: "100vh", background: "#000000", color: "#fff", fontFamily: "var(--font-poppins), sans-serif" }}>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "4rem 1rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <div className="holo-mask" style={{ marginBottom: "1rem" }}>
            <h1 className="holo-mask__letters" style={{ fontSize: "clamp(2.5rem, 9vw, 5rem)", fontFamily: "var(--font-poppins), sans-serif", fontWeight: 900, letterSpacing: "0.02em" }}>
              CASINOS
            </h1>
            <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
              <source src={HOLO_TEXT_SRC} type="video/mp4" />
            </video>
            <span className="holo-sheen" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "clamp(0.75rem,2vw,0.9rem)", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
            True degenerates play on multiple platforms. <br /> Use the links below to play under my code.
          </p>
        </section>

        {/* Casino Cards */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1rem 4rem" }}>
          {loading ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "4rem" }}>Loading...</p>
          ) : casinos.length === 0 ? (
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: "4rem" }}>No casinos listed yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))", gap: "1.25rem" }}>
              {casinos.map((casino) => (
                <div
                  key={casino.id}
                  style={{
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: "16px",
                    padding: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.animation = "none"
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.borderColor = BORDER
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {casino.logo_url ? (
                      <img
                        src={casino.logo_url}
                        alt={`${casino.name} logo`}
                        style={{ width: "56px", height: "56px", objectFit: "contain", borderRadius: "10px", background: "#fff", padding: "6px", flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{ width: "56px", height: "56px", borderRadius: "10px", background: "rgba(60,123,255,0.15)", border: "1px solid rgba(60,123,255,0.3)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: "1.5rem" }}>🎰</span>
                      </div>
                    )}
                    <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,2.5vw,1.35rem)", color: "#fff", letterSpacing: "0.02em", margin: 0 }}>
                      {casino.name}
                    </h2>
                  </div>

                  {casino.description && (
                    <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>
                      {casino.description}
                    </p>
                  )}

                  <HoloButton href={casino.referral_url}>
                    Play at {casino.name}
                  </HoloButton>
                </div>
              ))}
            </div>
          )}
        </section>

        <SiteFooter />
      </div>
    </>
  )
}

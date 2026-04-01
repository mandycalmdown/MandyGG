"use client"

import Link from "next/link"
import Image from "next/image"
import { SiteNavigation } from "@/components/site-navigation"
import { AnnouncementsTicker } from "@/components/announcements-ticker"
import MailingListForm from "@/components/MailingListForm"

const HOLO_BG = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-KuTV174iSOVIJGQHzXHDyVA96RnXCn.webp"
const HOLO_BG_MOBILE = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-mobile-ZwOFt65iGL74bPv4mX15f9MezlKFZP.webp"

export function RewardsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000000", position: "relative" }}>
      {/* Fixed holographic background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }} aria-hidden="true">
        <picture>
          <source media="(max-width: 768px)" srcSet={HOLO_BG_MOBILE} />
          <img src={HOLO_BG} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </picture>
      </div>

      {/* Ticker */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <AnnouncementsTicker tickerKey="ticker_1_text" />
      </div>

      <div style={{ position: "relative", zIndex: 10 }}>
        <SiteNavigation currentPage="rewards" />
      </div>

      {/* Banner */}
      <section style={{ position: "relative", zIndex: 10, width: "100%", marginBottom: "0.5rem" }}>
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 0.5rem" }}>
          <Image
            src="/images/rewards-banner-desktop-new.webp"
            alt="Mandy Rewards - Thrill Casino Bonuses"
            width={1200}
            height={300}
            className="hidden md:block w-full h-auto"
            style={{ objectFit: "contain", maxHeight: "50vh" }}
            priority
          />
          <Image
            src="/images/rewards-banner-mobile-new.webp"
            alt="Mobile Rewards - Thrill Casino Bonuses"
            width={400}
            height={400}
            className="md:hidden w-full h-auto mx-auto"
            style={{ objectFit: "contain", maxWidth: "360px", display: "block" }}
            priority
          />
        </div>
      </section>

      {/* Main Content */}
      <main style={{ position: "relative", zIndex: 10, padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <div style={{
            background: "#080b10",
            border: "1.5px solid rgba(181,220,88,0.25)",
            borderRadius: "16px",
            padding: "3rem 2.5rem",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(181,220,88,0.08)",
          }}>
            <h1 style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 8vw, 3rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.5rem",
            }}>REWARDS</h1>
            <p style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 800,
              fontSize: "1.4rem",
              color: "#b5dc58",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "1rem",
            }}>COMING SOON</p>
            <p style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "1rem",
              color: "#ffffff",
              marginBottom: "0.5rem",
            }}>{"Sorry, I have ADHD."}</p>
            <p style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.45)",
            }}>Exciting rewards are on the way. Stay tuned!</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        background: "#000000",
        padding: "3rem 1rem",
        marginTop: "2rem",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
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
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  textDecoration: "none",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >{item.label}</a>
            ))}
          </div>
          <MailingListForm />
          <p style={{
            fontFamily: "var(--font-poppins), sans-serif",
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

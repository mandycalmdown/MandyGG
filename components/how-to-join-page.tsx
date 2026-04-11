"use client"

import { SiteNavigation } from "@/components/site-navigation"
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import "@/styles/mandy-home.css"

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"
const HOLO_BG_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"

const ACCENT = "#3C7BFF"
const PINK = "#ff94b4"
const BLUE = "#5ac3ff"
const CARD = "#080b10"

function HoloText() {
  return (
    <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
      <source src={HOLO_TEXT_SRC} type="video/mp4" />
    </video>
  )
}

function HoloButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "relative", overflow: "hidden", display: "inline-flex", alignItems: "center",
        justifyContent: "center", gap: "0.5rem", padding: "0.85rem 2.2rem", borderRadius: "8px",
        border: "none", cursor: "pointer", textDecoration: "none", minWidth: "180px",
      }}
    >
      <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, borderRadius: "inherit" }}>
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4} type="video/mp4" />
      </video>
      <span style={{ position: "relative", zIndex: 1, color: "#000", fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-poppins), sans-serif", display: "flex", alignItems: "center", gap: "0.4rem" }}>
        {children}
      </span>
    </a>
  )
}

const STEPS = [
  {
    number: 1,
    accent: ACCENT,
    title: "Visit Thrill with Code MANDY",
    body: "Click the button below to open Thrill.com. Make sure to use this specific link so you're registered under code MANDY and eligible for all exclusive rewards.",
    checks: [
      { icon: "check", text: "Use the referral link to sign up" },
      { icon: "check", text: "Must be 18 years or older to participate" },
      { icon: "check", text: "Have a valid email address" },
    ],
    img: "/images/design-mode/MANDYGG_THRILL_SIGNIN(1).webp",
    imgAlt: "Thrill.com homepage showing sign up button",
    cta: { label: "Visit Thrill.com", href: "https://thrill.com/?r=MANDY" },
    imgRight: true,
  },
  {
    number: 2,
    accent: BLUE,
    title: "Complete Sign Up Process",
    body: 'Click the SIGN UP button and follow the registration process. Enter your email address and complete all required fields to create your account.',
    checks: [
      { icon: "check", text: 'Click "SIGN UP" in the top right corner' },
      { icon: "check", text: "Enter your email and create a secure password" },
      { icon: "check", text: "Complete all required registration fields" },
    ],
    img: "/images/design-mode/MANDYGG_THRILL_EMAIL(1).webp",
    imgAlt: "Thrill sign up form with email input",
    imgRight: false,
  },
  {
    number: 3,
    accent: ACCENT,
    title: "Verify Your Referral Code",
    body: "After signing up, click on your profile and verify that you are referred by mandycalmdown. This is crucial for reward eligibility.",
    checks: [
      { icon: "check", text: "Click on your profile icon in the top right" },
      { icon: "check", text: 'Look for "Referred by mandycalmdown" text' },
      { icon: "alert", text: "If you don't see this, contact support immediately" },
    ],
    img: "/images/design-mode/MANDYGG_THRILL_PROFILE(1).webp",
    imgAlt: "Thrill profile showing referred by mandycalmdown",
    imgRight: true,
  },
]

export function HowToJoinPage() {
  return (
    <>
      <SiteNavigation currentPage="how-to-join" />
      <div className="mandy-home" style={{ minHeight: "100vh", background: "#000", color: "#fff", fontFamily: "var(--font-poppins), sans-serif" }}>

        {/* ── Hero with Holo Header ── */}
        <section style={{ padding: "6rem 1rem 3rem", textAlign: "center", maxWidth: "900px", margin: "0 auto" }}>
          <div className="holo-mask" style={{ marginBottom: "1.5rem" }}>
            <h1 className="holo-mask__letters" style={{
              fontSize: "clamp(2.5rem, 10vw, 6rem)",
              fontFamily: "Poppins, var(--font-poppins), sans-serif",
              fontWeight: 900,
              letterSpacing: "0.02em",
            }}>
              HOW TO JOIN
            </h1>
            <HoloText />
            <span className="holo-sheen" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "clamp(0.9rem,2vw,1.1rem)", fontWeight: 600, color: "rgba(255,255,255,0.75)", letterSpacing: "0.04em", lineHeight: 1.6 }}>
            Follow these steps to join Thrill.com with code{" "}
            <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontWeight: 800, textDecoration: "none" }}>MANDY</a>{" "}
            and unlock exclusive rewards.
          </p>
        </section>

        {/* ── Steps ── */}
        <section style={{ padding: "0 1rem 5rem", maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
            {STEPS.map((step) => (
              <div
                key={step.number}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "2rem",
                  alignItems: "center",
                }}
                className={`htj-step${step.imgRight ? " htj-step--img-right" : ""}`}
              >
                {/* Text side */}
                <div style={{ order: step.imgRight ? 1 : 2 }} className="htj-text">
                  {/* Step badge */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${step.accent}18`, border: `1px solid ${step.accent}44`, borderRadius: "6px", padding: "0.35rem 0.9rem", marginBottom: "1.25rem" }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "1.4rem", height: "1.4rem", borderRadius: "4px", background: step.accent, color: "#000", fontWeight: 800, fontSize: "0.75rem" }}>
                      {step.number}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.15em", color: step.accent }}>
                      STEP {["ONE", "TWO", "THREE"][step.number - 1]}
                    </span>
                  </div>

                  <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,3.5vw,2.4rem)", textTransform: "uppercase", lineHeight: 1.1, marginBottom: "1rem" }}>
                    {step.title}
                  </h2>
                  <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, marginBottom: "1.25rem" }}>
                    {step.body}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    {step.checks.map((c, ci) => (
                      <div key={ci} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                        {c.icon === "alert"
                          ? <AlertCircle style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0, marginTop: "2px", color: PINK }} />
                          : <CheckCircle2 style={{ width: "1.1rem", height: "1.1rem", flexShrink: 0, marginTop: "2px", color: step.accent }} />
                        }
                        <p style={{ fontSize: "0.88rem", fontWeight: 600, color: c.icon === "alert" ? PINK : "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
                          {c.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {step.cta && <HoloButton href={step.cta.href}>{step.cta.label} <ExternalLink style={{ width: "0.9rem", height: "0.9rem" }} /></HoloButton>}
                </div>

                {/* Image side */}
                <div style={{ order: step.imgRight ? 2 : 1 }} className="htj-img">
                  <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", border: `1.5px solid ${step.accent}33`, boxShadow: `0 2px 32px rgba(0,0,0,0.7), 0 0 40px ${step.accent}18` }}>
                    <Image
                      src={step.img}
                      alt={step.imgAlt}
                      width={800}
                      height={500}
                      style={{ width: "100%", height: "auto", display: "block" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Important Notice ── */}
        <section style={{ padding: "0 1rem 5rem", maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ background: CARD, border: `1.5px solid ${PINK}44`, borderRadius: "16px", padding: "2.5rem", boxShadow: `0 24px 64px rgba(0,0,0,0.8), 0 0 30px ${PINK}18` }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <AlertCircle style={{ width: "2rem", height: "2rem", color: PINK, flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h3 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,2.5vw,1.6rem)", textTransform: "uppercase", color: PINK, marginBottom: "0.75rem" }}>
                  IMPORTANT: Verify Before Depositing
                </h3>
                <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, marginBottom: "0.75rem" }}>
                  {"If your profile does not show \"Referred by mandycalmdown\" you "}
                  <strong style={{ color: ACCENT }}>MUST</strong>
                  {" contact Thrill support before making any deposits or wagers. Otherwise you will not be under code "}
                  <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" style={{ color: ACCENT, fontWeight: 800, textDecoration: "none" }}>MANDY</a>
                  {" and will not be eligible for any rewards, cash drops, or leaderboard prizes."}
                </p>
                <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "rgba(255,255,255,0.65)" }}>
                  Contact support through the live chat option on the Thrill website.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "0 1rem 6rem", textAlign: "center" }}>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.5rem,4vw,2.8rem)", textTransform: "uppercase", marginBottom: "1rem" }}>Ready to Get Started?</h2>
          <p style={{ fontSize: "0.95rem", fontWeight: 500, color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
            Join the MANDY.GG community today!
          </p>
          <HoloButton href="https://thrill.com/?r=MANDY">
            Join with Code MANDY <ExternalLink style={{ width: "0.9rem", height: "0.9rem" }} />
          </HoloButton>
        </section>

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
                { label: "PRIVACY POLICY", href: "/privacy" },
                { label: "TERMS OF SERVICE", href: "/terms" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: "#000", textDecoration: "none" }}>{l.label}</Link>
              ))}
              <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", color: "#000", textDecoration: "none" }}>SUPPORT</a>
            </nav>

            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,0,0,0.6)", letterSpacing: "0.06em", marginTop: "1.5rem" }}>
              © 2026 MANDY.GG. ALL RIGHTS RESERVED. PLAY RESPONSIBLY. CRYPTOCURRENCY GAMBLING INVOLVES RISK. MUST BE 18+.
            </p>
          </div>
        </footer>

        <style>{`
        @media (min-width: 700px) {
          .htj-step { grid-template-columns: 1fr 1fr !important; }
          .htj-step--img-right .htj-text { order: 1 !important; }
          .htj-step--img-right .htj-img  { order: 2 !important; }
          .htj-step:not(.htj-step--img-right) .htj-text { order: 2 !important; }
          .htj-step:not(.htj-step--img-right) .htj-img  { order: 1 !important; }
        }
      `}</style>
      </div>
    </>
  )
}

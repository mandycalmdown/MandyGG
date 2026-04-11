import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"
import type { Metadata } from "next"
import "@/styles/mandy-home.css"

export const metadata: Metadata = {
  title: "Why Thrill Is Actually Different | Mandy.gg",
  description: "I've tried every casino that's slid into my DMs. Thrill is genuinely different. Here's what changed my mind.",
}

const HOLO_BG_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"
const ACCENT = "#3C7BFF"
const PAGE_BG = "#00020a"
const CARD_BG = "#080c14"

export default function BlogPostPage() {
  return (
    <>
      <SiteNavigation currentPage="blog" />
      <div className="mandy-home" style={{ minHeight: "100vh", background: PAGE_BG, color: "#fff", fontFamily: "var(--font-poppins), sans-serif" }}>

        {/* Back link */}
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem 0" }}>
          <Link href="/blog" style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textDecoration: "none", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            ← BACK TO GOSSIP
          </Link>
        </div>

        {/* Article header */}
        <article style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem 4rem" }}>
          <div style={{ marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.18em", color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: "4px", padding: "0.2rem 0.5rem", textTransform: "uppercase" }}>
              PLATFORM REVIEW
            </span>
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
              April 3, 2026 · 4 min read
            </span>
          </div>

          <h1 style={{ fontWeight: 900, fontSize: "clamp(1.6rem,5vw,2.8rem)", lineHeight: 1.15, letterSpacing: "0.01em", color: "#fff", marginBottom: "1.5rem" }}>
            Why Thrill Is Actually Different (And I Mean It This Time)
          </h1>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "2.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff94b4)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.85rem", color: "#fff", flexShrink: 0 }}>
              M
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: "0.78rem", color: "#fff", margin: 0 }}>Mandy</p>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", margin: 0, fontWeight: 600 }}>mandy.gg</p>
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
            <p style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.8, color: "rgba(255,255,255,0.85)" }}>
              Let me be upfront: I get approached by casinos constantly. Discord DMs, email pitches, the occasional very weird Instagram comment. Most of them are the same. Slow withdrawals dressed up in a flashy UI. Confusing bonus wagering requirements buried in 6-point font. A support team that ghosts you the moment you try to cash out more than $100.
            </p>

            <p style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.8, color: "rgba(255,255,255,0.85)" }}>
              I said yes to Thrill because a friend in the community vouched for it, not because their pitch was particularly compelling. I expected the usual disappointment. I did not get it.
            </p>

            {/* Pull quote */}
            <blockquote style={{ background: CARD_BG, borderLeft: `3px solid ${ACCENT}`, borderRadius: "0 12px 12px 0", padding: "1.25rem 1.5rem", margin: "0.5rem 0" }}>
              <p style={{ fontSize: "clamp(1rem,2.5vw,1.15rem)", fontWeight: 700, color: "#fff", lineHeight: 1.5, margin: 0 }}>
                &ldquo;The first time I tried to withdraw, I expected the usual three-day waiting game. Money was in my account in four hours.&rdquo;
              </p>
            </blockquote>

            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.4rem)", color: "#fff", letterSpacing: "0.02em", marginTop: "0.5rem" }}>
              The Withdrawal Test
            </h2>
            <p style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.8, color: "rgba(255,255,255,0.85)" }}>
              Every casino review I write starts with the same test: I deposit a small amount, play through it, and immediately try to withdraw. The withdrawal experience tells you everything about a casino&apos;s actual priorities. Thrill passed. Not just passed — it was one of the fastest I&apos;ve ever seen from a licensed platform. No surprise verification requests mid-process, no suspicious delays, no support tickets required.
            </p>

            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.4rem)", color: "#fff", letterSpacing: "0.02em" }}>
              The Weekly Race Is Actually Competitive
            </h2>
            <p style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.8, color: "rgba(255,255,255,0.85)" }}>
              Most casino leaderboards exist as a marketing gimmick. The top spots are locked by high-rollers and everyone else just watches. Thrill&apos;s $3500 weekly wager race has prize tiers that actually reach mid-level players. I&apos;ve seen community members cash out $80, $120, $200 from weeks where they just played their normal sessions. That matters.
            </p>

            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.4rem)", color: "#fff", letterSpacing: "0.02em" }}>
              What I Don&apos;t Like (Because I&apos;m Honest)
            </h2>
            <p style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.8, color: "rgba(255,255,255,0.85)" }}>
              The game selection could be broader. There are some providers I like that aren&apos;t on the platform yet. The mobile UI has a few rough edges — nothing that breaks the experience, but noticeable if you&apos;re playing mostly on your phone. I&apos;m told both are being worked on. I&apos;ll update this post when that changes.
            </p>

            <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.4rem)", color: "#fff", letterSpacing: "0.02em" }}>
              Bottom Line
            </h2>
            <p style={{ fontSize: "clamp(0.9rem,2vw,1rem)", lineHeight: 1.8, color: "rgba(255,255,255,0.85)" }}>
              I would not put my code on something I don&apos;t believe in. I&apos;ve turned down more casinos than I&apos;ve worked with. Thrill earns its spot. If you&apos;re going to play, play somewhere that actually takes care of you. Use code <strong style={{ color: ACCENT }}>MANDY</strong> when you sign up.
            </p>
          </div>

          {/* CTA */}
          <div style={{ marginTop: "3rem", padding: "2rem", background: CARD_BG, border: `1px solid rgba(60,123,255,0.2)`, borderRadius: "16px", textAlign: "center" }}>
            <p style={{ fontWeight: 900, fontSize: "clamp(1rem,3vw,1.3rem)", color: "#fff", marginBottom: "0.5rem" }}>Ready to try it?</p>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
              Sign up with code <strong style={{ color: ACCENT }}>MANDY</strong> to get under my referral and be eligible for all weekly rewards.
            </p>
            <a
              href="https://thrill.com/?r=MANDY"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block", padding: "0.75rem 2rem", background: ACCENT,
                color: "#fff", fontWeight: 900, fontSize: "0.78rem", letterSpacing: "0.12em",
                textTransform: "uppercase", borderRadius: "8px", textDecoration: "none",
                transition: "opacity 0.2s ease",
              }}
            >
              JOIN THRILL — CODE: MANDY
            </a>
          </div>

          {/* Back nav */}
          <div style={{ marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Link href="/blog" style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", textDecoration: "none", textTransform: "uppercase" }}>
              ← ALL POSTS
            </Link>
          </div>
        </article>

        {/* Footer */}
        <footer style={{ position: "relative", overflow: "hidden", paddingTop: "3rem", paddingBottom: "2rem" }}>
          <video autoPlay loop muted playsInline aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}>
            <source src={HOLO_BG_MP4} type="video/mp4" />
          </video>
          <div style={{ position: "relative", zIndex: 1, maxWidth: "900px", margin: "0 auto", padding: "0 1rem", textAlign: "center" }}>
            <p style={{ fontWeight: 900, fontSize: "clamp(2.5rem,10vw,5rem)", color: "#000", letterSpacing: "-0.01em", marginBottom: "0.25rem" }}>MANDY.GG</p>
            <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.15em", color: "#000", marginBottom: "1.5rem" }}>YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
            <div style={{ marginTop: "2rem", borderTop: "2px solid rgba(0,0,0,0.45)", paddingTop: "1.25rem" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#000", letterSpacing: "0.06em" }}>© 2025 MANDY.GG. ALL RIGHTS RESERVED.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

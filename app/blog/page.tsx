import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"
import type { Metadata } from "next"
import "@/styles/mandy-home.css"

export const metadata: Metadata = {
  title: "Gambling Gossip | Mandy.gg",
  description: "Casino drama, gambling takes, Thrill news, and the unfiltered truth — straight from Mandy.",
}

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"
const HOLO_BG_MP4   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"

const POSTS = [
  {
    slug: "why-thrill-is-different",
    tag: "PLATFORM REVIEW",
    title: "Why Thrill Is Actually Different (And I Mean It This Time)",
    excerpt: "I've tried every casino that's slid into my DMs. Most of them are the same repackaged garbage. Thrill is not. Here's what changed my mind.",
    date: "April 3, 2026",
    readTime: "4 min",
    accent: "#3C7BFF",
  },
  {
    slug: "casino-red-flags",
    tag: "ADVICE",
    title: "7 Red Flags That Tell You to Leave a Casino Immediately",
    excerpt: "Slow withdrawals. Confusing bonus terms. Sketchy support. I've been burned so you don't have to be. Know these signs before you deposit.",
    date: "March 28, 2026",
    readTime: "5 min",
    accent: "#ff94b4",
  },
  {
    slug: "leaderboard-strategy",
    tag: "STRATEGY",
    title: "How to Actually Compete in the Weekly Leaderboard",
    excerpt: "Spoiler: it's not about betting big. It's about betting smart. Here's how I think about wager races and why most people approach them wrong.",
    date: "March 21, 2026",
    readTime: "6 min",
    accent: "#3C7BFF",
  },
  {
    slug: "girl-who-gambles",
    tag: "PERSONAL",
    title: "Yeah, I'm a Girl and I Gamble. Get Over It.",
    excerpt: "The comments, the DMs, the \"does your boyfriend know?\" messages. I'm tired of explaining myself. Here's the last time I will.",
    date: "March 14, 2026",
    readTime: "3 min",
    accent: "#ff94b4",
  },
]

export default function BlogPage() {
  return (
    <>
      <SiteNavigation currentPage="blog" />
      <div className="mandy-home" style={{ minHeight: "100vh", background: "#00020a", color: "#fff", fontFamily: "var(--font-poppins), sans-serif" }}>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "4rem 1rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
          <div className="holo-mask" style={{ marginBottom: "1rem" }}>
            <h1 className="holo-mask__letters" style={{
              fontSize: "clamp(2.5rem, 9vw, 5rem)",
              fontFamily: "Poppins, var(--font-poppins), sans-serif",
              fontWeight: 900,
              letterSpacing: "0.02em",
            }}>
              GAMBLING GOSSIP
            </h1>
            <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
              <source src={HOLO_TEXT_SRC} type="video/mp4" />
            </video>
            <span className="holo-sheen" aria-hidden="true" />
          </div>
          <p style={{ fontSize: "clamp(0.75rem,2vw,0.9rem)", fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>
            Casino takes. No filter. Always honest.
          </p>
        </section>

        {/* Posts grid */}
        <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 1rem 4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 400px), 1fr))", gap: "1.25rem" }}>
            {POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <article style={{
                  background: "#080c14",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  transition: "border-color 0.2s ease, transform 0.2s ease",
                  cursor: "pointer",
                  height: "100%",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.85rem" }}>
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 900, letterSpacing: "0.18em",
                      color: post.accent, textTransform: "uppercase",
                      border: `1px solid ${post.accent}`, borderRadius: "4px",
                      padding: "0.2rem 0.5rem",
                    }}>
                      {post.tag}
                    </span>
                    <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
                      {post.date} · {post.readTime} read
                    </span>
                  </div>
                  <h2 style={{
                    fontWeight: 800, fontSize: "clamp(1rem,2.5vw,1.2rem)",
                    color: "#fff", lineHeight: 1.3, marginBottom: "0.65rem",
                    letterSpacing: "0.01em",
                  }}>
                    {post.title}
                  </h2>
                  <p style={{
                    fontSize: "0.78rem", color: "rgba(255,255,255,0.6)",
                    lineHeight: 1.65, margin: 0,
                  }}>
                    {post.excerpt}
                  </p>
                  <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.65rem", fontWeight: 800, color: post.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      READ MORE
                    </span>
                    <span style={{ color: post.accent, fontSize: "0.75rem" }}>→</span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

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

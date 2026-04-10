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

const PLACEHOLDER_IMG = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blogheader_placeholder-uB5MnjFpMp744NAGPoPiz9bVmUlMsa.webp"

const POSTS = [
  {
    slug: "post-one",
    tag: "CASINO REVIEW",
    title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
    excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.",
    date: "April 2026",
    readTime: "4 min",
    accent: "#3C7BFF",
    img: PLACEHOLDER_IMG,
  },
  {
    slug: "post-two",
    tag: "STRATEGY",
    title: "Ut enim ad minim veniam quis nostrud exercitation ullamco",
    excerpt: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    date: "April 2026",
    readTime: "5 min",
    accent: "#a855f7",
    img: PLACEHOLDER_IMG,
  },
  {
    slug: "post-three",
    tag: "ADVICE",
    title: "Duis aute irure dolor in reprehenderit in voluptate velit",
    excerpt: "Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    date: "March 2026",
    readTime: "6 min",
    accent: "#ff94b4",
    img: PLACEHOLDER_IMG,
  },
  {
    slug: "post-four",
    tag: "PERSONAL",
    title: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur",
    excerpt: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
    date: "March 2026",
    readTime: "3 min",
    accent: "#4ade80",
    img: PLACEHOLDER_IMG,
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
                <article
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${post.accent}55`
                    e.currentTarget.style.boxShadow = `0 8px 32px ${post.accent}18`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div style={{ height: "160px", overflow: "hidden", flexShrink: 0 }}>
                    <img
                      src={post.img}
                      alt=""
                      aria-hidden="true"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
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
                      fontWeight: 800, fontSize: "clamp(1rem,2.5vw,1.15rem)",
                      color: "#fff", lineHeight: 1.3, marginBottom: "0.65rem",
                      letterSpacing: "0.01em",
                    }}>
                      {post.title}
                    </h2>
                    <p style={{
                      fontSize: "0.78rem", color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.65, margin: 0, flex: 1,
                    }}>
                      {post.excerpt}
                    </p>
                    <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <span style={{ fontSize: "0.65rem", fontWeight: 800, color: post.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        READ MORE
                      </span>
                      <span style={{ color: post.accent, fontSize: "0.75rem" }}>→</span>
                    </div>
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
              <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#000", letterSpacing: "0.06em" }}>© 2026 MANDY.GG. ALL RIGHTS RESERVED.</p>
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

"use client"

import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import "@/styles/mandy-home.css"

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4"

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
      <div className="mandy-home" style={{ minHeight: "100vh", background: "#000000", color: "#fff", fontFamily: "var(--font-poppins), sans-serif" }}>

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
                  className="blog-holo-card"
                  style={{
                    background: "#010101",
                    border: "0.5px solid rgba(255,255,255,0.5)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.3s ease, border-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.animation = "holoGlowCycle 3s linear infinite, holoBorderCycle 3s linear infinite"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.animation = "none"
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"
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

        <SiteFooter />
      </div>
    </>
  )
}

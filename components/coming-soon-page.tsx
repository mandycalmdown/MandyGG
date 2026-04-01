"use client"

import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"

const HOLO_BG_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-KuTV174iSOVIJGQHzXHDyVA96RnXCn.webp"
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"

interface ComingSoonPageProps {
  currentPage?: string
}

export function ComingSoonPage({ currentPage }: ComingSoonPageProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#000000", position: "relative" }}>
      {/* Fixed holographic background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }} aria-hidden="true">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-mobile-ZwOFt65iGL74bPv4mX15f9MezlKFZP.webp"
          />
          <img
            src={HOLO_BG_WEBM}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </picture>
      </div>

      <div style={{ position: "relative", zIndex: 10 }}>
        <SiteNavigation currentPage={currentPage} />

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 140px)",
          padding: "2rem 1rem",
        }}>
          <div style={{
            background: "#080b10",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px",
            padding: "3rem 2.5rem",
            maxWidth: "560px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.8), 0 0 0 1px rgba(181,220,88,0.07)",
          }}>
            <h1 style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.2rem, 8vw, 3.5rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.75rem",
              lineHeight: 1.1,
            }}>
              COMING SOON
            </h1>
            <p style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "#b5dc58",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.5rem",
            }}>
              SORRY, I HAVE ADHD.
            </p>
            <p style={{
              fontFamily: "var(--font-poppins), Poppins, sans-serif",
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "2.5rem",
              letterSpacing: "0.03em",
            }}>
              Something exciting is being built. Check back soon.
            </p>

            <Link href="/" style={{ textDecoration: "none", display: "block" }}>
              <div style={{ position: "relative", overflow: "hidden", borderRadius: "8px", cursor: "pointer", display: "inline-block", width: "100%", maxWidth: "240px" }}>
                <video autoPlay loop muted playsInline aria-hidden="true"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", zIndex: 0 }}>
                  <source src={HOLO_BTN_WEBM} type="video/webm" />
                  <source src={HOLO_BTN_MP4} type="video/mp4" />
                </video>
                <span style={{
                  position: "relative",
                  zIndex: 1,
                  display: "block",
                  padding: "0.85rem 2rem",
                  fontFamily: "var(--font-poppins), Poppins, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#000000",
                }}>
                  HOME
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

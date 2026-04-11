"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"
const HOLO_BG_MP4   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"

function HoloButton({ type = "button", disabled = false, children }: {
  type?: "button" | "submit"
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "8px",
        border: "none",
        padding: "0.85rem 1.6rem",
        width: "100%",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--font-poppins), Poppins, sans-serif",
        fontWeight: 800,
        fontSize: "0.85rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#000000",
        opacity: disabled ? 0.6 : 1,
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)" }}
    >
      <video autoPlay loop muted playsInline aria-hidden="true"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", zIndex: 0 }}>
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4} type="video/mp4" />
      </video>
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </button>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative" }}>
      {/* Holo background video */}
      <video autoPlay loop muted playsInline aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.18, pointerEvents: "none" }}>
        <source src={HOLO_BG_MP4} type="video/mp4" />
      </video>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/" style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2rem, 8vw, 2.8rem)",
            color: "#3C7BFF",
            textDecoration: "none",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}>MANDY.GG</a>
        </div>

        {/* Card */}
        <div style={{
          background: "#010101",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(60,123,255,0.12)",
        }}>
          <h1 style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 900,
            fontSize: "1.5rem",
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.35rem",
          }}>DEGEN DASHBOARD</h1>
          <p style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "0.8rem",
            color: "#3C7BFF",
            marginBottom: "2rem",
            letterSpacing: "0.04em",
          }}>Sign in to access your stats and rewards</p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <Label htmlFor="email" style={{ color: "#ffffff", fontFamily: "var(--font-poppins), sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontFamily: "var(--font-poppins), sans-serif",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <Label htmlFor="password" style={{ color: "#ffffff", fontFamily: "var(--font-poppins), sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  background: "#0d1117",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#ffffff",
                  fontFamily: "var(--font-poppins), sans-serif",
                  padding: "0.75rem 1rem",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {error && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: "8px" }}>
                <p style={{ color: "#ff5050", fontSize: "0.82rem", fontFamily: "var(--font-poppins), sans-serif", margin: 0 }}>{error}</p>
              </div>
            )}

            <HoloButton type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </HoloButton>

            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#ffffff", fontFamily: "var(--font-poppins), sans-serif", margin: 0 }}>
              {"Don't have an account? "}
              <Link href="/auth/sign-up" style={{ color: "#5ac3ff", fontWeight: 700, textDecoration: "none" }}>
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

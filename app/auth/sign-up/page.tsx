"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm"
const HOLO_BTN_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4"
const HOLO_BG_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"

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
        transition: "transform 0.12s ease",
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

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: { display_name: displayName },
        },
      })
      if (error) throw error

      await fetch("/api/subscribe-mailing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "signup" }),
      }).catch(err => console.error("[v0] Failed to add to mailing list:", err))

      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#0d1117",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "8px",
    color: "#ffffff",
    fontFamily: "var(--font-poppins), sans-serif",
    padding: "0.75rem 1rem",
    fontSize: "0.9rem",
  }

  const labelStyle: React.CSSProperties = {
    color: "#ffffff",
    fontFamily: "var(--font-poppins), sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "0.5rem",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative" }}>
      {/* Holo background video */}
      <video autoPlay loop muted playsInline aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.18, pointerEvents: "none" }}>
        <source src={HOLO_BG_MP4} type="video/mp4" />
      </video>

      <div style={{ width: "100%", maxWidth: "440px", position: "relative", zIndex: 10 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <a href="/" style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2rem, 8vw, 2.8rem)",
            color: "#3e6bf7",
            textDecoration: "none",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}>MANDY.GG</a>
        </div>

        {/* Card */}
        <div style={{
          background: "#080b10",
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
          }}>CREATE ACCOUNT</h1>
          <p style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "0.8rem",
            color: "#3e6bf7",
            marginBottom: "2rem",
            letterSpacing: "0.04em",
          }}>Track your Thrill stats and compete on the leaderboard</p>

          <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <div>
              <Label htmlFor="displayName" style={labelStyle}>Display Name</Label>
              <Input id="displayName" type="text" placeholder="Your name" required value={displayName}
                onChange={e => setDisplayName(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <Label htmlFor="email" style={labelStyle}>Email</Label>
              <Input id="email" type="email" placeholder="your@email.com" required value={email}
                onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <Label htmlFor="password" style={labelStyle}>Password</Label>
              <Input id="password" type="password" required value={password}
                onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <Label htmlFor="repeatPassword" style={labelStyle}>Confirm Password</Label>
              <Input id="repeatPassword" type="password" required value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)} style={inputStyle} />
            </div>

            {error && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.25)", borderRadius: "8px" }}>
                <p style={{ color: "#ff5050", fontSize: "0.82rem", fontFamily: "var(--font-poppins), sans-serif", margin: 0 }}>{error}</p>
              </div>
            )}

            <HoloButton type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </HoloButton>

            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#ffffff", fontFamily: "var(--font-poppins), sans-serif", margin: 0 }}>
              Already have an account?{" "}
              <Link href="/auth/login" style={{ color: "#5ac3ff", fontWeight: 700, textDecoration: "none" }}>
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

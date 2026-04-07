import Link from "next/link"

const HOLO_BG_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4"

export default function SignUpSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#000000", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", position: "relative" }}>
      <video autoPlay loop muted playsInline aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0, opacity: 0.18, pointerEvents: "none" }}>
        <source src={HOLO_BG_MP4} type="video/mp4" />
      </video>

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
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

        <div style={{
          background: "#080b10",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "16px",
          padding: "2.5rem 2rem",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(60,123,255,0.12)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem", lineHeight: 1 }}>
            <span style={{ color: "#3C7BFF", fontFamily: "var(--font-poppins), sans-serif", fontWeight: 900 }}>&#10003;</span>
          </div>
          <h1 style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 900,
            fontSize: "1.5rem",
            color: "#ffffff",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.5rem",
          }}>CHECK YOUR EMAIL</h1>
          <p style={{
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontSize: "0.8rem",
            color: "#3C7BFF",
            marginBottom: "1.5rem",
            letterSpacing: "0.04em",
          }}>{"We've sent you a confirmation link"}</p>
          <p style={{ color: "#ffffff", fontFamily: "var(--font-poppins), sans-serif", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            Thank you for signing up! Please check your email and click the confirmation link to activate your account.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-poppins), sans-serif", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: "2rem" }}>
            {"Once confirmed, you'll be able to log in and access your personal dashboard."}
          </p>
          <Link href="/auth/login" style={{
            display: "block",
            background: "#3C7BFF",
            color: "#000000",
            borderRadius: "8px",
            padding: "0.85rem 1.6rem",
            fontFamily: "var(--font-poppins), Poppins, sans-serif",
            fontWeight: 800,
            fontSize: "0.85rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            textAlign: "center",
          }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

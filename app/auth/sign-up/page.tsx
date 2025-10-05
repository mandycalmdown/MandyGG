"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error

      await fetch("/api/subscribe-mailing-list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, source: "signup" }),
      }).catch((err) => console.error("[v0] Failed to add to mailing list:", err))

      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 90% 90%, rgba(0, 255, 159, ${0.1 + scrollY * 0.0002}) 0%, transparent 40%),
            radial-gradient(circle at 30% 70%, rgba(0, 255, 159, ${0.08 + scrollY * 0.0001}) 0%, transparent 30%),
            radial-gradient(circle at 70% 30%, rgba(0, 255, 159, ${0.06 + scrollY * 0.0001}) 0%, transparent 35%)
          `,
          transition: "background 0.3s ease",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <Card
          className="border border-white/30 rounded-xl shadow-lg backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(10, 10, 10, 0.95)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
          }}
        >
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-teal-500 uppercase">CREATE YOUR ACCOUNT</CardTitle>
            <CardDescription className="text-gray-400">
              Sign up to track your Thrill stats and compete on the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repeatPassword" className="text-gray-300">
                  Confirm Password
                </Label>
                <Input
                  id="repeatPassword"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="bg-[#1a1a1a] border-[#333] text-white"
                />
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#5cfec0] text-black hover:bg-[#4de8ad] font-bold"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-[#5cfec0] hover:underline font-semibold">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

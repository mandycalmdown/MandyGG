"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface SiteNavigationProps {
  currentPage?: string
}

export function SiteNavigation({ currentPage }: SiteNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navLinks = [
    { href: "/", label: "HOME", page: "home" },
    { href: "/how-to-join", label: "HOW TO", page: "how-to-join" },
    { href: "/rewards", label: "REWARDS", page: "rewards" },
    { href: "/leaderboard", label: "LEADERBOARD", page: "leaderboard" },
    { href: "/#faq", label: "FAQ", page: "faq" },
    { href: "/dashboard", label: "DASHBOARD", page: "dashboard" },
  ]

  return (
    <nav className="w-full bg-[#000000] sticky top-0 z-50 border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-logo-small-REJQ74xYMktKwzxz1LsyZINIDXNKJs.webp"
              alt="Mandy.gg logo"
              width={120}
              height={48}
              className="h-10 md:h-12 w-auto"
            />
          </Link>

          {/* Center: Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                href={link.href}
                className={`text-sm uppercase tracking-wider transition-colors ${
                  currentPage === link.page
                    ? "text-[#CCFF00]"
                    : "text-[#FFFFFF] hover:text-[#CCFF00]"
                }`}
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth Button (Desktop) */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <Button
                onClick={handleSignOut}
                className="bg-transparent border-2 border-[#CCFF00] text-[#FFFFFF] hover:bg-[#CCFF00] hover:text-[#000000] rounded transition-all duration-300 uppercase text-sm px-6 py-2"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                SIGN OUT
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button
                  className="bg-[#CCFF00] text-[#000000] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] rounded transition-all duration-300 uppercase text-sm px-6 py-2"
                  style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                >
                  LOGIN
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#CCFF00] p-2 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <div className="flex flex-col gap-1.5">
                <div className={`w-6 h-0.5 bg-[#CCFF00] transition-transform ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
                <div className={`w-6 h-0.5 bg-[#CCFF00] transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
                <div className={`w-6 h-0.5 bg-[#CCFF00] transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t border-[#333]">
            <div className="flex flex-col pt-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  href={link.href}
                  className={`py-3 px-2 text-sm uppercase tracking-wider transition-colors ${
                    currentPage === link.page
                      ? "text-[#CCFF00]"
                      : "text-[#FFFFFF] hover:text-[#CCFF00]"
                  }`}
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-[#333]">
                {user ? (
                  <Button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="w-full bg-transparent border-2 border-[#CCFF00] text-[#FFFFFF] hover:bg-[#CCFF00] hover:text-[#000000] rounded uppercase text-sm"
                    style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                  >
                    SIGN OUT
                  </Button>
                ) : (
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      className="w-full bg-[#CCFF00] text-[#000000] hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] rounded uppercase text-sm"
                      style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                    >
                      LOGIN
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

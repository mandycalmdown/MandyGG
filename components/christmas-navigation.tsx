"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface ChristmasNavigationProps {
  currentPage?: string
}

export function ChristmasNavigation({ currentPage }: ChristmasNavigationProps) {
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
    { href: "/how-to-join", label: "HOW TO JOIN", page: "how-to-join" },
    { href: "/rewards", label: "REWARDS", page: "rewards" },
    { href: "/leaderboard", label: "LEADERBOARD", page: "leaderboard" },
    { href: "/#faq", label: "FAQ", page: "faq" },
  ]

  return (
    <nav className="mx-2 md:mx-4 mt-2 md:mt-4 mb-2">
      <Card
        className="px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]"
        style={{
          backgroundColor: "rgba(10, 8, 5, 0.95)",
          borderColor: "rgba(255, 200, 100, 0.25)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 200, 100, 0.08)",
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/images/goldmandy.svg"
                alt="MandyGG"
                width={180}
                height={60}
                className="hidden md:block h-10 md:h-14 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
            <Link href="/">
              <Image
                src="/images/goldmandy.svg"
                alt="MandyGG"
                width={100}
                height={40}
                className="md:hidden h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-4 xl:space-x-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.page}
                href={link.href}
                className={`${
                  currentPage === link.page ? "text-amber-300" : "text-white/80 hover:text-amber-300"
                } transition-colors font-bold uppercase text-lg xl:text-xl`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                href="/dashboard"
                className={`${
                  currentPage === "dashboard" ? "text-amber-400" : "text-amber-400/80 hover:text-amber-300"
                } transition-colors font-bold uppercase text-lg xl:text-xl`}
              >
                DASHBOARD
              </Link>
            )}

            {user ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-amber-400/50 text-amber-300 hover:bg-amber-400/20 hover:text-amber-200 font-bold rounded-xl transition-all duration-300 uppercase text-lg xl:text-xl px-4 py-2 bg-transparent"
              >
                SIGN OUT
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="default"
                  size="sm"
                  className="font-bold rounded-xl transition-all duration-300 hover:scale-105 uppercase text-lg xl:text-xl px-4 py-2"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
                    color: "#1a1a1a",
                  }}
                >
                  SIGN IN
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:bg-white/10 p-2"
              aria-label="Toggle mobile menu"
            >
              <div className="flex flex-col space-y-1">
                <div className="w-5 h-0.5 bg-amber-300/80"></div>
                <div className="w-5 h-0.5 bg-amber-300/80"></div>
                <div className="w-5 h-0.5 bg-amber-300/80"></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 p-3 border-t border-amber-400/20">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  href={link.href}
                  className={`${
                    currentPage === link.page ? "text-amber-300" : "text-white/80 hover:text-amber-300"
                  } transition-colors font-bold uppercase text-lg py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {user && (
                <Link
                  href="/dashboard"
                  className={`${
                    currentPage === "dashboard" ? "text-amber-400" : "text-amber-400/80 hover:text-amber-300"
                  } transition-colors font-bold uppercase text-lg py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              )}

              {user ? (
                <Button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-amber-400/50 text-amber-300 hover:bg-amber-400/20 font-bold rounded-xl w-full uppercase text-lg mt-2 bg-transparent"
                >
                  SIGN OUT
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="default"
                    size="sm"
                    className="font-bold rounded-xl w-full uppercase text-lg mt-2"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #B8860B 100%)",
                      color: "#1a1a1a",
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    SIGN IN
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </nav>
  )
}

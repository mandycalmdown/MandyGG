"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
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
    { href: "/how-to-join", label: "HOW TO JOIN", page: "how-to-join" },
    { href: "/rewards", label: "REWARDS", page: "rewards" },
    { href: "/leaderboard", label: "LEADERBOARD", page: "leaderboard" },
    { href: "/#faq", label: "FAQ", page: "faq" },
  ]

  return (
    <nav className="mx-2 md:mx-4 mt-2 md:mt-4 mb-2">
      <Card
        className="px-3 py-2 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/30 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02]"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          boxShadow:
            "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/images/mandygg_menu_logo.svg"
                alt="MandyGG - Premier Crypto Casino Leaderboard & Rewards"
                width={250}
                height={80}
                className="hidden md:block h-12 md:h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
            <Link href="/">
              <Image
                src="/images/mandygg_m_logo.svg"
                alt="MandyGG"
                width={60}
                height={60}
                className="md:hidden h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity"
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
                  currentPage === link.page ? "text-teal-500" : "text-white hover:text-teal-500"
                } transition-colors font-bold uppercase text-lg xl:text-xl`}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <Link
                href="/dashboard"
                className={`${
                  currentPage === "dashboard" ? "text-indigo-400" : "text-indigo-400 hover:text-indigo-300"
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
                className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-black font-bold rounded-xl transition-all duration-300 uppercase text-lg xl:text-xl px-4 py-2 bg-transparent"
              >
                SIGN OUT
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/30 uppercase text-lg xl:text-xl px-4 py-2"
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
              className="text-white hover:bg-white/20 p-2"
              aria-label="Toggle mobile menu"
            >
              <div className="flex flex-col space-y-1">
                <div className="w-5 h-0.5 bg-white"></div>
                <div className="w-5 h-0.5 bg-white"></div>
                <div className="w-5 h-0.5 bg-white"></div>
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-3 p-3 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.page}
                  href={link.href}
                  className={`${
                    currentPage === link.page ? "text-teal-500" : "text-white hover:text-teal-500"
                  } transition-colors font-bold uppercase text-lg py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dashboard Link Mobile - only show if logged in */}
              {user && (
                <Link
                  href="/dashboard"
                  className={`${
                    currentPage === "dashboard" ? "text-indigo-400" : "text-indigo-400 hover:text-indigo-300"
                  } transition-colors font-bold uppercase text-lg py-2`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              )}

              {/* Sign In/Out Button Mobile */}
              {user ? (
                <Button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-black font-bold rounded-xl w-full uppercase text-lg mt-2 bg-transparent"
                >
                  SIGN OUT
                </Button>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-teal-500 hover:bg-teal-400 text-black font-bold rounded-xl w-full uppercase text-lg mt-2"
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

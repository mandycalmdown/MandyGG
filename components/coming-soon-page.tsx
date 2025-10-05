"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"

export function ComingSoonPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black font-sans">
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

      <div className="relative z-10">
        <SiteNavigation currentPage="tutorials" />

        <div className="flex items-center justify-center min-h-[calc(100vh-140px)] px-4">
          <Card
            className="p-6 md:p-8 lg:p-12 text-center rounded-xl md:rounded-2xl border border-white/30 max-w-2xl w-full transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 uppercase tracking-wide">
              COMING SOON
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-6 md:mb-8 leading-relaxed">
              SORRY I HAVE ADHD
            </p>

            <Link href="/">
              <Button
                size="lg"
                className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/30 uppercase text-lg md:text-xl w-full sm:w-auto"
              >
                HOME
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { SiteNavigation } from "@/components/site-navigation"

export function RewardsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black font-sans">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 90% 90%, rgba(0, 255, 159, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 30% 70%, rgba(0, 255, 159, 0.08) 0%, transparent 30%),
            radial-gradient(circle at 70% 30%, rgba(0, 255, 159, 0.06) 0%, transparent 35%)
          `,
        }}
      />

      <div className="relative z-10">
        <SiteNavigation currentPage="rewards" />

        {/* Banner section */}
        <section className="relative w-full mb-2">
          <div className="w-full max-w-6xl mx-auto relative px-2 md:px-0">
            {/* Desktop Banner */}
            <Image
              src="/images/rewards-banner-desktop-new.webp"
              alt="Mandy Rewards - Thrill Casino Bonuses"
              width={1200}
              height={300}
              className="hidden md:block w-full h-auto max-h-[40vh] lg:max-h-[50vh] object-contain"
              priority
            />
            {/* Mobile Banner */}
            <Image
              src="/images/rewards-banner-mobile-new.webp"
              alt="Mobile Rewards - Thrill Casino Bonuses"
              width={400}
              height={400}
              className="md:hidden w-full h-auto max-w-sm mx-auto object-contain rounded-lg"
              priority
            />
          </div>
        </section>

        {/* Main Content - Coming Soon */}
        <main className="relative z-10 px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Card
              className="p-8 md:p-12 text-center border border-white/30"
              style={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                boxShadow: "0 10px 40px rgba(0, 255, 159, 0.15), 0 0 60px rgba(99, 102, 241, 0.1)",
              }}
            >
              <h1 className="text-3xl md:text-5xl font-black text-white mb-4 uppercase tracking-wide">REWARDS</h1>
              <p className="text-xl md:text-2xl text-primary font-bold mb-6">COMING SOON</p>
              <p className="text-gray-300 text-base md:text-lg mb-2">Sorry, I have ADHD.</p>
              <p className="text-gray-400 text-sm md:text-base">Exciting rewards are on the way. Stay tuned!</p>
            </Card>
          </div>
        </main>

        <footer className="px-4 mt-6 md:mt-8 pb-4">
          <Card
            className="max-w-6xl mx-auto p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/30 transition-all duration-300 hover:scale-[1.01] md:py-[23px] my-[11px]"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
            }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Image
                  src="/images/mandy-logo-menu-icon-white.svg"
                  alt="Mandy.gg + Thrill Casino - Premier Crypto Casino Partnership"
                  width={500}
                  height={200}
                  className="h-16 md:h-20 w-auto"
                />
              </div>
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-sm md:text-lg text-gray-200 mb-3 md:mb-4">
                <Link href="/privacy" className="hover:text-primary transition-colors uppercase">
                  PRIVACY POLICY
                </Link>
                <Link href="/terms" className="hover:text-primary transition-colors uppercase">
                  TERMS OF SERVICE
                </Link>
                <Link
                  href="https://t.me/mandysupport_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors uppercase"
                >
                  SUPPORT
                </Link>
              </div>
              <p className="text-sm md:text-base text-gray-300 mb-2 uppercase leading-relaxed">
                © 2025 MANDY.GG. ALL RIGHTS RESERVED.
              </p>
              <p className="text-sm md:text-base text-gray-300 uppercase leading-relaxed">
                PLAY RESPONSIBLY. CRYPTOCURRENCY GAMBLING INVOLVES RISK. MUST BE 18+ TO PARTICIPATE.
              </p>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  )
}

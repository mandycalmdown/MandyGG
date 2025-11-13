"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { SiteNavigation } from "@/components/site-navigation"

export function RewardsPage() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const tierBonuses = [
    { tier: "SPARK", level: "I", reward: 0 },
    { tier: "CHARGE", level: "I", reward: 5 },
    { tier: "CHARGE", level: "II", reward: 2 },
    { tier: "CHARGE", level: "III", reward: 5 },
    { tier: "PULSE", level: "I", reward: 26 },
    { tier: "PULSE", level: "II", reward: 15 },
    { tier: "PULSE", level: "III", reward: 30 },
    { tier: "SURGE", level: "I", reward: 210 },
    { tier: "SURGE", level: "II", reward: 120 },
    { tier: "SURGE", level: "III", reward: 210 },
    { tier: "IGNITE", level: "I", reward: 1560 },
    { tier: "IGNITE", level: "II", reward: 600 },
    { tier: "IGNITE", level: "III", reward: 1500 },
    { tier: "IGNITE", level: "IV", reward: 3000 },
    { tier: "RUSH", level: "I", reward: 22200 },
    { tier: "RUSH", level: "II", reward: 9000 },
    { tier: "RUSH", level: "III", reward: 9000 },
    { tier: "RUSH", level: "IV", reward: 12000 },
    { tier: "BLAZE", level: "I", reward: 96000 },
    { tier: "BLAZE", level: "II", reward: 30000 },
    { tier: "BLAZE", level: "III", reward: 90000 },
    { tier: "BLAZE", level: "IV", reward: 180000 },
    { tier: "APEX", level: "I", reward: 1080000 },
  ]

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

        {/* Updated banner section */}
        <section className="relative w-full mb-2">
          <div className="w-full max-w-6xl mx-auto relative px-2 md:px-0">
            {/* Desktop Banner */}
            <Image
              src="/images/rewards-banner-desktop-new.webp"
              alt="Mandy Rewards - Thrill Casino Double Level Up Bonuses"
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

        {/* Main Content */}
        <main className="relative z-10 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase tracking-wide">
                THRILL REWARDS
              </h1>
              <p className="text-lg md:text-xl text-primary font-bold mb-1">DOUBLE LEVEL UP BONUSES</p>
              <p className="text-gray-300 text-base md:text-lg">
                Climb the tiers and 2X your bonuses just by using code MANDY
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
              {tierBonuses.map((bonus, index) => (
                <Card
                  key={index}
                  className={`relative overflow-hidden transition-all duration-300 ${
                    hoveredCard === index ? "transform scale-105" : ""
                  }`}
                  style={{
                    background: `
                      rgba(10, 10, 10, 0.95),
                      ${
                        hoveredCard === index
                          ? `radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%),
                           radial-gradient(circle at center, rgba(0, 255, 159, 0.1) 0%, transparent 70%)`
                          : index % 2 === 0
                            ? `radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)`
                            : `radial-gradient(circle at center, rgba(0, 255, 159, 0.1) 0%, transparent 70%)`
                      }
                    `,
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow:
                      hoveredCard === index
                        ? "0 20px 40px rgba(99, 102, 241, 0.3), 0 0 60px rgba(0, 255, 159, 0.2)"
                        : index % 2 === 0
                          ? "0 10px 30px rgba(99, 102, 241, 0.2)"
                          : "0 10px 30px rgba(0, 255, 159, 0.2)",
                  }}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="p-2 md:p-3 text-center">
                    <div className="mb-2">
                      <h3 className="font-black text-white uppercase tracking-wider text-sm md:text-base">
                        {bonus.tier} {bonus.level}
                      </h3>
                    </div>

                    <div className="mb-1">
                      <div className="text-lg md:text-xl font-black text-white">
                        {bonus.reward === 0 ? "START" : `$${bonus.reward.toLocaleString()}`}
                      </div>
                      {bonus.reward > 0 && (
                        <div className="text-xs text-indigo-400 font-bold md:text-sm">
                          + ${bonus.reward.toLocaleString()} FROM MANDY
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-8">
              <Card className="bg-black/95 border border-white/30 p-4 max-w-2xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase leading-tight">
                  READY TO PLAY?
                </h2>
                <p className="text-gray-300 text-base md:text-lg leading-snug mb-4">
                  Use code <span className="font-bold text-indigo-400">MANDY</span> at Thrill!
                </p>
                <Link href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-lg uppercase tracking-wide transition-all duration-300 hover:scale-105">
                    LET'S GO!
                  </Button>
                </Link>
              </Card>
            </div>
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
                © 2024 MANDY.GG. ALL RIGHTS RESERVED.
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

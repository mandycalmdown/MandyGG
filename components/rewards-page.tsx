"use client"

import Link from "next/link"
import Image from "next/image"
import { SiteNavigation } from "@/components/site-navigation"
import { AnnouncementsTicker } from "@/components/announcements-ticker"
import MailingListForm from "@/components/MailingListForm"

export function RewardsPage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Ticker 1 */}
      <AnnouncementsTicker tickerKey="ticker_1_text" />

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
            className="md:hidden w-full h-auto max-w-sm mx-auto object-contain rounded"
            priority
          />
        </div>
      </section>

      {/* Main Content - Coming Soon */}
      <main className="relative z-10 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div
            className="bg-[#050505] rounded border-2 border-[#A538FF] p-8 md:p-12 text-center"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(165,56,255,0.3)" }}
          >
            <h1
              className="text-3xl md:text-5xl text-[#FFFFFF] mb-4 uppercase tracking-wide"
              style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
            >
              REWARDS
            </h1>
            <p
              className="text-xl md:text-2xl text-[#CCFF00] mb-6 uppercase"
              style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
            >
              COMING SOON
            </p>
            <p
              className="text-[#FFFFFF] text-base md:text-lg mb-2"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {"Sorry, I have ADHD."}
            </p>
            <p
              className="text-[#888888] text-sm md:text-base"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              Exciting rewards are on the way. Stay tuned!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#000000] py-10 md:py-14 px-4 mt-6 md:mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-logo-small-REJQ74xYMktKwzxz1LsyZINIDXNKJs.webp"
              alt="Mandy.gg logo"
              width={120}
              height={48}
              className="h-10 md:h-12 w-auto"
            />
          </div>

          <div
            className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm text-[#FFFFFF] mb-6"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            <Link href="/privacy" className="hover:text-[#CCFF00] transition-colors uppercase">
              PRIVACY POLICY
            </Link>
            <Link href="/terms" className="hover:text-[#CCFF00] transition-colors uppercase">
              TERMS OF SERVICE
            </Link>
            <a
              href="https://t.me/mandysupport_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#CCFF00] transition-colors uppercase"
            >
              SUPPORT
            </a>
          </div>

          <MailingListForm />

          <p
            className="text-xs text-[#888888] mt-8 uppercase leading-relaxed"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {"© 2025 MANDY.GG. ALL RIGHTS RESERVED. PLAY RESPONSIBLY. CRYPTOCURRENCY GAMBLING INVOLVES RISK. MUST BE 18+ TO PARTICIPATE."}
          </p>
        </div>
      </footer>
    </div>
  )
}

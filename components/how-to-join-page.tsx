"use client"

import { SiteNavigation } from "@/components/site-navigation"
import { AnnouncementsTicker } from "@/components/announcements-ticker"
import { Button } from "@/components/ui/button"
import { ExternalLink, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import MailingListForm from "@/components/MailingListForm"

export function HowToJoinPage() {
  return (
    <div className="min-h-screen bg-[#000000]">
      {/* Ticker 1 */}
      <AnnouncementsTicker tickerKey="ticker_1_text" />

      <SiteNavigation currentPage="how-to-join" />

      {/* Hero Section */}
      <section className="relative px-4 pt-24 pb-16 md:pt-32 md:pb-24 bg-[#000000]">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#FFFFFF] tracking-tight text-balance uppercase"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            How to Join{" "}
            <span className="text-[#CCFF00]">Thrill</span>
          </h1>
          <p
            className="mt-6 text-lg text-[#FFFFFF] text-balance md:text-xl"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Follow these steps to join Thrill.com with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a> and
            unlock exclusive rewards
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-6xl space-y-24">
          {/* Step 1 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div
                className="inline-flex items-center gap-2 rounded bg-[#CCFF00]/10 px-4 py-2 text-sm text-[#CCFF00] mb-6 uppercase"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[#CCFF00] text-xs text-[#000000]" style={{ fontWeight: 700 }}>
                  1
                </span>
                STEP ONE
              </div>
              <h2
                className="text-3xl md:text-4xl text-[#FFFFFF] mb-4 uppercase"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                Visit Thrill with Code MANDY
              </h2>
              <p
                className="text-lg mb-6 leading-relaxed text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                Click the button below to open Thrill.com. Make sure to use this specific link so you{"'"}re registered
                under code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a> and eligible for all exclusive
                rewards.
              </p>
              <div className="space-y-4" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                  <p className="text-[#FFFFFF]">Use the referral link to sign up</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                  <p className="text-[#FFFFFF]">Must be 18 years or older to participate</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                  <p className="text-[#FFFFFF]">Have a valid email address</p>
                </div>
              </div>
              <Button
                size="lg"
                className="mt-8 bg-[#CCFF00] text-[#000000] rounded hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all duration-300 uppercase"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                asChild
              >
                <a
                  href="https://thrill.com/?r=MANDY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Visit Thrill.com
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-8 rounded-3xl opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, #A538FF 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="relative">
                  <Image
                    src="/images/design-mode/MANDYGG_THRILL_SIGNIN(1).webp"
                    alt="Thrill.com homepage showing sign up button"
                    width={800}
                    height={600}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-1">
              <div className="relative">
                <div className="absolute -inset-8 rounded-3xl opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, #3C7BFF 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="relative">
                  <Image
                    src="/images/design-mode/MANDYGG_THRILL_EMAIL(1).webp"
                    alt="Thrill sign up form with email input"
                    width={800}
                    height={600}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
            <div className="order-2">
              <div
                className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm mb-6 text-[#3C7BFF] bg-[#3C7BFF]/10 uppercase"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded text-xs text-[#000000] bg-[#3C7BFF]" style={{ fontWeight: 700 }}>
                  2
                </span>
                STEP TWO
              </div>
              <h2
                className="text-3xl md:text-4xl text-[#FFFFFF] mb-4 uppercase"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                Complete Sign Up Process
              </h2>
              <p
                className="text-[#FFFFFF] text-lg mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                Click the <span className="text-[#3C7BFF]">SIGN UP</span> button and follow the registration
                process. Enter your email address and complete all required fields to create your account.
              </p>
              <div className="space-y-4" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#3C7BFF]" />
                  <p className="text-[#FFFFFF]">{"Click \"SIGN UP\" in the top right corner"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#3C7BFF]" />
                  <p className="text-[#FFFFFF]">Enter your email and create a secure password</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#3C7BFF]" />
                  <p className="text-[#FFFFFF]">Complete all required registration fields</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <div
                className="inline-flex items-center gap-2 rounded bg-[#CCFF00]/10 px-4 py-2 text-sm text-[#CCFF00] mb-6 uppercase"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600 }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-[#CCFF00] text-xs text-[#000000]" style={{ fontWeight: 700 }}>
                  3
                </span>
                STEP THREE
              </div>
              <h2
                className="text-3xl md:text-4xl text-[#FFFFFF] mb-4 uppercase"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                Verify Your Referral Code
              </h2>
              <p
                className="text-[#FFFFFF] text-lg mb-6 leading-relaxed"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                After signing up, click on your profile and verify that you are referred by{" "}
                <span className="text-[#CCFF00]">mandycalmdown</span>. This is crucial for reward eligibility.
              </p>
              <div className="space-y-4" style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                  <p className="text-[#FFFFFF]">Click on your profile icon in the top right</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#CCFF00] mt-0.5 flex-shrink-0" />
                  <p className="text-[#FFFFFF]">{"Look for \"Referred by mandycalmdown\" text"}</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-[#FF2FBF]" />
                  <p className="text-[#FFFFFF]">
                    <span className="text-[#FF2FBF]">Important:</span> If you don{"'"}t see this, contact support
                    immediately
                  </p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-8 rounded-3xl opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle, #CCFF00 0%, transparent 70%)", filter: "blur(40px)" }} />
                <div className="relative">
                  <Image
                    src="/images/design-mode/MANDYGG_THRILL_PROFILE(1).webp"
                    alt="Thrill profile showing referred by mandycalmdown"
                    width={800}
                    height={400}
                    className="w-full h-auto relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <div
            className="bg-[#050505] rounded border-2 border-[#FF2FBF] relative p-8 md:p-12"
            style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(255,47,191,0.3)" }}
          >
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 flex-shrink-0 mt-1 text-[#FF2FBF]" />
              <div>
                <h3
                  className="text-2xl text-[#FF2FBF] mb-3 uppercase"
                  style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                >
                  Critical: Verify Before Depositing
                </h3>
                <p
                  className="text-lg leading-relaxed mb-4 text-[#FFFFFF]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {"If your profile does not show \"Referred by mandycalmdown\" you "}
                  <span className="text-[#CCFF00]">MUST</span>{" "}contact Thrill support before making any deposits
                  or wagers. Otherwise, you will not be under code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a> and will not be eligible for any rewards,
                  cash drops, or leaderboard prizes.
                </p>
                <p
                  className="leading-relaxed text-[#FFFFFF]"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  Contact support through the live chat option on the Thrill website
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2
            className="text-3xl md:text-4xl text-[#FFFFFF] mb-6 uppercase"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="text-[#FFFFFF] text-lg mb-8 text-balance"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            Join the MandyGG community today and start earning exclusive rewards
          </p>
          <Button
            size="lg"
            className="bg-[#CCFF00] text-[#000000] rounded text-lg px-8 py-6 hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all duration-300 uppercase"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
            asChild
          >
            <a
              href="https://thrill.com/?r=MANDY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Join with Code MANDY
              <ExternalLink className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#000000] border-t border-[#CCFF00] py-10 md:py-14 px-4">
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

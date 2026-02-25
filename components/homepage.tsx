"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import MailingListForm from "@/components/MailingListForm"
import { AnnouncementsTicker } from "@/components/announcements-ticker"
import { SiteNavigation } from "@/components/site-navigation"
import { socialLinks } from "@/components/social-icons"
import { faqItems } from "@/components/homepage-faq-data"

export function Homepage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
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

  return (
    <div className="min-h-screen bg-[#000000] relative">
      {/* ─── Fixed Holographic Background ─── */}
      <div className="fixed inset-0 z-0" aria-hidden="true">
        <picture>
          <source
            media="(max-width: 768px)"
            srcSet="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-mobile-ZwOFt65iGL74bPv4mX15f9MezlKFZP.webp"
          />
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-holographic-loop-bg-KuTV174iSOVIJGQHzXHDyVA96RnXCn.webp"
            alt=""
            className="w-full h-full object-cover"
          />
        </picture>
      </div>

      {/* Ticker 1 - Top of page */}
      <div className="relative z-10">
        <AnnouncementsTicker tickerKey="ticker_1_text" />
      </div>

      {/* Navbar */}
      <div className="relative z-10">
        <SiteNavigation currentPage="home" />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 bg-[#000000] flex flex-col items-center justify-center py-10 md:py-16">
        <div className="relative z-10 flex flex-col items-center w-full">
          <h1
            className="text-3xl md:text-5xl text-[#FFFFFF] uppercase tracking-wide text-center"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            MANDY.GG
          </h1>
          <p
            className="text-sm md:text-base text-[#FFFFFF] mt-2 mb-0 text-center"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {"Yes, I'm a girl... and I gamble."}
          </p>
        </div>
      </section>

      {/* ─── Cards Section (scrolls over holographic background) ─── */}
      <section className="relative z-10 py-10 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - REWARDS */}
            <div
              className="group bg-[#000000] rounded-xl border border-white/20 p-6 md:p-8 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#CCFF00]/60"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(204,255,0,0.15)" }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)" }}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-icon-rewards-gift-ykpn7XT2fHgtFsELVOES2ujmpMpLog.webp"
                alt="Mandy.gg Rewards gift box"
                width={200}
                height={200}
                className="w-40 h-40 md:w-48 md:h-48 object-contain mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
              />
              <h3
                className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-2"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                REWARDS
              </h3>
              <p
                className="text-sm text-[#FFFFFF] mb-6 uppercase"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                Want more bonuses
                <br />
                use code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a>
              </p>
              <Link href="/rewards" className="mt-auto w-full">
                <Button
                  className="w-full bg-[#CCFF00] text-[#000000] rounded uppercase text-sm hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] hover:brightness-110 transition-all duration-300"
                  style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                >
                  TELL ME MORE
                </Button>
              </Link>
            </div>

            {/* Card 2 - LEADERBOARD */}
            <div
              className="group bg-[#000000] rounded-xl border border-white/20 p-6 md:p-8 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#3C7BFF]/60"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(60,123,255,0.2)" }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)" }}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-icon-leaderboard-trophy-QMFksNixcImJvlyF5SjCLeHcOuvo11.webp"
                alt="Mandy.gg Leaderboard trophy"
                width={200}
                height={200}
                className="w-40 h-40 md:w-48 md:h-48 object-contain mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              />
              <h3
                className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-2"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                $3500 WEEKLY LEADERBOARD
              </h3>
              <p
                className="text-sm text-[#FFFFFF] mb-6 uppercase"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {"FORGET MONTHLY LEADERBOARDS, WITH CODE MANDY YOU CAN WAGER TO WIN EVERY WEEK"}
              </p>
              <Link href="/leaderboard" className="mt-auto w-full">
                <Button
                  className="w-full bg-[#CCFF00] text-[#000000] rounded uppercase text-sm hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] hover:brightness-110 transition-all duration-300"
                  style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                >
                  GO TO LEADERBOARD
                </Button>
              </Link>
            </div>

            {/* Card 3 - CONNECT */}
            <div
              className="group bg-[#000000] rounded-xl border border-white/20 p-6 md:p-8 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#FF2FBF]/60"
              style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(255,47,191,0.2)" }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)" }}
            >
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-icon-connect-chat-mM98GWnKxYIoxyjgvZyTTOGatKkYm4.webp"
                alt="Mandy.gg Connect chat bubble"
                width={200}
                height={200}
                className="w-40 h-40 md:w-48 md:h-48 object-contain mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
              />
              <h3
                className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-2"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                CONNECT
              </h3>
              <p
                className="text-sm text-[#FFFFFF] mb-6 uppercase"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {"JOIN THE CHAOS"}
              </p>
              <Link href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer" className="mt-auto w-full">
                <Button
                  className="w-full bg-[#CCFF00] text-[#000000] rounded uppercase text-sm hover:shadow-[0_0_25px_rgba(204,255,0,0.6)] hover:brightness-110 transition-all duration-300"
                  style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
                >
                  TELEGRAM
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker 2 */}
      <div className="relative z-10">
        <AnnouncementsTicker tickerKey="ticker_2_text" />
      </div>

      {/* ─── Mandy x Thrill Section ─── */}
      <section className="relative z-10 bg-[#000000] pt-6 pb-6 md:pt-10 md:pb-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
            {/* Logos */}
            <div className="flex-shrink-0">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDY-GG-THRILL-LOGOS-aE8v99hIu3ZnlWrtZAFIjCqA5sBIJw.webp"
                alt="Mandy x Thrill logos"
                className="w-[560px] md:w-[720px] h-auto"
                loading="lazy"
              />
            </div>

            {/* Text + CTA */}
            <div className="text-center flex-1">
              <p
                className="text-xl md:text-2xl text-[#FFFFFF] leading-snug uppercase"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                COME PLAY WITH
                <br />
                ME AT THRILL!
              </p>
              <p
                className="text-base md:text-lg text-[#FFFFFF] mt-2 leading-snug italic"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 400 }}
              >
                {"(It's like Stake, but with less Drake"}
                <br />
                {"and better bonuses!)"}
              </p>
              <div className="mt-3">
                <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer">
                  <Button
                    className="bg-[#CCFF00] text-[#000000] border-none rounded uppercase text-sm px-8 py-3 hover:shadow-[0_0_25px_rgba(204,255,0,0.5)] transition-all duration-300"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 600, letterSpacing: "0.1em" }}
                  >
                    PLAY AT THRILL
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── I'm Mandy, Section ─── */}
      <section className="relative z-10 bg-[#000000] overflow-visible">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-0 md:pt-16 md:pb-0">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-0">
            {/* Left: text */}
            <div className="flex-1 relative z-10 md:pr-8">
              <h2
                className="text-4xl md:text-6xl text-[#CCFF00] mb-6"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                {"I'm Mandy,"}
              </h2>
              <p
                className="text-sm md:text-base text-[#FFFFFF] leading-relaxed mb-3"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                {"I'm a gambler trying to guide other degenerates through the shit show that is the online casino industry. The casinos on this site are the ones I actually trust with my own money. I get my players the best perks possible so you can stop Googling bonus codes and get back to watching Plinko balls fall in the wrong direction. You're welcome."}
              </p>
              <p
                className="text-sm md:text-base text-[#FFFFFF] leading-relaxed"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                Sign up at Thrill with code:{" "}
                <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a>
                {" "}and come join the party on{" "}
                <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Telegram</a>.
              </p>
            </div>

            {/* Right: portrait with blue glow - overlaps into section above */}
            <div className="flex-shrink-0 relative md:w-[400px] w-full flex justify-center md:justify-end md:-mt-48">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none z-0"
                style={{
                  background: "radial-gradient(circle, rgba(42,105,219,0.55) 0%, rgba(42,105,219,0.25) 30%, rgba(42,105,219,0.08) 55%, transparent 70%)",
                  filter: "blur(40px)",
                }}
              />
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-profile-photo-X8F4rWnnPeOGrwixzucWibnU9psG3K.webp"
                alt="Mandy portrait"
                className="w-[300px] md:w-[380px] h-auto object-contain relative z-10"
                loading="lazy"
              />
            </div>
          </div>
        </div>

      </section>

      {/* Ticker 3 - directly below I'm Mandy */}
      <div className="relative z-10">
        <AnnouncementsTicker tickerKey="ticker_3_text" />
      </div>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="relative z-10 py-8 md:py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl md:text-4xl text-[#000000] uppercase text-center mb-6 md:mb-8"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="flex flex-col gap-1.5">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="bg-[#000000] rounded-md overflow-hidden"
              >
                <button
                  className="w-full py-2 md:py-2.5 px-4 md:px-5 cursor-pointer text-left focus:outline-none flex justify-between items-center gap-3"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-content-${index}`}
                >
                  <h3
                    className="text-xs md:text-sm text-[#FFFFFF] uppercase text-left"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 400 }}
                  >
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-4 h-4 flex-shrink-0 text-[#CCFF00] transition-transform duration-300 ${expandedFaq === index ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div
                    id={`faq-content-${index}`}
                    className="px-4 md:px-5 pb-3 md:pb-4"
                  >
                    <div
                      className="text-xs md:text-sm text-[#FFFFFF] leading-relaxed"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {typeof faq.answer === "string" ? faq.answer : faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <p
              className="text-lg md:text-2xl text-[#000000] mb-4 uppercase"
              style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
            >
              JOIN OUR COMMUNITY ON TELEGRAM TO UNLOCK ALL BENEFITS.
            </p>
            <Link href="https://t.me/Mandythrill" target="_blank" rel="noopener noreferrer">
              <Button
                className="bg-[#CCFF00] text-[#000000] rounded uppercase text-sm md:text-base px-8 py-3 hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all duration-300"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                JOIN TELEGRAM
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Social Icons Strip ─── */}
      <section className="relative z-10 py-6 md:py-10">
        <div className="flex justify-center items-center gap-4 md:gap-6">
          {socialLinks.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-[#000000] transition-all duration-300 hover:text-[#CCFF00] hover:scale-125 hover:-translate-y-1 hover:drop-shadow-[0_0_12px_rgba(204,255,0,0.6)]"
              style={{ transformOrigin: "bottom center" }}
            >
              <Icon className="w-20 h-20 md:w-[100px] md:h-[100px]" />
            </a>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 bg-[#000000] py-10 md:py-14 px-4">
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

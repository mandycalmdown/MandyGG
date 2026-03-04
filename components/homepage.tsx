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
  const [scrollY, setScrollY] = useState(0)
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

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <div className="min-h-screen bg-[#1f1f1f] relative overflow-x-hidden">
      {/* ─── STICKY NAVBAR ─── */}
      <div className="sticky top-0 z-50">
        <SiteNavigation currentPage="home" />
      </div>

      {/* ─── TICKER 1 (Below navbar) ─── */}
      <div className="relative z-20">
        <AnnouncementsTicker tickerKey="ticker_1_text" />
      </div>

      {/* ─── SECTION 1: HERO (Spinning Logo) ─── */}
      <section className="relative w-full min-h-screen bg-[#1f1f1f] flex items-center justify-center overflow-hidden">
        <div
          className="flex items-center justify-center"
          style={{
            transform: prefersReducedMotion ? "none" : `translateY(${scrollY * 0.3}px)`,
            opacity: Math.max(0, 1 - scrollY / 600),
          }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-64 md:w-96 h-auto object-contain"
            style={{ display: "block" }}
          >
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-spinning-logo-go3Usymb603ueWcluXgwKOXYd4GivN.webm"
              type="video/webm"
            />
          </video>
        </div>
      </section>

      {/* ─── SECTION 2: YELLOW MANDY.GG BAND (STICKY BEHAVIOR) ─── */}
      <section
        className="relative w-full bg-[#c8fe00] py-16 md:py-24 z-30"
        style={{
          position: scrollY > 800 ? "sticky" : "relative",
          top: scrollY > 800 ? 64 : "auto",
        }}
      >
        {/* Yellow band content */}
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <h2
            className="text-4xl md:text-6xl font-black uppercase text-[#151515] tracking-widest"
            style={{ fontFamily: "OCR B Std, monospace" }}
          >
            MANDY.GG
          </h2>
          <p
            className="text-lg md:text-2xl uppercase text-[#151515] mt-2 font-black tracking-wide"
            style={{ fontFamily: "OCR B Std, monospace" }}
          >
            YEAH, I'M A GIRL AND I GAMBLE.
          </p>
        </div>

        {/* Floating assets over yellow band */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Trophy */}
          <div
            className="absolute w-32 h-32 md:w-48 md:h-48"
            style={{
              right: "5%",
              top: "20%",
              transform: prefersReducedMotion ? "none" : `translateY(${(scrollY - 800) * 0.1}px)`,
              zIndex: scrollY > 900 ? 40 : 5,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY_FLOATING_ELEMENT-QOKEIT9LFdGLGmw9eVcuMC7I7PcEvu.webp"
              alt="Trophy"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Poker Chip */}
          <div
            className="absolute w-24 h-24 md:w-32 md:h-32"
            style={{
              right: "12%",
              bottom: "10%",
              transform: prefersReducedMotion ? "none" : `translateY(${(scrollY - 800) * -0.15}px)`,
              zIndex: scrollY > 900 ? 5 : 40,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POKERCHIP__FLOATING_ELEMENT-eHDiZQerbpnVaknCxDImGBlyZo1TXh.webp"
              alt="Poker Chip"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Gift Box */}
          <div
            className="absolute w-40 h-40 md:w-56 md:h-56"
            style={{
              left: "3%",
              top: "50%",
              transform: prefersReducedMotion ? "none" : `translateY(${(scrollY - 800) * 0.12}px)`,
              zIndex: 5,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GIFT_FLOATING_ELEMENT-HnZOVZyJzOem8MO5CgdJGmIVtiTPlV.webp"
              alt="Gift Box"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Dice */}
          <div
            className="absolute w-32 h-32 md:w-40 md:h-40"
            style={{
              left: "15%",
              top: "10%",
              transform: prefersReducedMotion ? "none" : `translateY(${(scrollY - 800) * -0.2}px)`,
              zIndex: scrollY > 950 ? 5 : 40,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DICE_FLOATING_ELEMENT-z66C0vVpaSzuLjVpRUU3EZCXOoEzau.webp"
              alt="Dice"
              className="w-full h-full object-contain"
            />
          </div>

          {/* VIP Text */}
          <div
            className="absolute w-48 h-48 md:w-64 md:h-64"
            style={{
              right: "25%",
              bottom: "5%",
              transform: prefersReducedMotion ? "none" : `translateY(${(scrollY - 800) * 0.08}px)`,
              zIndex: 5,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VIP_FLOATING_ELEMENT-WMR1gdl6wxQ6TClcKwfUtSYYUPfZr5.webp"
              alt="VIP"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Coin */}
          <div
            className="absolute w-20 h-20 md:w-28 md:h-28"
            style={{
              left: "35%",
              bottom: "15%",
              transform: prefersReducedMotion ? "none" : `translateY(${(scrollY - 800) * 0.25}px)`,
              zIndex: 40,
            }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/COIN_FLOATING_ELEMENT-jfnbEvoKETS360QGpVZi1fy7m3y5g0.webp"
              alt="Coin"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: THREE FEATURE CARDS ─── */}
      <section className="relative w-full bg-[#1f1f1f] py-16 md:py-24 px-4 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Rewards Card */}
            <div
              className="bg-[#1f1f1f] border-2 border-[#000000] p-8 md:p-10 flex flex-col items-center text-center"
              style={{
                boxShadow: "3px 3px 0 rgba(0,0,0,1)",
                borderRadius: "2px",
              }}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 mb-6">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REWARDS_HOLOGRAM_ICON-wYnYEtXbZyiqM2munN5rPZ1laVLopd.webp"
                  alt="Rewards"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3
                className="text-xl md:text-2xl uppercase font-black text-[#c8fe00] mb-3 tracking-wider"
                style={{ fontFamily: "OCR B Std, monospace" }}
              >
                REWARDS I GOT YOU
              </h3>
              <p className="text-sm md:text-base text-[#FFFFFF] mb-6">Join the race and compete for weekly prizes</p>
              <Link href="#rewards">
                <Button
                  className="bg-[#c8fe00] text-[#151515] border-2 border-[#000000] uppercase font-black tracking-wider hover:brightness-90 transform hover:-translate-y-0.5"
                  style={{
                    fontFamily: "OCR B Std, monospace",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                    borderRadius: "2px",
                  }}
                >
                  VIEW REWARDS
                </Button>
              </Link>
            </div>

            {/* Race Card */}
            <div
              className="bg-[#1f1f1f] border-2 border-[#000000] p-8 md:p-10 flex flex-col items-center text-center"
              style={{
                boxShadow: "3px 3px 0 rgba(0,0,0,1)",
                borderRadius: "2px",
              }}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 mb-6">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RACE_HOLOGRAM_ICON-D5nvoQ7KXz6sV3EUQC2MgisAEoRGa9.webp"
                  alt="Race"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3
                className="text-xl md:text-2xl uppercase font-black text-[#c8fe00] mb-1 tracking-wider"
                style={{ fontFamily: "OCR B Std, monospace" }}
              >
                $35,000 RACE
              </h3>
              <p className="text-xs md:text-sm text-[#999] mb-3">Forget monthly</p>
              <p className="text-xs md:text-sm text-[#999] mb-6">Join a weekly race to win every week</p>
              <Link href="#leaderboard">
                <Button
                  className="bg-[#c8fe00] text-[#151515] border-2 border-[#000000] uppercase font-black tracking-wider hover:brightness-90 transform hover:-translate-y-0.5"
                  style={{
                    fontFamily: "OCR B Std, monospace",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                    borderRadius: "2px",
                  }}
                >
                  VIEW LEADERBOARD
                </Button>
              </Link>
            </div>

            {/* Connect Card */}
            <div
              className="bg-[#1f1f1f] border-2 border-[#000000] p-8 md:p-10 flex flex-col items-center text-center"
              style={{
                boxShadow: "3px 3px 0 rgba(0,0,0,1)",
                borderRadius: "2px",
              }}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 mb-6">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONNECT_HOLOGRAM_ICON-pYzxAgRsXHHpRgyxGVg2TY0CFBHpmg.webp"
                  alt="Connect"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3
                className="text-xl md:text-2xl uppercase font-black text-[#c8fe00] mb-3 tracking-wider"
                style={{ fontFamily: "OCR B Std, monospace" }}
              >
                CONNECT
              </h3>
              <p className="text-sm md:text-base text-[#FFFFFF] mb-6">Core join the community and chat live</p>
              <Link href="https://t.me/MandyggChat" target="_blank">
                <Button
                  className="bg-[#c8fe00] text-[#151515] border-2 border-[#000000] uppercase font-black tracking-wider hover:brightness-90 transform hover:-translate-y-0.5"
                  style={{
                    fontFamily: "OCR B Std, monospace",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                    borderRadius: "2px",
                  }}
                >
                  JOIN TELEGRAM
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: MANDY x THRILL ─── */}
      <section className="relative w-full bg-[#1f1f1f] py-16 md:py-24 px-4 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M_LOGO_YELLOW-PWuv3DrM2dtu3KJKT34AriQyDkGAQq.webp"
                alt="Mandy Logo"
                className="w-32 h-auto mb-6"
              />
              <h2
                className="text-3xl md:text-5xl uppercase font-black text-[#c8fe00] mb-4 tracking-widest"
                style={{ fontFamily: "OCR B Std, monospace" }}
              >
                COME PLAY WITH ME
                <br />
                AT THRILL!
              </h2>
              <p className="text-sm md:text-base text-[#FFFFFF] mb-6 italic">
                (It's like Stake, but with less Drake and more bonuses!)
              </p>
              <Link href="https://thrill.com/?r=MANDY" target="_blank">
                <Button
                  className="bg-[#c8fe00] text-[#151515] border-2 border-[#000000] uppercase font-black tracking-wider hover:brightness-90 transform hover:-translate-y-0.5 px-8 py-4"
                  style={{
                    fontFamily: "OCR B Std, monospace",
                    boxShadow: "2px 2px 0 rgba(0,0,0,0.5)",
                    borderRadius: "2px",
                  }}
                >
                  PLAY AT THRILL
                </Button>
              </Link>
            </div>
            <div className="flex-1">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M_LOGO_YELLOW-PWuv3DrM2dtu3KJKT34AriQyDkGAQq.webp"
                alt="Mandy Thrill"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: HI I'M MANDY ─── */}
      <section className="relative w-full bg-[#1f1f1f] py-16 md:py-24 px-4 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h2
                className="text-4xl md:text-6xl uppercase font-black text-[#c8fe00] mb-6 tracking-widest"
                style={{ fontFamily: "OCR B Std, monospace" }}
              >
                HI I'M MANDY,
              </h2>
              <div className="space-y-4 text-sm md:text-base text-[#FFFFFF] leading-relaxed">
                <p>
                  I'm a gambler trying to guide other degenerates through the shit show that is the online casino industry. The casinos on this site are the ones I actually trust with my own money. I get my players the best perks possible so you can stop Googling bonus codes and get back to watching Plinko balls fall in the wrong direction. You're welcome.
                </p>
                <p>
                  Sign up at Thrill with code:{" "}
                  <Link href="https://thrill.com/?r=MANDY" target="_blank" className="text-[#c8fe00] font-bold hover:underline">
                    MANDY
                  </Link>
                  {" "}and come join the party on{" "}
                  <Link href="https://t.me/MandyggChat" target="_blank" className="text-[#c8fe00] font-bold hover:underline">
                    Telegram
                  </Link>
                  .
                </p>
              </div>

              {/* Kick Badge */}
              <div className="mt-8 flex items-center gap-3 bg-[#c8fe00] text-[#151515] p-4 inline-flex rounded-lg">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/KICK_ICON-vbx7SAEPHPhmrsidbMX7i4bzkimJQ9.webp"
                  alt="Kick"
                  className="w-8 h-8"
                />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest">Mandy stream coming soon!</p>
                  <p className="text-xs">Follow on Kick so you don't miss it!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: FAQ ─── */}
      <section className="relative w-full bg-[#1f1f1f] py-16 md:py-24 px-4 z-20">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-4xl md:text-5xl uppercase font-black text-[#000000] mb-12 tracking-widest text-center"
            style={{ fontFamily: "OCR B Std, monospace" }}
          >
            FREQUENTLY ASKED QUESTIONS
          </h2>

          <div className="space-y-2">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="bg-[#1f1f1f] border-2 border-[#000000]"
                style={{
                  boxShadow: "2px 2px 0 rgba(0,0,0,1)",
                  borderRadius: "2px",
                }}
              >
                <button
                  className="w-full py-3 md:py-4 px-6 md:px-8 cursor-pointer text-left flex justify-between items-center gap-4 hover:bg-[#2a2a2a] transition-colors"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-content-${index}`}
                >
                  <h3
                    className="text-sm md:text-base uppercase font-black text-[#FFFFFF] tracking-wide"
                    style={{ fontFamily: "OCR B Std, monospace" }}
                  >
                    {faq.question}
                  </h3>
                  <span className="text-2xl md:text-3xl text-[#c8fe00] font-black flex-shrink-0">
                    {expandedFaq === index ? "−" : "+"}
                  </span>
                </button>
                {expandedFaq === index && (
                  <div id={`faq-content-${index}`} className="px-6 md:px-8 pb-4 md:pb-6 border-t border-[#000000]">
                    <div className="text-sm md:text-base text-[#FFFFFF] leading-relaxed">
                      {typeof faq.answer === "string" ? faq.answer : faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 7: HOLOGRAPHIC FOOTER ─── */}
      <section
        className="relative w-full py-24 md:py-32 px-4 z-20 overflow-hidden"
        style={{
          backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLOGRAPHIC_FOIL_BACKGROUND.webp-t00iPLPAtMzDhml94kFHQG5aSZ93zb.jpeg')`,
          backgroundSize: "cover",
          backgroundAttachment: prefersReducedMotion ? "scroll" : "fixed",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="flex justify-center gap-6 mb-12 flex-wrap">
              {socialLinks.map((social) => {
                const Icon = social.Icon
                return (
                  <Link key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">
                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="w-12 h-12 text-[#FFFFFF] hover:text-[#c8fe00] transition-colors">
                        <Icon className="w-full h-full" />
                      </div>
                      <span className="text-xs md:text-sm uppercase font-black tracking-wide text-[#FFFFFF] group-hover:text-[#c8fe00]">
                        {social.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>

            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/M_LOGO_YELLOW-PWuv3DrM2dtu3KJKT34AriQyDkGAQq.webp"
              alt="Mandy"
              className="w-24 md:w-32 h-auto mx-auto mb-8"
            />

            <div className="flex justify-center gap-6 md:gap-12 flex-wrap text-xs md:text-sm uppercase font-black tracking-widest text-[#FFFFFF]">
              <Link href="#privacy" className="hover:text-[#c8fe00]">
                PRIVACY POLICY
              </Link>
              <Link href="#terms" className="hover:text-[#c8fe00]">
                TERMS OF SERVICE
              </Link>
              <Link href="https://t.me/mandysupport_bot" target="_blank" className="hover:text-[#c8fe00]">
                SUPPORT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mailing List Modal/Form (hidden for now) */}
      <MailingListForm />
    </div>
  )
}

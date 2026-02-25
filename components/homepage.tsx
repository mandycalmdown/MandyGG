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

/* ───── Social Icon SVGs ───── */
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-current" fillRule="evenodd" d="M360.93,160.62c-19.87-9.09-40.84-15.54-62.38-19.18-2.94,5.27-5.59,10.69-7.97,16.24-11.46-1.73-23.03-2.6-34.62-2.6-11.57,0-23.2.88-34.62,2.58-2.33-5.51-5.04-10.97-7.99-16.22-21.54,3.68-42.52,10.14-62.4,19.22-39.48,58.41-50.18,115.36-44.83,171.5,23.12,17.08,48.99,30.06,76.5,38.4,6.17-8.33,11.7-17.19,16.39-26.42-8.95-3.34-17.59-7.46-25.81-12.32,2.16-1.57,4.28-3.19,6.32-4.76,23.91,11.23,50.04,17.09,76.47,17.09s52.56-5.86,76.48-17.09c2.07,1.69,4.19,3.31,6.33,4.76-8.24,4.87-16.89,9-25.86,12.35,4.71,9.25,10.19,18.08,16.39,26.4,27.53-8.31,53.43-21.29,76.55-38.39h0c6.28-65.1-10.72-121.52-44.94-171.55h0ZM205.78,297.63c-14.91,0-27.23-13.53-27.23-30.17s11.89-30.29,27.18-30.29,27.51,13.65,27.25,30.29c-.26,16.64-12.01,30.17-27.2,30.17h0ZM306.22,297.63c-14.93,0-27.2-13.53-27.2-30.17s11.89-30.29,27.2-30.29,27.44,13.65,27.18,30.29c-.26,16.64-11.98,30.17-27.18,30.17Z" />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-current" d="M81.23,128.77l14.24,39.41s1.78,3.69,3.69,3.69,30.26-29.49,30.26-29.49l31.52-60.89-79.19,37.12-.51,10.17Z" />
      <path className="fill-current" d="M100.11,138.88l-2.73,29.05s-1.14,8.9,7.75,0,17.42-15.76,17.42-15.76" />
      <path className="fill-current" d="M81.49,130.18l-29.29-9.54s-3.5-1.42-2.37-4.64c.23-.66.7-1.23,2.1-2.2,6.49-4.52,120.11-45.36,120.11-45.36,0,0,3.21-1.08,5.1-.36.95.29,1.67,1.08,1.88,2.06.2.85.29,1.72.25,2.58,0,.75-.1,1.45-.17,2.54-.69,11.17-21.4,94.49-21.4,94.49,0,0-1.24,4.88-5.68,5.04-2.2.07-4.34-.76-5.93-2.29-8.71-7.49-38.82-27.73-45.47-32.18-.3-.21-.5-.54-.55-.9-.09-.47.42-1.05.42-1.05,0,0,52.43-46.6,53.82-51.49.11-.38-.3-.57-.85-.4-3.48,1.28-63.84,39.4-70.51,43.61-.48.15-.99.18-1.48.09Z" />
    </svg>
  )
}

function KickIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 248.55 248.55" xmlns="http://www.w3.org/2000/svg">
      <polygon className="fill-current" points="218.56 120.35 218.56 128.2 226.42 128.2 226.42 136.05 234.28 136.05 234.28 159.59 210.71 159.59 210.71 151.75 202.85 151.75 202.85 143.9 194.99 143.9 194.99 159.59 171.42 159.59 171.42 88.95 194.99 88.95 194.99 104.65 202.85 104.65 202.85 96.8 210.71 96.8 210.71 88.95 234.28 88.95 234.28 112.5 226.42 112.5 226.42 120.35 218.56 120.35" />
      <polygon className="fill-current" points="61.42 120.35 61.42 128.2 69.28 128.2 69.28 136.05 77.13 136.05 77.13 159.59 53.56 159.59 53.56 151.75 45.7 151.75 45.7 143.9 37.85 143.9 37.85 159.59 14.28 159.59 14.28 88.95 37.85 88.95 37.85 104.65 45.7 104.65 45.7 96.8 53.56 96.8 53.56 88.95 77.13 88.95 77.13 112.5 69.28 112.5 69.28 120.35 61.42 120.35" />
      <polygon className="fill-current" points="116.42 96.8 116.42 151.75 124.28 151.75 124.28 159.59 163.56 159.59 163.56 136.05 139.99 136.05 139.99 112.5 163.56 112.5 163.56 88.95 124.28 88.95 124.28 96.8 116.42 96.8" />
      <rect className="fill-current" x="84.99" y="88.95" width="23.57" height="70.64" />
    </svg>
  )
}

function WebsiteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 276.43 212.71" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-current" d="M207.49,62.55c1.31-2.78,3.44-5.71,3.91-8.81-1.95,1.44-3.77,4.71-4.9,6.86-5.92,11.33-11.59,23.18-16.44,35.04-7.12,17.43-16.42,57.04-26.34,69.74-8.81,11.28-24.05,10.35-30.06-3.16-11.21-25.21,2.09-68.71,4.98-95.37.12-1.07.88-3.53-.85-3.29-19.22,47.61-21.44,143.67-93.63,138.03-33.27-2.6-51.17-32.43-41.58-63.77,7.6-24.83,47.79-44.53,63.24-16.93-1.9,3.62-6.22,4.05-9.03,6.35-13.76,11.31.27,26.74,15.54,17.48,13.33-8.08,23.38-46.85,29.38-61.81,6.22-15.5,13-31.77,21.53-46.11,1.47-2.47,6.02-7.51,6.67-9.03.75-1.73-.57-1.28-1.47-1.42-14.73-2.31-33.47-6.07-45.2,5.81-10.55,10.69-9.69,28.24-1.85,40.15,3.54,5.38,8.09,3.68,4.82,11.82-11.52,28.69-65.39,20.23-67.21-21.08C16.92,15.71,65.74.24,104.88,2.82c11.55.76,29.17,6.64,39.32,5.96,4.88-.33,10.06-6.62,16.89-7.7,10.5-1.65,20.76.79,17.71,13.77-1.55,6.59-11.92,9.6-13.34,12.15-1.47,2.64-3.36,20.01-3.96,24.46-2.23,16.55-2.64,33.21-4.16,49.82l2.03,16.16c4.06-15.88,11.19-31.79,19.14-46.07,10.03-18,42.25-63.64,61.4-70.02,26.41-8.8,2.59,27.61-1.46,37.74-12.6,31.42-44.28,127.93,15.72,130.3,8.13.32,10.41-3.06,16.12-4.51,3.59-.91,5.61,9.02,5.9,11.86,4.16,41.08-48.02,45.79-71.16,20.08-31.07-34.51-15.27-96.69,2.47-134.25v-.03Z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 2160 2160" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-current" d="M786.61,546.51h-162.6l748.47,1070.61h162.6L786.61,546.51ZM480,466.82h357.33l309.81,450.88,387.89-450.88h105.86l-446.74,519.29,485.85,707.08h-357.33l-327.18-476.15-409.63,476.15h-105.87l468.48-544.57L480,466.82Z" />
    </svg>
  )
}

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <path className="fill-current" d="M541.33,417.97l-59.3,56.25h-59.38l-51.95,49.22v-49.22h-66.8v-210.78h237.42v154.53ZM289.06,235.31l-74.22,70.23v252.97h89.06v70.23l74.22-70.23h59.38l133.52-126.48v-196.72h-281.95ZM496.88,314.84h-29.69v84.3h29.69v-84.3ZM385.55,314.45h29.69v84.3h-29.69v-84.3Z" />
    </svg>
  )
}

const socialLinks = [
  { Icon: DiscordIcon, href: "https://discord.gg/mandygg", label: "Discord" },
  { Icon: TelegramIcon, href: "https://t.me/MandyggChat", label: "Telegram" },
  { Icon: KickIcon, href: "https://kick.com/mandycalmdown", label: "Kick" },
  { Icon: XIcon, href: "https://x.com/mandycalmdown", label: "X" },
  { Icon: TwitchIcon, href: "https://twitch.tv/mandycalmdown", label: "Twitch" },
]

/* ───── FAQ Data ───── */
const faqItems = [
  {
    question: "HOW CAN I GET THE BEST CASINO BONUSES?",
    answer: (
      <span>
        Sign up through{" "}
        <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Thrill.com</a>
        {" "}with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a> for exclusive perks, weekly races, instant lossback, and VIP upgrades.
      </span>
    ),
  },
  {
    question: "WHAT'S THE BEST STAKE ALTERNATIVE?",
    answer: (
      <span>
        <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Thrill</a>
        {" "}offers the most generous bonuses and fastest payouts for crypto gamblers. You get extra rewards by joining with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a>.
      </span>
    ),
  },
  {
    question: "HOW DO I CONTACT YOU?",
    answer: (
      <span>
        Join the{" "}
        <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">official Telegram group</a>
        {" "}first. If you can{"'"}t find your answer in the group, message the{" "}
        <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">MandySupport bot</a>.
        {" "}Please do not DM me personally: personal messages go straight to the archive so I will not see them.
      </span>
    ),
  },
  {
    question: "WHAT PERKS COME WITH CODE MANDY?",
    answer: (
      <div>
        <p className="mb-3">Using code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a> gives you access to:</p>
        <ul className="list-disc list-inside space-y-2 mb-3">
          <li><strong>Weekly Leaderboard</strong>: Automatic entry into a weekly race with a $3,500 prize pool.</li>
          <li><strong>Monthly Poker Tournament</strong>: Access to a poker tournament with a $1,000 prize pool if you hit the $50,000 monthly wagering requirement.</li>
          <li><strong>Lossback</strong>: You can request lossback from day one. To request, message the <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Support Bot on Telegram</a>.</li>
          <li><strong>Custom High Roller Benefits</strong>: If you are a high volume player, message the <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">MandySupportBot</a> and let{"'"}s put together your perfect VIP package.</li>
          <li><strong>Wager Targets</strong>: We can set personal targets with cash bonuses after completion.</li>
          <li><strong>Events</strong>: Join the <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Telegram</a> and get notified for different events with awesome cash prizes.</li>
        </ul>
        <p className="text-sm italic bg-[#1a1a1a] p-3 rounded text-[#888]">
          <strong>Reminder:</strong> Think of bonuses and rewards as a small rebate for play you{"'"}re already planning to do, not a way to profit.
        </p>
      </div>
    ),
  },
  {
    question: "WHAT CASINO IS THE BEST?",
    answer: (
      <span>
        Currently your best option is{" "}
        <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Thrill</a>.
        Hands down. It{"'"}s new so they are eager and the bonuses are boosted, but it{"'"}s been well vetted and they are very reliable. Sign up with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a>.
      </span>
    ),
  },
  {
    question: "HOW DO I KNOW IF I USED CODE MANDY?",
    answer: (
      <span>
        Ask support in the live chat or check your profile page. It will show {"\""}Referred by: mandycalmdown{"\""} but do it within 24 hours of signing up. After that, you can{"'"}t add or change a referral code.
      </span>
    ),
  },
  {
    question: "WHEN I GO TO THE CASINO WEBSITE IT SAYS MY LOCATION IS BLOCKED.",
    answer: "Many people prefer to keep their degen lives private and use a VPN to mask their location. Check out VPN tutorials online for guidance on getting started.",
  },
  {
    question: "ARE THESE CASINOS REAL? WILL THEY SCAM ME?",
    answer: "Any casino listed on Mandy.gg has been vetted by me. If you're not breaking the terms of service or abusing promos or alts, you should have no issues withdrawing your winnings.",
  },
  {
    question: "I DON'T USE TELEGRAM. WHAT SHOULD I DO?",
    answer: (
      <span>
        You should download{" "}
        <a href="https://telegram.org" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">Telegram</a>
        {" "}and start using it if you don{"'"}t want to miss events or payouts for leaderboard wins. Right now, it{"'"}s the best way to communicate and connect with the community.
      </span>
    ),
  },
]

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
      <section className="relative z-10 bg-[#000000] flex flex-col items-center justify-center p-0 m-0">
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Desktop Video - full width, no side cropping, no padding */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="hidden md:block w-full block m-0 p-0"
            style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
          >
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-spinning-logo-XZLO4H7GbNnaHWswL1usoMwcDz1BxC.webm"
              type="video/webm"
            />
          </video>
          {/* Mobile Video - full width, no side cropping, no padding */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="md:hidden w-full block m-0 p-0"
            style={{ display: "block", margin: 0, padding: 0, lineHeight: 0 }}
          >
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-spinning-logo-mobile-B5Ux6Z3jjDeGS9yLxLpjnWgqMCCVYc.webm"
              type="video/webm"
            />
          </video>

          <h1
            className="text-3xl md:text-5xl text-[#FFFFFF] uppercase -mt-4 tracking-wide text-center"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            MANDY.GG
          </h1>
          <p
            className="text-sm md:text-base text-[#FFFFFF] mt-1 mb-0 text-center"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            {"Yes, I'm a girl... and I gamble."}
          </p>
        </div>
      </section>

      {/* ─── Cards Section (scrolls over holographic background) ─── */}
      <section className="relative z-10 pt-4 md:pt-6 pb-16 md:pb-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - REWARDS */}
            <div
              className="group bg-[#050505]/95 backdrop-blur-sm rounded-xl border border-white/20 p-6 md:p-8 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#CCFF00]/60"
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
              className="group bg-[#050505]/95 backdrop-blur-sm rounded-xl border border-white/20 p-6 md:p-8 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#3C7BFF]/60"
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
              className="group bg-[#050505]/95 backdrop-blur-sm rounded-xl border border-white/20 p-6 md:p-8 text-center flex flex-col items-center transition-all duration-500 hover:-translate-y-2 hover:scale-[1.03] hover:border-[#FF2FBF]/60"
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
      <section className="relative z-10 bg-[#000000] pt-16 pb-14 md:pt-24 md:pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
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
            <div className="text-center md:text-right flex-1">
              <p
                className="text-xl md:text-2xl text-[#FFFFFF] leading-snug"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 400 }}
              >
                Come play with me{" "}
                <br className="hidden md:block" />
                at Thrill!
              </p>
              <p
                className="text-base md:text-lg text-[#FFFFFF] mt-2 leading-snug italic"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 400 }}
              >
                {"(It's like Stake,"}
                <br />
                but with less Drake
                <br />
                {"and more bonuses!)"}
              </p>
              <div className="mt-6">
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

      {/* Ticker 3 */}
      <div className="relative z-10">
        <AnnouncementsTicker tickerKey="ticker_3_text" />
      </div>

      {/* ─── I'm Mandy, Section ─── */}
      <section className="relative z-10 bg-[#000000]/85 backdrop-blur-sm overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-16 pb-0 md:pt-24 md:pb-0">
          <div className="flex flex-col md:flex-row items-start gap-8 md:gap-0">
            {/* Left: text */}
            <div className="flex-1 relative z-10 md:pr-8">
              <h2
                className="text-4xl md:text-6xl text-[#CCFF00] mb-8"
                style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
              >
                {"I'm Mandy,"}
              </h2>
              <p
                className="text-sm md:text-base text-[#FFFFFF] leading-relaxed mb-4"
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

            {/* Right: portrait with blue glow */}
            <div className="flex-shrink-0 relative md:w-[400px] w-full flex justify-center md:justify-end">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none z-0"
                style={{
                  background: "radial-gradient(circle, rgba(42,105,219,0.6) 0%, rgba(42,105,219,0.3) 30%, rgba(42,105,219,0.1) 55%, transparent 75%)",
                  filter: "blur(30px)",
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

        {/* Holographic peek-through gap */}
        <div className="w-full h-[60px] md:h-[80px] -mt-[60px] md:-mt-[80px] relative z-0" />
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="relative z-10 bg-[#000000]/80 backdrop-blur-sm py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2
            className="text-2xl md:text-4xl text-[#FFFFFF] uppercase text-center mb-2"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <div className="w-24 h-0.5 bg-[#CCFF00] mx-auto mb-8 md:mb-12" />

          <div className="flex flex-col">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="border-b border-[#333]"
              >
                <button
                  className="w-full py-4 md:py-5 cursor-pointer text-left focus:outline-none flex justify-between items-center gap-4"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-content-${index}`}
                >
                  <h3
                    className="text-sm md:text-base text-[#FFFFFF] uppercase text-left"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 400 }}
                  >
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 flex-shrink-0 text-[#CCFF00] transition-transform duration-300 ${expandedFaq === index ? "rotate-180" : ""}`}
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
                    className="pb-4 md:pb-6"
                  >
                    <div
                      className="text-sm md:text-base text-[#FFFFFF] leading-relaxed"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {typeof faq.answer === "string" ? faq.answer : faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-14">
            <p
              className="text-lg md:text-2xl text-[#FFFFFF] mb-6 uppercase"
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
      <section className="relative z-10 py-10 md:py-14">
        <div className="flex justify-end items-center gap-4 md:gap-6 pr-6 md:pr-12">
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

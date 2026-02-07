"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import MailingListForm from "@/components/MailingListForm"
import { AnnouncementsTicker } from "@/components/announcements-ticker"
import { SiteNavigation } from "@/components/site-navigation"

export function Homepage() {
  const [scrollY, setScrollY] = useState(0)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-black font-sans">
      <AnnouncementsTicker />

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 90% 90%, rgba(99, 102, 241, ${0.1 + scrollY * 0.0002}) 0%, transparent 40%),
            radial-gradient(circle at 30% 70%, rgba(99, 102, 241, ${0.08 + scrollY * 0.0001}) 0%, transparent 30%),
            radial-gradient(circle at 70% 30%, rgba(129, 140, 248, ${0.06 + scrollY * 0.0001}) 0%, transparent 35%)
          `,
          transition: "background 0.3s ease",
        }}
      />

      <div className="relative z-10">
        <SiteNavigation currentPage="home" />

        <section className="relative w-full mb-2">
          <div className="w-full max-w-6xl mx-auto relative px-2 md:px-0">
            {/* Desktop Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="hidden md:block w-full h-auto
             max-h-[55vh] lg:max-h-[65vh] xl:max-h-[75vh]
             object-contain"
              preload="metadata"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_VIDEO_BANNER_FINAL-ptsvWmFNYXFpHriXVQD0mLp5P3ohqU.webm" type="video/webm" />
            </video>

            <video
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
              className="md:hidden w-full h-auto max-w-sm mx-auto object-contain rounded-lg"
              preload="metadata"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/THRILL%20MANDY%20BANNER%20%281000%20x%201000%20px-H2Ne4vrNsZwbdXNFBEbwqQ9puuiphM.MP4" type="video/mp4" />
            </video>
          </div>
        </section>

        <section className="py-2 px-2 text-center md:py-0">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-1 md:mb-2 uppercase tracking-wide">
              <span className="text-indigo-300 font-black text-6xl">MANDY.GG</span>
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-tight uppercase tracking-wider text-white font-light md:text-xl">
              YEAH, I'M A GIRL AND I GAMBLE.
            </p>
          </div>
        </section>

        <section className="py-3 px-3 md:py-[59px] my-2 md:my-5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
              <Card
                className={`p-3 md:p-6 lg:p-8 text-center relative rounded-xl md:rounded-2xl border border-white/30 overflow-visible transition-all duration-300 flex flex-col h-[320px] md:h-[400px] ${
                  hoveredCard === 1 ? "transform scale-105" : ""
                }`}
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    hoveredCard === 1
                      ? "0 20px 40px rgba(99, 102, 241, 0.4), 0 0 30px rgba(20, 184, 166, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)"
                      : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                }}
                onMouseEnter={() => setHoveredCard(1)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="mb-2 -mt-8 md:-mt-20 relative z-10">
                  <Image
                    src="/images/rewards-icon-new.webp"
                    alt="Rewards - Crypto Casino Bonuses"
                    width={200}
                    height={200}
                    className="mx-auto h-36 w-36 md:h-48 md:w-48 drop-shadow-2xl"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-white mb-0.5 md:mb-2 uppercase leading-tight">
                      Rewards
                    </h3>
                    <p className="text-gray-200 mb-2 md:mb-4 leading-tight text-xs md:text-base">
                      WANT MORE BONUSES? USE CODE: MANDY
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link href="/rewards">
                      <Button className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/30 uppercase text-xs md:text-lg py-2 md:py-3 w-full">
                        TELL ME MORE
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-3 md:p-6 lg:p-8 text-center relative rounded-xl md:rounded-2xl border border-white/30 overflow-visible transition-all duration-300 flex flex-col h-[320px] md:h-[400px] ${
                  hoveredCard === 2 ? "transform scale-105" : ""
                }`}
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    hoveredCard === 2
                      ? "0 20px 40px rgba(99, 102, 241, 0.4), 0 0 30px rgba(20, 184, 166, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)"
                      : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                }}
                onMouseEnter={() => setHoveredCard(2)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="mb-2 -mt-8 md:-mt-20 relative z-10">
                  <Image
                    src="/images/leaderboard-icon-new.webp"
                    alt="$3500 Weekly Leaderboard - Crypto Casino Competition"
                    width={200}
                    height={200}
                    className="mx-auto h-36 w-36 md:h-48 md:w-48 drop-shadow-2xl"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm md:text-xl lg:text-2xl font-bold text-white mb-0.5 md:mb-2 uppercase leading-tight">
                      $3500 WEEKLY RACE
                    </h3>
                    <p className="text-gray-200 mb-2 md:mb-4 leading-tight text-xs md:text-base">
                      FORGET MONTHLY LEADERBOARDS, WITH CODE MANDY YOU CAN WAGER TO WIN EVERY WEEK
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link href="/leaderboard">
                      <Button className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/30 uppercase text-xs md:text-lg py-2 md:py-3 w-full">
                        VIEW LEADERBOARD
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              <Card
                className={`p-3 md:p-6 lg:p-8 text-center relative rounded-xl md:rounded-2xl border border-white/30 overflow-visible transition-all duration-300 flex flex-col h-[320px] md:h-[400px] ${
                  hoveredCard === 3 ? "transform scale-105" : ""
                }`}
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  boxShadow:
                    hoveredCard === 3
                      ? "0 20px 40px rgba(99, 102, 241, 0.4), 0 0 30px rgba(20, 184, 166, 0.3), 0 0 60px rgba(99, 102, 241, 0.2)"
                      : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)",
                }}
                onMouseEnter={() => setHoveredCard(3)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="mb-2 -mt-8 md:-mt-20 relative z-10">
                  <Image
                    src="/images/connect-icon-new.webp"
                    alt="Connect - Join Crypto Casino Community"
                    width={200}
                    height={200}
                    className="mx-auto h-36 w-36 md:h-48 md:w-48 drop-shadow-2xl"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base md:text-2xl lg:text-3xl font-bold text-white mb-0.5 md:mb-2 uppercase leading-tight">
                      CONNECT
                    </h3>
                    <p className="text-gray-200 mb-2 md:mb-4 leading-tight text-xs md:text-base">JOIN THE CHAOS</p>
                  </div>
                  <div className="mt-auto">
                    <Link href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer">
                      <Button className="bg-indigo-400 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/30 uppercase text-xs md:text-lg py-2 md:py-3 w-full">
                        TELEGRAM
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Play at Thrill CTA */}
        <section className="py-6 px-4 md:py-10">
          <div className="max-w-2xl mx-auto text-center">
            <Link href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-black px-12 md:px-20 py-6 md:py-8 rounded-2xl transition-all duration-300 hover:scale-105 uppercase text-2xl md:text-4xl w-full sm:w-auto"
                style={{
                  boxShadow: "0 0 30px rgba(99, 102, 241, 0.5), 0 0 60px rgba(99, 102, 241, 0.25), 0 8px 32px rgba(0, 0, 0, 0.5)",
                }}
              >
                PLAY AT THRILL!
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-4 px-4 gap-px my-[-39px] md:py-[5px] mt-12 md:mt-0">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-4 md:mb-6 text-center uppercase">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <div className="space-y-3 md:space-y-4">
              {[
                {
                  question: "How can I get the best casino bonuses?",
                  answer: (
                    <span>
                      Sign up through{" "}
                      <Link
                        href="https://thrill.com/?r=MANDY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        Thrill.com
                      </Link>{" "}
                      with code <code className="bg-gray-800 px-1 rounded">MANDY</code> for exclusive perks, weekly
                      races, instant lossback, and VIP upgrades.
                    </span>
                  ),
                },
                {
                  question: "What's the best Stake alternative?",
                  answer: (
                    <span>
                      <Link
                        href="https://thrill.com/?r=MANDY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        Thrill
                      </Link>{" "}
                      offers the most generous bonuses and fastest payouts for crypto gamblers. You get extra rewards by
                      joining with code <code className="bg-gray-800 px-1 rounded">MANDY</code>.
                    </span>
                  ),
                },
                {
                  question: "Is lossback available instantly?",
                  answer: (
                    <span>
                      Yes! With Mandy.gg, you can request lossback on{" "}
                      <Link
                        href="https://thrill.com/?r=MANDY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        Thrill
                      </Link>{" "}
                      even without being VIP rank. Message{" "}
                      <Link
                        href="https://t.me/MandySupport_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        MandySupportBot
                      </Link>{" "}
                      on Telegram with your username.
                    </span>
                  ),
                },
                {
                  question: "HOW DO I CONTACT YOU?",
                  answer: (
                    <span>
                      Join the{" "}
                      <Link
                        href="https://t.me/mandycalmdown"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        official Telegram group
                      </Link>{" "}
                      first and follow the{" "}
                      <Link
                        href="https://t.me/mandyggannouncements"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        official Telegram channel
                      </Link>
                      . If you can't find your answer in the group, message the{" "}
                      <Link
                        href="https://t.me/MandySupport_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        MandySupport bot
                      </Link>
                      . Please do not DM me personally: personal messages go straight to the archive so I will not see
                      them.
                    </span>
                  ),
                },
                {
                  question: "WHAT PERKS COME WITH CODE MANDY?",
                  answer: (
                    <div>
                      <p className="mb-3">
                        Using code <code className="bg-gray-800 px-1 rounded">MANDY</code> gives you access to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 mb-3">
                        <li>
                          <strong>Weekly Leaderboard</strong>: Automatic entry into a weekly race with a $3,500 prize
                          pool. Bigger than many monthly races elsewhere.
                        </li>
                        <li>
                          <strong>Monthly Poker Tournament</strong>: Access to a poker tournament with a $1,000 prize
                          pool if you hit the $50,000 monthly wagering requirement.
                        </li>
                        <li>
                          <strong>Lossback</strong>: You can request lossback from day one. Most casinos only offer this
                          at higher VIP levels after millions wagered. To request, send a message to the{" "}
                          <Link
                            href="https://t.me/MandySupport_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:text-teal-300 underline"
                          >
                            Support Bot on Telegram
                          </Link>
                          .
                        </li>
                        <li>
                          <strong>Custom High Roller Benefits</strong>: If you are a high volume player, send a message
                          to the{" "}
                          <Link
                            href="https://t.me/MandySupport_bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:text-teal-300 underline"
                          >
                            MandySupportBot
                          </Link>{" "}
                          and let's put together your perfect VIP package.
                        </li>
                        <li>
                          <strong>Wager Targets</strong>: We can set personal targets with cash bonuses after
                          completion.
                        </li>
                        <li>
                          <strong>Events</strong>: Join the{" "}
                          <Link
                            href="https://t.me/mandycalmdown"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-400 hover:text-teal-300 underline"
                          >
                            Telegram
                          </Link>{" "}
                          and get notified for different events that always include awesome cash prizes.
                        </li>
                      </ul>
                      <p className="mb-2">
                        <strong>More Stuff:</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 mb-3">
                        <li>
                          <strong>Random Poker Games + Crypto Drops</strong> in the Telegram group. Use the command{" "}
                          <code className="bg-gray-800 px-1 rounded">!mandywallet</code> in the group for details on how
                          to claim, withdraw, or even do your own drops.
                        </li>
                        <li>
                          <strong>Cashdrop codes a few times a week</strong> for eligible players who meet the wagering
                          requirement.
                        </li>
                        <li>
                          <strong>Trivia, roll hunts, and whatever else I come up with.</strong> I enjoy hanging out
                          with you weirdos so I like to make it a fun time.
                        </li>
                      </ul>
                      <p className="text-sm italic bg-gray-800/50 p-2 rounded">
                        <strong>Reminder on bonuses and rewards:</strong> Think of them as a small rebate for play
                        you're already planning to do, not a way to profit. You'll almost always lose money on the way
                        to earning them; they're just nice extras for regulars.
                      </p>
                    </div>
                  ),
                },
                {
                  question: "WHAT CASINO IS THE BEST?",
                  answer: (
                    <span>
                      Currently your best option is{" "}
                      <Link
                        href="https://thrill.com/?r=MANDY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        Thrill
                      </Link>
                      . Hands down. It's new so they are eager and the bonuses are boosted, but it's been well vetted
                      and they are very reliable. You'll get the best deal by signing up with code{" "}
                      <code className="bg-gray-800 px-1 rounded">MANDY</code> at{" "}
                      <Link
                        href="https://thrill.com/?r=MANDY"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        Thrill
                      </Link>
                      .
                    </span>
                  ),
                },
                {
                  question: "HOW DO I KNOW IF I USED CODE MANDY?",
                  answer: (
                    <span>
                      Ask support in the live chat or check your profile page. It will show "Referred by: mandycalmdown"
                      but do it within 24 hours of signing up. After that, you can't add or change a referral code.
                    </span>
                  ),
                },
                {
                  question: "I USED YOUR CODE AT THRILL AND I NEED LOSSBACK.",
                  answer: (
                    <span>
                      Send a message to{" "}
                      <Link
                        href="https://t.me/MandySupport_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        t.me/MandySupport_bot
                      </Link>{" "}
                      with your Thrill username and a screenshot of your most recent deposit page.
                    </span>
                  ),
                },
                {
                  question: "WHEN I GO TO THE CASINO WEBSITE IT SAYS MY LOCATION IS BLOCKED.",
                  answer:
                    "Many people prefer to keep their degen lives private and use a VPN to mask their location. Check out VPN tutorials online for guidance on getting started.",
                },
                {
                  question: "ARE THESE CASINOS REAL? WILL THEY SCAM ME?",
                  answer:
                    "Any casino listed on Mandy.gg has been vetted by me. If you're not breaking the terms of service or abusing promos or alts, you should have no issues withdrawing your winnings.",
                },
                {
                  question: "I DON'T USE TELEGRAM. WHAT SHOULD I DO?",
                  answer: (
                    <span>
                      You should download{" "}
                      <Link
                        href="https://telegram.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 underline"
                      >
                        Telegram
                      </Link>{" "}
                      and start using it if you don't want to miss events or payouts for leaderboard wins. Right now,
                      it's the best way to communicate and connect with the community.
                    </span>
                  ),
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="rounded-xl border border-white/30 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]"
                  style={{
                    backgroundColor: "rgba(10, 10, 10, 0.95)",
                    boxShadow:
                      index % 2 === 0
                        ? "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(20, 184, 166, 0.15), 0 0 40px rgba(99, 102, 241, 0.1)"
                        : "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15), 0 0 40px rgba(20, 184, 166, 0.1)",
                  }}
                >
                  <button
                    className="w-full px-4 md:px-4 py-1 md:py-1 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    aria-expanded={expandedFaq === index}
                    aria-controls={`faq-content-${index}`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-white uppercase text-left text-lg md:text-xl pr-4">
                        {faq.question}
                      </h3>
                      <span
                        className="text-2xl md:text-3xl transition-transform duration-300 text-primary flex-shrink-0"
                        style={{
                          transform: expandedFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        ↓
                      </span>
                    </div>
                    {expandedFaq === index && (
                      <div id={`faq-content-${index}`} className="mt-1 md:mt-1 pt-1 border-t border-white/20">
                        <div className="text-gray-200 text-left text-base md:text-lg lg:text-xl leading-relaxed pb-1">
                          {typeof faq.answer === "string" ? faq.answer : faq.answer}
                        </div>
                      </div>
                    )}
                  </button>
                </Card>
              ))}
            </div>
            <div className="text-center mt-6 md:mt-8">
              <p className="text-xl md:text-2xl lg:text-4xl mb-4 uppercase font-black text-indigo-200 md:mb-[-14px]">
                JOIN OUR COMMUNITY ON TELEGRAM TO UNLOCK ALL BENEFITS.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center my-7">
                <Link href="https://t.me/Mandythrill" target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="hover:bg-indigo-500 text-white font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-400/30 uppercase text-lg md:text-xl lg:text-2xl bg-indigo-400 w-full sm:w-auto"
                  >
                    JOIN TELEGRAM
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

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

              <MailingListForm />

              <p className="text-sm md:text-base text-gray-300 mb-2 uppercase leading-relaxed mt-6">
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

"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface RaffleWinner {
  raffle_date: string
  winning_ticket_number: number
  prize_amount: number
  prize_description: string
  claimed: boolean
  username: string
}

function getTimeUntilMidnightUTC(): { hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0))
  const diff = tomorrow.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  return { hours, minutes, seconds }
}

interface DailyRaffleProps {
  winners?: RaffleWinner[]
}

export function DailyRaffle({ winners: externalWinners }: DailyRaffleProps) {
  const [countdown, setCountdown] = useState(getTimeUntilMidnightUTC())
  const [recentWinners, setRecentWinners] = useState<RaffleWinner[]>(externalWinners || [])
  const [showPreviousWinners, setShowPreviousWinners] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnightUTC())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (externalWinners && externalWinners.length > 0) {
      setRecentWinners(externalWinners)
      return
    }
    fetch("/api/raffle/winners")
      .then((res) => res.json())
      .then((data) => {
        if (data.winners) setRecentWinners(data.winners)
      })
      .catch(console.error)
  }, [externalWinners])

  const pad = (n: number) => String(n).padStart(2, "0")

  const latestWinner = recentWinners.length > 0 ? recentWinners[0] : null
  const previousWinners = recentWinners.slice(1)

  return (
    <div id="raffle" className="max-w-4xl mx-auto mt-10 md:mt-14 px-2 md:px-0">
      {/* Raffle ticket image - half hanging off the top */}
      <div className="relative">
        <div className="flex justify-center -mb-16 md:-mb-20 relative z-10">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mandy-gg-icon-raffle-ticket-TQblBLgG4Hhz4PwIQ67HCpnm67QoDO.webp"
            alt="Raffle Ticket"
            className="w-56 md:w-72 h-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        <div className="bg-[#000000] rounded-xl border border-white/20 pt-20 md:pt-24 px-4 md:px-6 pb-4 md:pb-6 transition-all duration-500 hover:border-[#CCFF00]/60 hover:shadow-[0_0_25px_rgba(204,255,0,0.1)]">
          <h2
            className="text-2xl md:text-3xl text-[#CCFF00] uppercase text-center mb-4"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            $50 DEGEN OF THE DAY RAFFLE
          </h2>

          {/* Raffle Begins Notice */}
          <p
            className="text-sm md:text-base text-[#FFFFFF] text-center mb-6"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
          >
            RAFFLE BEGINS MARCH 1{" "}
            <span className="text-[#CCFF00]">
              (first drawing will be at 00:00:00 UTC on MARCH 2ND)
            </span>
          </p>

          {/* Raffle Winner Section */}
          <div className="bg-[#000000] rounded-lg p-6 md:p-8 mb-4">
            <h3
              className="text-base md:text-lg text-[#CCFF00] uppercase mb-4 tracking-wider"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
            >
              RAFFLE WINNER:
            </h3>

            {latestWinner ? (
              <div>
                <p
                  className="text-sm md:text-base text-[#CCFF00] uppercase mb-1"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {latestWinner.raffle_date}
                </p>
                <p
                  className="text-xl md:text-2xl text-[#FFFFFF] mb-3"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                >
                  {latestWinner.username}{" "}
                  <span className="text-[#CCFF00]">(Ticket #{latestWinner.winning_ticket_number})</span>
                </p>
                <p
                  className="text-sm md:text-base text-[#FFFFFF] mb-4"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  Prize: <span className="text-[#CCFF00]">${latestWinner.prize_amount}</span>{" "}
                  {latestWinner.claimed ? (
                    <span className="text-[#CCFF00]">- CLAIMED</span>
                  ) : (
                    <span className="text-[#FF2F8B]">- UNCLAIMED</span>
                  )}
                </p>

                {previousWinners.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowPreviousWinners(!showPreviousWinners)}
                      className="flex items-center gap-2 text-sm text-[#CCFF00] hover:text-[#FFFFFF] transition-colors uppercase"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      Click here to see previous winners
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${showPreviousWinners ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showPreviousWinners && (
                      <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
                        {previousWinners.map((winner) => (
                          <div
                            key={winner.raffle_date}
                            className="flex items-center justify-between py-1.5"
                            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-[#CCFF00]">{winner.raffle_date}</span>
                              <span className="text-base text-[#FFFFFF]">
                                {winner.username}{" "}
                                <span className="text-[#CCFF00]">(#{winner.winning_ticket_number})</span>
                              </span>
                            </div>
                            <span className={`text-sm ${winner.claimed ? "text-[#CCFF00]" : "text-[#FF2F8B]"}`}>
                              {winner.claimed ? "CLAIMED" : "UNCLAIMED"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10">
                  <p
                    className="text-sm md:text-base text-[#FFFFFF]"
                    style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                  >
                    Won the raffle? Message the{" "}
                    <a
                      href="https://t.me/mandysupport_bot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#CCFF00] hover:underline"
                    >
                      Mandy Support Bot on Telegram
                    </a>{" "}
                    to claim your prize within 7 days.
                  </p>
                </div>
              </div>
            ) : (
              <p
                className="text-base text-[#FFFFFF]"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                No winners drawn yet. Check back after the first daily draw!
              </p>
            )}
          </div>

          {/* Countdown with colons */}
          <div className="text-center mb-4">
            <p
              className="text-base md:text-lg text-[#FFFFFF] uppercase mb-2"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
            >
              NEXT DRAW IN
            </p>
            <div className="flex justify-center items-center gap-1">
              {[
                { val: pad(countdown.hours), label: "HRS" },
                { val: pad(countdown.minutes), label: "MIN" },
                { val: pad(countdown.seconds), label: "SEC" },
              ].map((item, idx) => (
                <div key={item.label} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <span
                      className="text-3xl md:text-4xl text-[#CCFF00] tabular-nums"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                    >
                      {item.val}
                    </span>
                    <span
                      className="text-sm text-[#FFFFFF] mt-1"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                    >
                      {item.label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <span
                      className="text-2xl md:text-3xl text-[#FFFFFF]/50 mx-2 -mt-4"
                      style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                    >
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-[#000000] rounded-lg p-6 md:p-8 mb-4">
            <div
              className="text-base md:text-lg text-[#FFFFFF] leading-relaxed space-y-2"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              <p className="text-[#CCFF00] uppercase text-sm md:text-base font-bold mb-3">How it works:</p>
              <p>Every <span className="text-[#CCFF00]">$500</span> wagered on Thrill = <span className="text-[#CCFF00]">1 raffle ticket</span></p>
              <p><span className="text-[#CCFF00]">1 winner</span> receives <span className="text-[#CCFF00]">$50</span> every day</p>
              <p>Winner drawn daily at <span className="text-[#CCFF00]">00:00:00 UTC</span></p>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[#000000] rounded-lg p-6 md:p-8">
            <p
              className="text-[#CCFF00] uppercase text-sm md:text-base font-bold mb-3"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              Rules:
            </p>
            <ol
              className="text-sm md:text-base text-[#FFFFFF] space-y-2 list-decimal list-inside"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              <li>
                Must be registered on Thrill.com under code:{" "}
                <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a>
              </li>
              <li>$500 USD wager = 1 raffle ticket</li>
              <li>1 winner drawn at 00:00:00 UTC for the previous 24 hours</li>
              <li>
                Message the{" "}
                <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline">
                  Mandy Support Bot on Telegram
                </a>
                {" "}to claim raffle prizes
              </li>
              <li>Winnings must be claimed within 7 days or they are forfeited</li>
              <li>Prizes may take up to 72 hours to be sent out</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

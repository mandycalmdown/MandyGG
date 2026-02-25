"use client"

import { useState, useEffect } from "react"

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

export function DailyRaffle() {
  const [countdown, setCountdown] = useState(getTimeUntilMidnightUTC())
  const [recentWinners, setRecentWinners] = useState<RaffleWinner[]>([])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnightUTC())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch("/api/raffle/winners")
      .then((res) => res.json())
      .then((data) => {
        if (data.winners) setRecentWinners(data.winners)
      })
      .catch(console.error)
  }, [])

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <div className="max-w-4xl mx-auto mt-10 md:mt-14 px-2 md:px-0">
      <h2
        className="text-xl md:text-2xl text-[#FFFFFF] uppercase mb-6 text-center"
        style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
      >
        DAILY RAFFLE
      </h2>

      {/* Raffle Info Card */}
      <div
        className="bg-[#000000] rounded-xl border border-white/20 p-6 md:p-8 mb-6 transition-all duration-500 hover:border-[#CCFF00]/40"
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}
      >
        {/* Countdown */}
        <div className="text-center mb-6">
          <p
            className="text-sm text-[#FFFFFF]/60 uppercase mb-2"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
          >
            NEXT DRAW IN
          </p>
          <div className="flex justify-center gap-3">
            {[
              { val: pad(countdown.hours), label: "HRS" },
              { val: pad(countdown.minutes), label: "MIN" },
              { val: pad(countdown.seconds), label: "SEC" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <span
                  className="text-3xl md:text-4xl text-[#CCFF00] tabular-nums"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700 }}
                >
                  {item.val}
                </span>
                <span
                  className="text-xs text-[#FFFFFF]/40 mt-1"
                  style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div
          className="text-sm text-[#FFFFFF]/80 leading-relaxed space-y-1.5 mb-6"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          <p className="text-[#CCFF00] uppercase text-xs font-bold mb-2">How it works:</p>
          <p>Every <span className="text-[#CCFF00]">$1,000</span> wagered on Thrill = <span className="text-[#CCFF00]">1 raffle ticket</span></p>
          <p>One winner drawn daily at <span className="text-[#CCFF00]">00:00:00 UTC</span></p>
        </div>

        {/* Rules */}
        <div
          className="bg-[#0a0a0a] rounded-lg border border-white/10 p-4"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
        >
          <p className="text-[#CCFF00] uppercase text-xs font-bold mb-3">Rules:</p>
          <ol className="text-xs text-[#FFFFFF]/70 space-y-2 list-decimal list-inside">
            <li>
              Must be registered on Thrill.com under code:{" "}
              <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#CCFF00] hover:underline font-bold">MANDY</a>
            </li>
            <li>$1,000 USD wager = 1 raffle ticket</li>
            <li>1 winner drawn at 00:00:00 UTC for the previous 24 hours</li>
            <li>
              Message the{" "}
              <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="text-[#2A69DB] hover:underline">
                Mandy Support Bot on Telegram
              </a>
              {" "}to claim raffle prizes
            </li>
            <li>Winnings must be claimed within 7 days or they are forfeited</li>
            <li>Prizes may take up to 72 hours to be sent out</li>
          </ol>
        </div>
      </div>

      {/* Recent Winners */}
      {recentWinners.length > 0 && (
        <div
          className="bg-[#000000] rounded-xl border border-white/20 p-6 transition-all duration-500 hover:border-[#CCFF00]/40"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}
        >
          <h3
            className="text-sm text-[#FFFFFF] uppercase mb-4"
            style={{ fontFamily: "var(--font-poppins), sans-serif", fontWeight: 700 }}
          >
            RECENT WINNERS
          </h3>
          <div className="space-y-2">
            {recentWinners.map((winner) => (
              <div
                key={winner.raffle_date}
                className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#FFFFFF]/50">{winner.raffle_date}</span>
                  <span className="text-sm text-[#FFFFFF]">{winner.username}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#FFFFFF]/50">Ticket #{winner.winning_ticket_number}</span>
                  {winner.claimed ? (
                    <span className="text-xs text-[#CCFF00]">CLAIMED</span>
                  ) : (
                    <span className="text-xs text-[#FF2F8B]">UNCLAIMED</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ChristmasNavigation } from "@/components/christmas-navigation"
import { createBrowserClient } from "@supabase/ssr"

const VIDEO_BG_URL = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_CHRISTMAS_VIDBACKGROUND-8pgO9cupxa5pluI1EVxMMBpNZ0RfZU.mp4"
const LOGO_URL = "/images/mandygg-christmas-logo.webp"

interface AdventGift {
  id: string
  day: number
  title: string
  description: string
  reward: string
  image_url?: string
}

function Snowflake({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-10 select-none"
      style={{ ...style, color: "rgba(255, 215, 0, 0.2)" }}
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: "100vh",
        opacity: [0, 0.4, 0.4, 0],
        x: [0, 10, -10, 0],
      }}
      transition={{
        duration: Math.random() * 15 + 15,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
    >
      ✦
    </motion.div>
  )
}

function AdventCard({
  day,
  isOpen,
  onOpen,
  canOpen,
  isLocked,
  isPastDay,
  glowColor,
  tintColor,
  hasSparkle,
}: {
  day: number
  isOpen: boolean
  onOpen: () => void
  canOpen: boolean
  isLocked: boolean
  isPastDay: boolean
  glowColor: "gold" | "red"
  tintColor: "green" | "red" | "gold"
  hasSparkle: boolean
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    if (isLocked) return

    // If already opened or past day, just trigger onOpen to show modal
    if (isOpen || isPastDay) {
      onOpen()
      return
    }

    if (!canOpen) return
    if (!isFlipped) {
      setIsFlipped(true)
      setTimeout(() => onOpen(), 300)
    }
  }

  const getTintBackground = () => {
    // Greyed out for opened days
    if (isOpen) {
      return "rgba(30, 30, 30, 0.85), rgba(50, 50, 50, 0.4)"
    }
    switch (tintColor) {
      case "green":
        return "rgba(0, 0, 0, 0.65), rgba(22, 101, 52, 0.08)"
      case "red":
        return "rgba(0, 0, 0, 0.65), rgba(153, 27, 27, 0.1)"
      case "gold":
      default:
        return "rgba(0, 0, 0, 0.65), rgba(180, 130, 50, 0.06)"
    }
  }

  return (
    <motion.div
      className="relative w-full aspect-square cursor-pointer"
      style={{ perspective: "1000px" }}
      whileHover={!isLocked ? { scale: 1.05, y: -4 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={handleClick}
      role="button"
      aria-label={`Day ${day} advent gift${isLocked ? " - locked" : isOpen ? " - opened" : ""}`}
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* Glow behind card - only for available unopened cards */}
      {canOpen && !isLocked && !isOpen && (
        <div
          className="absolute -inset-3 rounded-2xl pointer-events-none"
          style={{
            background:
              glowColor === "red"
                ? `radial-gradient(circle, rgba(185, 28, 28, 0.4) 0%, transparent 70%)`
                : `radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, transparent 70%)`,
            filter: "blur(16px)",
            zIndex: -1,
          }}
        />
      )}

      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped || isOpen ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 rounded-xl flex items-end justify-end p-2 md:p-3 ${isOpen ? "opacity-50" : ""}`}
          style={{
            backfaceVisibility: "hidden",
            background: `linear-gradient(135deg, ${getTintBackground()})`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: isOpen ? "1.5px solid rgba(100, 100, 100, 0.2)" : "1.5px solid rgba(255, 255, 255, 0.12)",
            boxShadow: isOpen ? "0 4px 16px rgba(0, 0, 0, 0.3)" : "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          {hasSparkle && !isOpen && (
            <span className="absolute top-2 left-2 text-xs md:text-sm" style={{ color: "rgba(255, 215, 0, 0.5)" }}>
              ✦
            </span>
          )}

          <span
            className="font-bold text-3xl md:text-5xl"
            style={{
              color: isOpen ? "#555" : "#991B1B",
              textShadow: isOpen ? "none" : "0 2px 4px rgba(0, 0, 0, 0.6)",
            }}
          >
            {day}
          </span>

          {/* Locked indicator for future days */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 text-2xl" aria-hidden="true">
                🔒
              </span>
            </div>
          )}

          {/* Opened checkmark */}
          {isOpen && (
            <div className="absolute top-2 right-2">
              <span className="text-green-500/60 text-lg" aria-hidden="true">
                ✓
              </span>
            </div>
          )}
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: isOpen
              ? "linear-gradient(135deg, rgba(80, 80, 80, 0.3) 0%, rgba(40, 40, 40, 0.8) 100%)"
              : "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)",
            border: isOpen ? "1.5px solid rgba(100, 100, 100, 0.2)" : "1.5px solid rgba(212, 175, 55, 0.3)",
          }}
        >
          <span className={`text-3xl ${isOpen ? "opacity-50" : ""}`} aria-hidden="true">
            🎁
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

function DayModal({
  gift,
  isOpen,
  onClose,
  isPastDay,
  currentDay,
}: {
  gift: AdventGift | null
  isOpen: boolean
  onClose: () => void
  isPastDay: boolean
  currentDay: number
}) {
  if (!gift) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            className="relative w-full max-w-md rounded-2xl p-6 text-center max-h-[90vh] overflow-y-auto"
            style={{
              background: "linear-gradient(180deg, rgba(20, 20, 20, 0.98) 0%, rgba(10, 10, 10, 0.98) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              boxShadow: "0 0 60px rgba(212, 175, 55, 0.15)",
            }}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              className="text-5xl mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              aria-hidden="true"
            >
              🎁
            </motion.div>

            <h2
              id="modal-title"
              className="text-4xl font-bold mb-2"
              style={{
                color: "#D4AF37",
                textShadow: "0 0 20px rgba(212, 175, 55, 0.4)",
              }}
            >
              Day {gift.day}
            </h2>

            {isPastDay && gift.day < currentDay && (
              <p className="text-red-400/80 text-sm mb-3 italic">
                This gift has expired. The reward is no longer available.
              </p>
            )}

            <h3 className="text-xl font-semibold text-white mb-4">{gift.title}</h3>

            <p className="text-gray-400 mb-6 whitespace-pre-line">{gift.description}</p>

            {gift.image_url && (
              <img
                src={gift.image_url || "/placeholder.svg"}
                alt={gift.title}
                className="w-full max-h-48 object-contain rounded-lg mb-4"
                loading="lazy"
              />
            )}

            <Card
              className={`p-4 mb-6 ${isPastDay && gift.day < currentDay ? "opacity-50" : ""}`}
              style={{
                background: "rgba(212, 175, 55, 0.05)",
                borderColor: "rgba(212, 175, 55, 0.15)",
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-amber-500/60" aria-hidden="true">
                  ✦
                </span>
                <span
                  className={`font-medium ${isPastDay && gift.day < currentDay ? "text-gray-500 line-through" : "text-white"}`}
                >
                  {gift.reward}
                </span>
                <span className="text-amber-500/60" aria-hidden="true">
                  ✦
                </span>
              </div>
            </Card>

            <Button
              onClick={onClose}
              className="w-full font-bold rounded-xl transition-all duration-300 hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #D4AF37 0%, #996515 100%)",
                color: "#0d0d0d",
              }}
            >
              {isPastDay && gift.day < currentDay ? "GOT IT" : "AWESOME!"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ChristmasAdventCalendar() {
  const [gifts, setGifts] = useState<AdventGift[]>([])
  const [openedDays, setOpenedDays] = useState<number[]>([])
  const [selectedGift, setSelectedGift] = useState<AdventGift | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [supabase])

  // Fetch gifts and opened days
  const fetchGifts = useCallback(async () => {
    try {
      const url = userId ? `/api/advent-gifts?userId=${userId}` : `/api/advent-gifts`
      const response = await fetch(url)
      const data = await response.json()

      if (data.gifts) {
        setGifts(data.gifts)
      }
      if (data.openedDays) {
        setOpenedDays(data.openedDays)
      }
    } catch (error) {
      console.error("Error fetching gifts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchGifts()
  }, [fetchGifts])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Get current day in UTC (December only)
  const getCurrentDayUTC = () => {
    const now = new Date()
    const utcMonth = now.getUTCMonth()
    const utcDay = now.getUTCDate()
    // Only return day number if we're in December 2025
    if (utcMonth === 11) {
      return utcDay
    }
    return 0 // Before December
  }

  const currentDay = getCurrentDayUTC()

  const handleOpenDay = async (day: number) => {
    const gift = gifts.find((g) => g.day === day)
    if (!gift) return

    // If not already opened and user is logged in, record the open
    if (!openedDays.includes(day) && userId) {
      try {
        await fetch("/api/advent-gifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "open", day, userId }),
        })
        setOpenedDays([...openedDays, day])
      } catch (error) {
        console.error("Error recording open:", error)
      }
    } else if (!openedDays.includes(day)) {
      // For non-logged in users, just track locally
      setOpenedDays([...openedDays, day])
    }

    // Always show the gift modal (even for past/opened days)
    setSelectedGift(gift)
  }

  const canOpenDay = (day: number) => {
    // Can open if the day is <= current UTC day in December
    return day <= currentDay
  }

  const isLockedDay = (day: number) => {
    // Locked if day is in the future
    return day > currentDay
  }

  const isPastDay = (day: number) => {
    return day < currentDay
  }

  const redGlowDays = [5, 12, 19, 24]

  const getTintColor = (day: number): "green" | "red" | "gold" => {
    const greenDays = [1, 4, 8, 11, 15, 18, 22]
    const redDays = [3, 7, 10, 14, 17, 21, 24]
    if (greenDays.includes(day)) return "green"
    if (redDays.includes(day)) return "red"
    return "gold"
  }

  const sparkleDays = [2, 6, 9, 13, 16, 20, 23, 24]

  const snowflakes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      fontSize: `${Math.random() * 8 + 6}px`,
      animationDelay: `${Math.random() * 10}s`,
    },
  }))

  return (
    <div className="min-h-screen bg-black font-sans overflow-hidden relative">
      <video
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0 opacity-40"
        preload="metadata"
        onLoadedData={() => setVideoLoaded(true)}
        onError={() => {}}
      >
        <source src={VIDEO_BG_URL} type="video/mp4" />
      </video>

      {!videoLoaded && (
        <div
          className="fixed inset-0 z-0"
          style={{
            background: "radial-gradient(ellipse at center, #1a1a1a 0%, #000000 100%)",
          }}
        />
      )}

      {snowflakes.map((flake) => (
        <Snowflake key={flake.id} style={flake.style} />
      ))}

      <ChristmasNavigation />

      <main className="relative z-10 pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={LOGO_URL || "/placeholder.svg"}
              alt="Mandy Christmas Advent Calendar"
              className="mx-auto w-auto h-auto max-w-[90%] md:max-w-[600px]"
              loading="eager"
            />
          </motion.div>

          <motion.div
            className="text-center mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="sr-only">Mandy Christmas Advent Calendar - Daily Rewards</h1>
            <h2 className="text-lg md:text-xl font-semibold mb-2" style={{ color: "#D4AF37" }}>
              How It Works
            </h2>
            <p className="text-white text-sm md:text-base leading-relaxed">
              Open a new gift every day in December and enjoy! You must be under code{" "}
              <span style={{ color: "#D4AF37" }} className="font-semibold">
                MANDY
              </span>{" "}
              to participate. Gifts must be opened on the day they are available and will expire when the next day's
              gift is opened.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading advent calendar...</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-4 sm:grid-cols-6 gap-3 md:gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              role="list"
              aria-label="Advent calendar days"
            >
              {Array.from({ length: 24 }, (_, i) => i + 1).map((day) => (
                <AdventCard
                  key={day}
                  day={day}
                  isOpen={openedDays.includes(day)}
                  onOpen={() => handleOpenDay(day)}
                  canOpen={canOpenDay(day)}
                  isLocked={isLockedDay(day)}
                  isPastDay={isPastDay(day)}
                  glowColor={redGlowDays.includes(day) ? "red" : "gold"}
                  tintColor={getTintColor(day)}
                  hasSparkle={sparkleDays.includes(day)}
                />
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <DayModal
        gift={selectedGift}
        isOpen={!!selectedGift}
        onClose={() => setSelectedGift(null)}
        isPastDay={selectedGift ? isPastDay(selectedGift.day) : false}
        currentDay={currentDay}
      />
    </div>
  )
}

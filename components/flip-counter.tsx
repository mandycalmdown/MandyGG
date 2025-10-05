"use client"

import { useState, useEffect } from "react"

interface FlipCounterProps {
  value: number
  digits?: number
  className?: string
}

export function FlipCounter({ value, digits = 2, className = "" }: FlipCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setIsFlipping(true)
      const timer = setTimeout(() => {
        setDisplayValue(value)
        setIsFlipping(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [value, displayValue])

  const formatValue = (num: number) => {
    return num.toString().padStart(digits, "0")
  }

  const digitArray = formatValue(displayValue).split("")

  return (
    <div className={`flex gap-1 ${className}`}>
      {digitArray.map((digit, index) => (
        <div
          key={index}
          className={`
            flip-digit bg-card rounded-md
            ${className === "mobile-countdown" ? "w-8 h-10 text-lg" : "w-10 h-14"} 
            md:w-14 md:h-20 flex items-center justify-center
            ${className === "mobile-countdown" ? "text-lg" : "text-xl"} md:text-3xl font-bold text-foreground
            shadow-lg relative overflow-hidden
            ${isFlipping ? "flip-animation" : ""}
          `}
          style={{
            border: "0.5px solid white",
          }}
        >
          <div className="flip-card-inner">
            <div className="flip-card-front">{digit}</div>
            <div className="flip-card-back">{digit}</div>
          </div>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-600 z-10"></div>
        </div>
      ))}
    </div>
  )
}

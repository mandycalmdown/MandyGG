/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import "@/styles/FlipCountdown.css";

function FlipDigit({ value }: { value: number }) {
  const [curr, setCurr] = useState(value);
  const [prev, setPrev] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === curr) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setPrev(curr);
    setFlipping(true);
    timerRef.current = setTimeout(() => {
      setCurr(value);
      setFlipping(false);
    }, 500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value]);

  return (
    <div className="fu">
      <div className="fu-top">
        <div className="fu-num fu-num-top">{curr}</div>
      </div>
      <div className="fu-bottom">
        <div className="fu-num fu-num-bottom">{flipping ? prev : curr}</div>
      </div>
      {flipping && (
        <div className="fu-flap">
          <div className="fu-flap-front">
            <div className="fu-num fu-num-top">{prev}</div>
          </div>
          <div className="fu-flap-back">
            <div className="fu-num fu-num-bottom">{curr}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlipDigitPair({ value, label }: { value: string; label: string }) {
  const digits = value.padStart(2, "0").split("").map(Number);
  return (
    <div className="flip-digit-group">
      <div className="flip-units">
        {digits.map((digit, i) => (
          <FlipDigit key={i} value={digit} />
        ))}
      </div>
      <div className="flip-label">{label}</div>
    </div>
  );
}

export default function FlipCountdown({ timeString }: { timeString: string }) {
  const parts = timeString.split(":");
  return (
    <div className="flip-countdown">
      <FlipDigitPair value={parts[0] || "00"} label="DAYS" />
      <div className="flip-separator">:</div>
      <FlipDigitPair value={parts[1] || "00"} label="HOURS" />
      <div className="flip-separator">:</div>
      <FlipDigitPair value={parts[2] || "00"} label="MINS" />
      <div className="flip-separator">:</div>
      <FlipDigitPair value={parts[3] || "00"} label="SECS" />
    </div>
  );
}

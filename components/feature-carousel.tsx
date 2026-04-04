"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm";
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4";

const CARDS = [
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DICE_FLOATING_ELEMENT-fgALe6PAlQzuWKZm0dVQuq22ma8BCW.webp",
    title: "THRILL",
    desc: "IT'S LIKE STEAK BUT WITH LESS DRAMA. AND BETTER REWARDS.",
    btn: { label: "TELL ME MORE", href: "https://thrill.com/?r=MANDY", ext: true },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY_FLOATING_ELEMENT-w5rK7kUzPbLQI1Y57CPnQijedQdozJ.webp",
    title: "$3500 WEEKLY RACE",
    desc: "FORGET MONTHLY LEADERBOARDS, GET CODE MANDY FOR CASH WAGER TO WIN EVERY WEEK!",
    btn: { label: "VIEW LEADERBOARD", href: "/leaderboard", ext: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TOOLS_ICON-NePfAoiUJsdObxpNYghwB6YkR9rz3I.webp",
    title: "DEGEN DASHBOARD",
    desc: "TRACK YOUR STATS, MONITOR YOUR PROGRESS, AND LEVEL UP YOUR GAME.",
    btn: { label: "VIEW DASHBOARD", href: "/auth/login", ext: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GIFT_FLOATING_ELEMENT-0kSS0Tl60Pg4YLQgNErd978xuRkLro.webp",
    title: "REWARDS",
    desc: "UNLOCK EXCLUSIVE PERKS, BONUSES, AND CASHBACK — LOYALTY PAYS BETTER HERE.",
    btn: { label: "VIEW REWARDS", href: "/rewards", ext: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POKER_CHIP_MANDYGG-fIvqIhEVsgRxMiDWG7fM6VkuB83oMD.webp",
    title: "POKER NIGHT",
    desc: "CHECK YOUR PROGRESS TO SEE IF YOU QUALIFY.",
    btn: { label: "OPEN DASHBOARD", href: "/auth/login", ext: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAFFLE_ICON-SF5pASQFbCQNovVoLJSAgFECO.webp",
    title: "WEEKLY RAFFLE",
    desc: "WAGER TO EARN TICKETS. $250 WINNER DRAWN EVERY FRIDAY.",
    btn: { label: "VIEW RAFFLE", href: "/leaderboard#raffle", ext: false },
  },
] as const;

const TOTAL = CARDS.length;

function HoloButton({ href, ext, children }: { href: string; ext: boolean; children: React.ReactNode }) {
  const inner = (
    <>
      <video autoPlay loop muted playsInline aria-hidden="true" className="holo-btn__video">
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4}  type="video/mp4" />
      </video>
      <span className="holo-btn__label">{children}</span>
    </>
  );
  if (ext) return <a href={href} target="_blank" rel="noopener noreferrer" className="holo-button card-btn">{inner}</a>;
  return <Link href={href} className="holo-button card-btn">{inner}</Link>;
}

/* Returns the scale / opacity / z-index for a card at `offset` slots from center */
function getCardStyle(offset: number): React.CSSProperties {
  const abs = Math.abs(offset);
  const scale   = abs === 0 ? 1 : abs === 1 ? 0.84 : 0.70;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.80 : 0.55;
  const zIndex  = abs === 0 ? 10 : abs === 1 ? 6 : 3;
  const tx      = offset * 96; // % offset so side cards peek out
  return {
    transform: `translateX(${tx}%) scale(${scale})`,
    opacity,
    zIndex,
    transition: "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s cubic-bezier(0.25,0.46,0.45,0.94)",
  };
}

export function FeatureCarousel() {
  const [current, setCurrent] = useState(1); // start on Weekly Race (index 1)
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number>(0);
  const dragDelta = useRef<number>(0);
  const reduceMotion = useRef(false);

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const prev = useCallback(() => setCurrent(c => (c - 1 + TOTAL) % TOTAL), []);
  const next = useCallback(() => setCurrent(c => (c + 1) % TOTAL), []);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  // Touch / pointer drag
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    dragStart.current = e.clientX;
    dragDelta.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    dragDelta.current = e.clientX - dragStart.current;
  };
  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (dragDelta.current < -50) next();
    else if (dragDelta.current > 50) prev();
    dragDelta.current = 0;
  };

  // Build visible slot offsets: show center ±2
  const visibleOffsets = [-2, -1, 0, 1, 2];

  return (
    <div className="fc-wrapper">
      {/* Carousel stage */}
      <div
        className="fc-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Feature cards carousel"
        role="region"
      >
        {visibleOffsets.map((offset) => {
          const idx = ((current + offset) % TOTAL + TOTAL) % TOTAL;
          const c = CARDS[idx];
          const style = getCardStyle(offset);
          return (
            <article
              key={idx + "-" + offset}
              className="fc-card feature-card mandy-card"
              style={style}
              aria-hidden={offset !== 0}
            >
              <span className="card-gloss" aria-hidden="true" />
              <span className="feature-icon-wrap fc-icon-wrap" aria-hidden="true">
                <img src={c.img} alt="" className="feature-icon" />
              </span>
              <h2 className="feature-title">{c.title}</h2>
              <p className="feature-desc">{c.desc}</p>
              <HoloButton href={c.btn.href} ext={c.btn.ext}>
                {c.btn.label}
              </HoloButton>
            </article>
          );
        })}
      </div>

      {/* Arrows */}
      <div className="fc-arrows">
        <button
          type="button"
          className="fc-arrow-btn"
          onClick={prev}
          aria-label="Previous feature card"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          type="button"
          className="fc-arrow-btn"
          onClick={next}
          aria-label="Next feature card"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

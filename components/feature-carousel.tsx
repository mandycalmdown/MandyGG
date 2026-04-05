"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm";
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4";

// Image height in px — 50% bleeds above the card, 50% sits on the card
const IMG_H   = 168;  // 20% bigger than previous 140px
const IMG_BLEED = IMG_H / 2; // px above card top

// Card panel dimensions (the visible card rectangle)
const CARD_W  = 280;  // px
const CARD_H  = 300;  // px  — panel height (text + button)

// Total slot height for the stage = bleed + card panel
const SLOT_H  = IMG_BLEED + CARD_H;

// Gap between card panels (visual gap between card edges)
const CARD_GAP = 28;  // px

// STEP = card width + gap.  We do NOT adjust for center scale here —
// instead we translate by STEP * offset so panel edges are always CARD_GAP apart.
// The center card scales from center so it equally encroaches left and right.
const STEP = CARD_W + CARD_GAP;

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
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAFFLE_ICON-2riBeZGxolnq3wp0udz3lpqmAgcL6L.webp",
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

// Returns styles for the entire slot (image + card panel together).
// translateX uses STEP * offset so card PANEL edges are always CARD_GAP apart.
// The center card scales 1.15× from its center — because transform-origin is
// "center center" of the slot, the scale expands equally left and right,
// meaning the visual gap between center card and neighbours stays symmetric.
function getSlotStyle(offset: number, dragOffset: number = 0): React.CSSProperties {
  const abs    = Math.abs(offset);
  const scale  = abs === 0 ? 1.15 : 1;
  const opacity= abs === 0 ? 1 : abs === 1 ? 0.85 : 0.6;
  const zIndex = abs === 0 ? 10 : abs === 1 ? 6 : 3;
  const tx     = offset * STEP + dragOffset;
  return {
    width:  `${CARD_W}px`,
    transform: `translateX(${tx}px) scale(${scale})`,
    transformOrigin: "bottom center",
    opacity,
    zIndex,
    transition: dragOffset !== 0
      ? "none"
      : "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.45s ease",
  };
}

export function FeatureCarousel() {
  const [current, setCurrent]     = useState(1); // default: $3500 WEEKLY RACE
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const dragStart  = useRef(0);

  const prev = useCallback(() => setCurrent(c => (c - 1 + TOTAL) % TOTAL), []);
  const next = useCallback(() => setCurrent(c => (c + 1) % TOTAL), []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const onPointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragStart.current  = e.clientX;
    setDragOffset(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    setDragOffset(e.clientX - dragStart.current);
  };
  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragOffset < -60) next();
    else if (dragOffset > 60) prev();
    setDragOffset(0);
  };

  const visibleOffsets = [-2, -1, 0, 1, 2];

  return (
    <div className="fc-wrapper">
      {/* Stage clips horizontal overflow but reveals image bleed at top */}
      <div
        className="fc-stage"
        style={{ height: `${SLOT_H}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-label="Feature cards carousel"
      >
        {visibleOffsets.map((offset) => {
          const idx = ((current + offset) % TOTAL + TOTAL) % TOTAL;
          const c   = CARDS[idx];
          const slotStyle = getSlotStyle(offset, isDragging.current ? dragOffset : 0);

          return (
            <div
              key={`${idx}-${offset}`}
              className="fc-slot"
              style={slotStyle}
              aria-hidden={offset !== 0}
            >
              {/* Image: floats above card panel, 50% above / 50% on card */}
              <div className="fc-img-wrap">
                <img
                  src={c.img}
                  alt=""
                  className="fc-img"
                  style={{ width: `${IMG_H}px`, height: `${IMG_H}px` }}
                />
              </div>

              {/* Card panel: visible card rectangle with all text+button */}
              <article className="fc-card feature-card mandy-card">
                <span className="card-gloss" aria-hidden="true" />
                <h2 className="feature-title">{c.title}</h2>
                <p className="feature-desc">{c.desc}</p>
                <HoloButton href={c.btn.href} ext={c.btn.ext}>
                  {c.btn.label}
                </HoloButton>
              </article>
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      <div className="fc-arrows">
        <button type="button" className="fc-arrow-btn" onClick={prev} aria-label="Previous feature card">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button type="button" className="fc-arrow-btn" onClick={next} aria-label="Next feature card">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm";
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4";

const IMG_H    = 220;   // px
const CARD_W   = 280;   // px
const CARD_H   = 340;   // px
const CARD_GAP = 24;    // px — visual gap between card edges
const STEP     = CARD_W + CARD_GAP;  // 304 px per slot

// Snap velocity threshold: if finger/cursor releases moving faster than this
// (px/ms) snap one card in the direction of motion, otherwise snap to nearest.
const FLICK_VELOCITY = 0.35;

const CARDS = [
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY_FLOATING_ELEMENT-w5rK7kUzPbLQI1Y57CPnQijedQdozJ.webp",
    title: "$3500 WEEKLY RACE",
    desc: "JOIN THE RACE. USE CODE MANDY AND COMPETE FOR $3500 EVERY SINGLE WEEK.",
    btn: { label: "VIEW LEADERBOARD", href: "/leaderboard", ext: false, modal: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_ACE_ELEMENT-6NYnjlUBlCmacbsg5OMtZQenj3ztWY.webp",
    title: "THRILL",
    desc: "PLAY AT THRILL WITH CODE MANDY. TRUSTWORTHY, INSTANT PAYOUTS, NO KYC, NO BULLSHIT.",
    btn: { label: "PLAY AT THRILL", href: "https://thrill.com/?r=MANDY", ext: true, modal: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_RAFFLE_ELEMENT-lX6r2sI10WNpKSZ9wP94qoofPTmo2X.webp",
    title: "WEEKLY RAFFLE",
    desc: "WAGER TO EARN TICKETS AND ENTER THE WEEKLY $250 PRIZE DRAW.",
    btn: { label: "VIEW RAFFLE", href: "/raffle", ext: false, modal: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_MEGAPHONE_ELEMENT-lMEgz2xUs9EzL3ahx3hxQAM03Dy3N9.webp",
    title: "GAMBLING GOSSIP",
    desc: "NEWS, DRAMA, CASINO REVIEWS, BLOGS AND THE STUFF ONLY DEGENS ARE TALKING ABOUT.",
    btn: { label: "READ MORE", href: "/blog", ext: false, modal: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/MANDYGG_GIFTBOX_ELEMENT-WOlVpXW7THckXd3pgRCKF05UvepZtu.webp",
    title: "REWARDS",
    desc: "SEE WHY PLAYING UNDER CODE MANDY PAYS BETTER. REWARDS, PERKS, CASHBACK, AND MORE.",
    btn: { label: "VIEW REWARDS", href: "/rewards", ext: false, modal: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TOOLS_ICON-NePfAoiUJsdObxpNYghwB6YkR9rz3I.webp",
    title: "DEGEN DASHBOARD",
    desc: "TRACK YOUR STATS, RAFFLE TICKETS, POKER ELIGIBILITY, AND WEEKLY PROGRESS IN ONE PLACE.",
    btn: { label: "OPEN DASHBOARD", href: "/dashboard", ext: false, modal: false },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POKER_CHIP_MANDYGG-fIvqIhEVsgRxMiDWG7fM6VkuB83oMD.webp",
    title: "POKER NIGHT",
    desc: "MONTHLY VIP POKER GAME. $1000 PRIZE POOL. WAGER $50K MONTHLY TO QUALIFY.",
    btn: { label: "DETAILS", href: "#", ext: false, modal: true },
  },
  {
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CHAT_BUBBLES-t5H6Ld4RrKgt95PbclU1Dq7o3AaquO.webp",
    title: "CONNECT",
    desc: "JOIN THE TELEGRAM. UPDATES, GIVEAWAYS, SUPPORT, GOSSIP, AND GENERAL CHAOS.",
    btn: { label: "JOIN TELEGRAM", href: "https://t.me/mandyggchat", ext: true, modal: false },
  },
] as const;

const TOTAL = CARDS.length;

function HoloButton({ href, ext, modal, onClick, children }: { href: string; ext: boolean; modal?: boolean; onClick?: () => void; children: React.ReactNode }) {
  const inner = (
    <>
      <video autoPlay loop muted playsInline aria-hidden="true" className="holo-btn__video">
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4}  type="video/mp4"  />
      </video>
      <span className="holo-btn__label">{children}</span>
    </>
  );

  if (modal) {
    return (
      <button type="button" onClick={onClick} className="holo-button card-btn">
        {inner}
      </button>
    );
  }

  if (ext) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="holo-button card-btn">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className="holo-button card-btn">
      {inner}
    </Link>
  );
}

// Derive the visual translateX for a card at `offset` slots from center,
// adjusted by the live drag delta. The center card does not shift position —
// only the drag delta moves all cards together.
function slotTranslate(offset: number, drag: number): number {
  return offset * STEP + drag;
}

// Returns the CSS for a slot given its offset and drag state.
// While dragging: no CSS transition, position follows pointer exactly.
// While snapping: smooth cubic-bezier transition takes over.
function getSlotStyle(
  offset: number,
  drag: number,
  dragging: boolean,
): React.CSSProperties {
  const abs     = Math.abs(offset);
  // During drag, interpolate scale based on how close a card is to center
  // so side cards grow slightly as they approach the middle.
  const proximity = dragging
    ? Math.max(0, 1 - Math.abs(offset - drag / STEP) / 1.5)
    : 0;
  const scale   = abs === 0 ? 1.12 : dragging ? 1 + proximity * 0.12 : 1;
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.85 : 0.6;
  const zIndex  = abs === 0 ? 10 : abs === 1 ? 6 : 3;
  const tx      = slotTranslate(offset, drag);

  return {
    transform:       `translateX(${tx}px) scale(${scale})`,
    transformOrigin: "bottom center",
    opacity,
    zIndex,
    transition: dragging
      ? "opacity 0.15s ease"                                           // no position transition while dragging
      : "transform 0.65s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease",
    willChange: dragging ? "transform" : "auto",
  };
}

export function FeatureCarousel() {
  const [current, setCurrent]     = useState(0);   // default: $3500 WEEKLY RACE (index 0)
  const [drag, setDrag]           = useState(0);
  const [dragging, setDragging]   = useState(false);
  const [pokerModalOpen, setPokerModalOpen] = useState(false);

  // Refs for velocity calculation
  const pointerStartX  = useRef(0);
  const pointerLastX   = useRef(0);
  const pointerLastT   = useRef(0);
  const velocityRef    = useRef(0);   // px / ms, updated on every pointermove

  const go = useCallback((delta: number) => {
    setCurrent(c => (c + delta + TOTAL) % TOTAL);
  }, []);

  const prev = useCallback(() => go(-1), [go]);
  const next = useCallback(() => go( 1), [go]);

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
    // Only respond to primary pointer (finger, left-mouse, trackpad tap)
    if (e.button !== 0 && e.pointerType === "mouse") return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointerStartX.current = e.clientX;
    pointerLastX.current  = e.clientX;
    pointerLastT.current  = e.timeStamp;
    velocityRef.current   = 0;
    setDrag(0);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const now    = e.timeStamp;
    const dt     = now - pointerLastT.current;
    const dx     = e.clientX - pointerLastX.current;
    // Exponential moving average for velocity — smoother than instantaneous
    if (dt > 0) {
      velocityRef.current = velocityRef.current * 0.6 + (dx / dt) * 0.4;
    }
    pointerLastX.current = e.clientX;
    pointerLastT.current = now;
    setDrag(e.clientX - pointerStartX.current);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);

    const totalDrag  = e.clientX - pointerStartX.current;
    const velocity   = velocityRef.current; // px/ms

    let delta = 0;
    if (Math.abs(velocity) >= FLICK_VELOCITY) {
      // Fast flick — go one card in the direction of the flick
      delta = velocity < 0 ? 1 : -1;
    } else {
      // Slow drag — snap to whichever card is closest to center
      // A drag of >STEP/2 means we've passed the halfway point to next card
      if (totalDrag < -STEP / 2) delta =  1;
      else if (totalDrag > STEP / 2) delta = -1;
    }

    setDrag(0);
    if (delta !== 0) go(delta);
  };

  const visibleOffsets = [-2, -1, 0, 1, 2];

  return (
    <div className="fc-wrapper">
      <div
        className="fc-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-label="Feature cards carousel"
        style={{ 
          cursor: dragging ? 'grabbing' : 'grab',
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {visibleOffsets.map((offset) => {
          const idx = ((current + offset) % TOTAL + TOTAL) % TOTAL;
          const c   = CARDS[idx];

          return (
            <div
              key={idx}
              className="fc-slot"
              style={getSlotStyle(offset, dragging ? drag : 0, dragging)}
              aria-hidden={offset !== 0}
            >
              <article className="fc-card feature-card mandy-card">
                <span className="card-gloss" aria-hidden="true" />
                <div className="fc-img-wrap" aria-hidden="true">
                  <img src={c.img} alt="" className="fc-img" />
                </div>
                <h2 className="feature-title">{c.title}</h2>
                <p className="feature-desc">{c.desc}</p>
                <HoloButton 
                  href={c.btn.href} 
                  ext={c.btn.ext}
                  modal={c.btn.modal}
                  onClick={c.btn.modal ? () => setPokerModalOpen(true) : undefined}
                >
                  {c.btn.label}
                </HoloButton>
              </article>
            </div>
          );
        })}
      </div>

      <div className="fc-arrows">
        <button type="button" className="fc-arrow-btn" onClick={prev} aria-label="Previous feature card">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="fc-arrow-btn" onClick={next} aria-label="Next feature card">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M7 4L12 9L7 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Poker Night Details Modal */}
      {pokerModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => setPokerModalOpen(false)}
        >
          <div 
            style={{
              background: '#080c14',
              border: '1.5px solid rgba(60,123,255,0.3)',
              borderRadius: '16px',
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              maxWidth: '500px',
              width: '100%',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(60,123,255,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPokerModalOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem',
                lineHeight: 1,
              }}
              aria-label="Close modal"
            >
              ×
            </button>
            <h2 style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              fontWeight: 900,
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              color: '#3C7BFF',
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}>
              POKER NIGHT
            </h2>
            <p style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(255,255,255,0.8)',
              lineHeight: 1.6,
              textAlign: 'center',
              padding: '2rem 0',
            }}>
              Coming Soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

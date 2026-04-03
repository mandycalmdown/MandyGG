"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { SiteNavigation } from "@/components/site-navigation";
import { faqItems } from "@/components/homepage-faq-data";
import "@/styles/mandy-home.css";

const BLOG_POSTS = [
  {
    slug: "thrill-deposit-bonus",
    tag: "THRILL",
    date: "MAR 8, 2026",
    title: "THRILL DEPOSIT BONUS: WHAT'S ACTUALLY WORTH IT",
    excerpt:
      "EVERYONE SAYS 'USE CODE MANDY' BUT NOBODY EXPLAINS WHY. HERE'S THE ACTUAL MATH ON THE BONUS STRUCTURE SO YOU CAN STOP LEAVING MONEY ON THE TABLE.",
  },
  {
    slug: "bankroll-management",
    tag: "STRATEGY",
    date: "MAR 5, 2026",
    title: "BANKROLL MANAGEMENT FOR PEOPLE WHO HATE BANKROLL MANAGEMENT",
    excerpt:
      "YOU ALREADY KNOW YOU SHOULD HAVE A BANKROLL STRATEGY. YOU JUST DON'T HAVE ONE. LET ME MAKE IT SO SIMPLE YOU HAVE NO EXCUSE.",
  },
  {
    slug: "how-to-place-in-race",
    tag: "WEEKLY RACE",
    date: "MAR 1, 2026",
    title: "HOW TO ACTUALLY PLACE IN THE $3500 WEEKLY RACE",
    excerpt:
      "THE LEADERBOARD RACE ISN'T JUST 'BET MORE.' THERE'S A REAL STRATEGY TO PLACING AND I'M GOING TO TELL YOU WHAT IT IS BECAUSE I WANT COMPETITION.",
  },
];

const HOLO_TEXT_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4";
const HOLO_BTN_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm";
const HOLO_BTN_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4";
const HOLO_BG_MP4 = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BG_FAST-1WSSOyBAdLQZmNScrtDjhoPOGYVLGg.mp4";

/* ── Holo text mask: white letters + multiply-blend video ── */
function HoloText() {
  return (
    <video autoPlay loop muted playsInline aria-hidden="true" className="holo-video">
      <source src={HOLO_TEXT_SRC} type="video/mp4" />
    </video>
  );
}

/* ── Holo button: video fills button background ── */
function HoloButton({
  href,
  external,
  children,
  className = "",
  onClick,
}: {
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <video autoPlay loop muted playsInline aria-hidden="true" className="holo-btn__video">
        <source src={HOLO_BTN_WEBM} type="video/webm" />
        <source src={HOLO_BTN_MP4} type="video/mp4" />
      </video>
      <span className="holo-btn__label">{children}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`holo-button ${className}`}>
        {inner}
      </button>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`holo-button ${className}`}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href!} className={`holo-button ${className}`}>
      {inner}
    </Link>
  );
}

/* ── Reusable card mouse handlers ── */
function useCardHandlers() {
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget as HTMLElement;
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y - r.height / 2) / (r.height / 2)) * -5;
    const ry = ((x - r.width  / 2) / (r.width  / 2)) *  5;
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
    card.style.setProperty("--mx", `${(x / r.width  * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(y / r.height * 100).toFixed(1)}%`);
    card.style.setProperty("--icon-x", `${((x - r.width  / 2) / (r.width  / 2)) * -12}px`);
    card.style.setProperty("--icon-y", `${((y - r.height / 2) / (r.height / 2)) * -12}px`);
  };
  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget as HTMLElement;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
    card.style.setProperty("--icon-x", "0px");
    card.style.setProperty("--icon-y", "0px");
  };
  return { onMove, onLeave };
}

/* ── Holo header tilt handlers ── */
function useHoloHandlers() {
  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const r  = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${((e.clientY - r.top)  / r.height - 0.5) * -8}deg`);
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width  - 0.5) *  8}deg`);
  };
  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };
  return { onMove, onLeave };
}

/* ── Framer Motion card animation variants ── */
const cardVariants = {
  enter: ({ direction }: { direction: number }) => {
    console.log("[v0] Card entering with direction:", direction);
    return { 
      opacity: 0, 
      x: direction < 1 ? 400 : -400,
      scale: 0.5,
    };
  },
  center: ({ position }: { position: () => string }) => {
    const pos = position();
    console.log("[v0] Card at position:", pos);
    return {
      scale: pos === "center" ? 1 : 0.85,
      x: 0,
      opacity: 1,
      zIndex: pos === "center" ? 20 : pos === "left" ? 1 : 1,
    };
  },
  exit: ({ direction }: { direction: number }) => {
    console.log("[v0] Card exiting with direction:", direction);
    return { 
      opacity: 0, 
      x: direction < 1 ? -400 : 400,
      scale: 0.5,
    };
  },
};

export function Homepage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const feedRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const card  = useCardHandlers();
  const holo  = useHoloHandlers();

  // Feature cards data
  const featureCards = [
    {
      img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/GIFT_FLOATING_ELEMENT-0kSS0Tl60Pg4YLQgNErd978xuRkLro.webp",
      title: "REWARDS",
      desc: "UNLOCK EXCLUSIVE PERKS, BONUSES, AND CASH REWARDS FOR LOYAL PLAYERS.",
      btn: { label: "VIEW REWARDS", href: "/rewards", ext: false },
    },
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
      img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/POKERCHIP__FLOATING_ELEMENT%20copy-2e0aQhNYvQfKpkRVWeX4IfDCqY199n.webp",
      title: "POKER NIGHT",
      desc: "CHECK YOUR PROGRESS TO SEE IF YOU QUALIFY FOR EXCLUSIVE EVENTS.",
      btn: { label: "DEGEN DASHBOARD", href: "/auth/login", ext: false },
    },
    {
      img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RAFFLE_ICON-wEJ9OoZlJBMcU6kfx1FskugZgAaH53.webp",
      title: "WEEKLY RAFFLE",
      desc: "EARN TICKETS EVERY $500 WAGERED. $250 WINNER DRAWN EVERY FRIDAY.",
      btn: { label: "VIEW RAFFLE", href: "/leaderboard#raffle", ext: false },
    },
  ] as const;

  // Calculate visible cards for infinite carousel
  const indexInArrayScope = ((activeIndex % featureCards.length) + featureCards.length) % featureCards.length;
  const visibleCards = [...featureCards, ...featureCards].slice(indexInArrayScope, indexInArrayScope + 3);

  const handleCardClick = (newDirection: number) => {
    console.log("[v0] Card click triggered, direction:", newDirection, "currentIndex:", activeIndex);
    setActiveIndex((prev) => [prev[0] + newDirection, newDirection]);
  };

  const handleDragEnd = (info: any) => {
    const swipeThreshold = 50;
    const velocity = info.velocity.x;
    const distance = info.offset.x;

    console.log("[v0] Drag ended - velocity:", velocity, "distance:", distance);

    if (Math.abs(velocity) > swipeThreshold || Math.abs(distance) > swipeThreshold) {
      if (distance < 0 || velocity < 0) {
        console.log("[v0] Swiping to next card");
        handleCardClick(1); // Swipe left, go to next
      } else {
        console.log("[v0] Swiping to previous card");
        handleCardClick(-1); // Swipe right, go to prev
      }
    }
  };

  const scrollFeed = (dir: "left" | "right") => {
    if (!feedRef.current) return;
    const w = feedRef.current.querySelector<HTMLElement>(".update-feed-card")?.offsetWidth ?? 320;
    feedRef.current.scrollBy({ left: dir === "left" ? -(w + 16) : (w + 16), behavior: "smooth" });
  };

  const announcements = [
    { tag: "NEW",    variant: "new",    date: "MAR 8, 2026",  title: "$3500 WEEKLY RACE IS LIVE",         body: "Use code MANDY on Thrill.com to start earning towards this week's leaderboard. Top 20 players split the prize pool every week." },
    { tag: "UPDATE", variant: "update", date: "MAR 5, 2026",  title: "NEW GAMING TOOLS DROPPING SOON",    body: "Bankroll tracker, session logger, and a degenerate calculator are all in the pipeline. Join Telegram for early access." },
    { tag: "ALERT",  variant: "alert",  date: "MAR 1, 2026",  title: "THRILL BONUS CODE: MANDY",          body: "Deposit bonus is active. Use code MANDY for the best rakeback deal on Thrill. Don't sign up without it." },
    { tag: "INFO",   variant: "info",   date: "FEB 22, 2026", title: "MANDY.GG IS NOW LIVE",              body: "Welcome to the site. Still building, always improving. Check back for tools, race updates, and whatever chaos comes next." },
    { tag: "HOT",    variant: "new",    date: "FEB 16, 2026", title: "THRILL VIP LEVEL NOTES ADDED",      body: "VIP notes for wagering pace, reload timing, and perk optimization are now in progress for the next tool drop." },
  ];

  return (
    <main className="mandy-home">
      <SiteNavigation />

      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-title">
        <div
          ref={logoRef}
          className="holo-mask"
          onMouseMove={holo.onMove}
          onMouseLeave={holo.onLeave}
        >
          <h1 id="hero-title" className="holo-mask__letters mandy-logo-size">MANDY.GG</h1>
          <HoloText />
          <span className="holo-sheen" aria-hidden="true" />
        </div>
        <p className="hero-tagline">YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
      </section>

      {/* ── Feature Cards Carousel ── */}
      <section className="features" aria-label="Main features">
        <div className="features-carousel-wrap">
          <motion.div 
            className="features-carousel-container"
            drag="x"
            dragElastic={0.15}
            dragConstraints={false}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: "grabbing" }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleCards.map((card_, idx) => {
                const position = idx === 0 ? "left" : idx === 1 ? "center" : "right";
                return (
                  <motion.article
                    key={`${card_.title}-${activeIndex}-${idx}`}
                    className="feature-card mandy-card"
                    layout
                    custom={{ direction, position: () => position }}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.8 }}
                    onMouseMove={card.onMove}
                    onMouseLeave={card.onLeave}
                  >
                    <span className="card-gloss" aria-hidden="true" />
                    <span className="feature-icon-wrap" aria-hidden="true">
                      <img src={card_.img} alt="" className="feature-icon" />
                    </span>
                    <h2 className="feature-title">{card_.title}</h2>
                    <p className="feature-desc">{card_.desc}</p>
                    <HoloButton href={card_.btn.href} external={card_.btn.ext} className="card-btn">
                      {card_.btn.label}
                    </HoloButton>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
          
          {/* Navigation arrows */}
          <div className="features-arrows" aria-label="Features carousel navigation">
            <motion.button 
              type="button" 
              className="arrow-btn" 
              onClick={() => handleCardClick(-1)} 
              aria-label="Previous features"
              whileTap={{ scale: 0.8 }}
            >
              <span className="arrow-btn__chevron arrow-btn__chevron--left" aria-hidden="true" />
            </motion.button>
            <motion.button 
              type="button" 
              className="arrow-btn" 
              onClick={() => handleCardClick(1)} 
              aria-label="Next features"
              whileTap={{ scale: 0.8 }}
            >
              <span className="arrow-btn__chevron arrow-btn__chevron--right" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* ── Updates — holo video background, cards float on top ── */}
      <div className="updates-bg-wrap">
        {/* Sticky holo video — scrolls with page, stays in place while content passes */}
        <video
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          className="updates-bg-video"
        >
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>

        <section className="updates-section" aria-label="Latest updates">
          <div
            className="holo-mask"
            onMouseMove={holo.onMove}
            onMouseLeave={holo.onLeave}
          >
            <span className="holo-mask__letters updates-title-size">UPDATES</span>
            <HoloText />
            <span className="holo-sheen" aria-hidden="true" />
          </div>

          <div className="updates-feed-wrap">
            <div ref={feedRef} className="updates-feed" role="list">
              {announcements.map((item, i) => (
                <article
                  key={i}
                  role="listitem"
                  className="update-card mandy-card"
                  onMouseMove={card.onMove}
                  onMouseLeave={card.onLeave}
                >
                  <span className="card-gloss" aria-hidden="true" />
                  <div className="update-card-top">
                    <span className={`tag tag--${item.variant}`}>{item.tag}</span>
                    <time className="update-date">{item.date}</time>
                  </div>
                  <h3 className="update-title">{item.title}</h3>
                  <p className="update-body">{item.body}</p>
                </article>
              ))}
            </div>
            {/* Arrows sit below the feed, flanking it */}
            <div className="updates-arrows" aria-label="Updates navigation">
              <button type="button" className="arrow-btn" onClick={() => scrollFeed("left")} aria-label="Previous update">
                <span className="arrow-btn__chevron arrow-btn__chevron--left" aria-hidden="true" />
              </button>
              <button type="button" className="arrow-btn" onClick={() => scrollFeed("right")} aria-label="Next update">
                <span className="arrow-btn__chevron arrow-btn__chevron--right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Gambling Gossip / Blog ── */}
      <section className="blog-section" aria-label="Gambling Gossip blog">
        <div className="blog-header">
          <div
            className="holo-mask"
            onMouseMove={holo.onMove}
            onMouseLeave={holo.onLeave}
          >
            <span className="holo-mask__letters blog-title-size">GAMBLING GOSSIP</span>
            <HoloText />
            <span className="holo-sheen" aria-hidden="true" />
          </div>
        </div>
        <div className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="blog-card mandy-card"
              onMouseMove={card.onMove}
              onMouseLeave={card.onLeave}
            >
              <span className="card-gloss" aria-hidden="true" />
              <div className="blog-meta">
                <span className="tag tag--blue">{post.tag}</span>
                <span className="blog-date">{post.date}</span>
              </div>
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <span className="blog-cta">READ MORE →</span>
            </Link>
          ))}
        </div>
        <div className="blog-more-row">
          <HoloButton href="/blog" className="btn-sm">MORE</HoloButton>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq" aria-label="FAQ">
        {/* Outer div handles vertical layout; inner holo-mask is free of transform conflicts */}
        <div className="faq-title-wrap">
          <div
            className="holo-mask"
            onMouseMove={holo.onMove}
            onMouseLeave={holo.onLeave}
          >
            <span className="holo-mask__letters faq-title-size">F.A.Q.</span>
            <HoloText />
            <span className="holo-sheen" aria-hidden="true" />
          </div>
        </div>
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className={`faq-item mandy-card${expandedFaq === i ? " faq-item--open" : ""}`}
              onMouseMove={card.onMove}
              onMouseLeave={card.onLeave}
            >
              <span className="card-gloss" aria-hidden="true" />
              <button
                className="faq-q"
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                aria-expanded={expandedFaq === i}
              >
                <span>{item.question}</span>
                <span className="faq-chevron" aria-hidden="true" />
              </button>
              {expandedFaq === i && (
                <div className="faq-answer">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer" aria-label="Site footer">
        <video autoPlay loop muted playsInline aria-hidden="true" className="footer-video">
          <source src={HOLO_BG_MP4} type="video/mp4" />
        </video>
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">MANDY.GG</span>
            <span className="footer-sub">YEAH, I&apos;M A GIRL AND I GAMBLE.</span>
            <span className="footer-code">USE CODE <strong>MANDY</strong> ON THRILL</span>
          </div>
          <nav className="footer-nav" aria-label="Footer nav">
            <Link href="/how-to-join">HOW TO JOIN</Link>
            <Link href="/rewards">REWARDS</Link>
            <Link href="/leaderboard">WEEKLY RACE</Link>
            <Link href="/tools">TOOLS</Link>
            <Link href="/blog">GOSSIP</Link>
            <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer">TELEGRAM</a>
            <a href="https://discord.gg/mandygg" target="_blank" rel="noopener noreferrer">DISCORD</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 MANDY.GG — ALL RIGHTS RESERVED</span>
          <div className="footer-legal">
            <Link href="/responsible-gambling">RESPONSIBLE GAMBLING</Link>
            <Link href="/terms">TERMS</Link>
            <Link href="/privacy">PRIVACY</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

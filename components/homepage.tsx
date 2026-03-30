"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import { faqItems } from "@/components/homepage-faq-data";
import "@/styles/mandy-home.css";

/* ── static blog posts ── */
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

export function Homepage() {
  const tickerText = "| CODE: MANDY ON THRILL.COM ";
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const logoRef = React.useRef<HTMLHeadingElement | null>(null);
  const updatesFeedRef = React.useRef<HTMLDivElement | null>(null);

  /* ── logo parallax + tilt ── */
  const handleLogoMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;   // 0→1
    const y = (e.clientY - rect.top)  / rect.height;  // 0→1
    const rx =  (y - 0.5) * -8;   // tilt up/down  ±4 deg
    const ry =  (x - 0.5) *  8;   // tilt left/right ±4 deg
    el.style.setProperty("--mouse-x", `${x * 100}%`);
    el.style.setProperty("--mouse-y", `${y * 100}%`);
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
  };
  const handleLogoMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget as HTMLElement;
    el.style.setProperty("--mouse-x", "50%");
    el.style.setProperty("--mouse-y", "50%");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  /* ── card tilt ── */
  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--rx", `${((y - cy) / cy) * -5}deg`);
    card.style.setProperty("--ry", `${((x - cx) / cx) * 5}deg`);
    card.style.setProperty("--icon-x", `${((x - cx) / cx) * -14}px`);
    card.style.setProperty("--icon-y", `${((y - cy) / cy) * -14}px`);
  };
  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--icon-x", "0px");
    card.style.setProperty("--icon-y", "0px");
  };

  /* ── updates feed scroll ── */
  const scrollUpdatesFeed = (dir: "left" | "right") => {
    updatesFeedRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const announcements = [
    {
      tag: "NEW",
      variant: "new",
      date: "MAR 8, 2026",
      title: "$3500 WEEKLY RACE IS LIVE",
      body: "Use code MANDY on Thrill.com to start earning towards this week's leaderboard. Top 20 players split the prize pool every week.",
    },
    {
      tag: "UPDATE",
      variant: "update",
      date: "MAR 5, 2026",
      title: "NEW GAMING TOOLS DROPPING SOON",
      body: "Bankroll tracker, session logger, and a degenerate calculator are all in the pipeline. Join Telegram for early access.",
    },
    {
      tag: "ALERT",
      variant: "alert",
      date: "MAR 1, 2026",
      title: "THRILL BONUS CODE: MANDY",
      body: "Deposit bonus is active. Use code MANDY for the best rakeback deal on Thrill. Don't sign up without it.",
    },
    {
      tag: "INFO",
      variant: "",
      date: "FEB 22, 2026",
      title: "MANDY.GG IS NOW LIVE",
      body: "Welcome to the site. Still building, always improving. Check back for tools, race updates, and whatever chaos comes next.",
    },
    {
      tag: "HOT",
      variant: "new",
      date: "FEB 16, 2026",
      title: "THRILL VIP LEVEL NOTES ADDED",
      body: "VIP notes for wagering pace, reload timing, and perk optimization are now in progress for the next tool drop.",
    },
  ];

  return (
    <main className="mandy-home">
      <SiteNavigation />

      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-title">
        <h1
          id="hero-title"
          ref={logoRef}
          className="mandy-logo"
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
        >
          {/*
            bg-clip-text technique:
            - Outer h1 text is `color: transparent` so nothing renders by default
            - The inner span has `background-clip: text` + `WebkitBackgroundClip: text`
              making the video act as the fill of the letterforms
            - The video is absolutely positioned to cover the span, object-cover fills it
            - The visible text "MANDY.GG" in the span is what gets clipped
          */}
          <span
            className="mandy-logo__clip-wrap"
            style={{ WebkitBackgroundClip: "text", backgroundClip: "text" }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
              className="mandy-logo__video"
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4" type="video/mp4" />
            </video>
            MANDY.GG
          </span>
          {/* Sheen sweep on top */}
          <span className="mandy-logo__sheen" aria-hidden="true" />
        </h1>
        <p className="hero-tagline">YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
      </section>

      {/* ── Feature Cards ── */}
      <section className="features" aria-label="Main features">
        <div className="features-grid">
          <article
            className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DICE_FLOATING_ELEMENT-fgALe6PAlQzuWKZm0dVQuq22ma8BCW.webp"
                alt="Dice icon for Thrill casino"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">THRILL</h2>
            <p className="feature-description">
              IT&apos;S LIKE STEAK BUT WITH LESS DRAMA. AND BETTER REWARDS.
            </p>
            <a
              href="https://thrill.com/?r=MANDY"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button"
            >
              <span>TELL ME</span>
              <span>MORE</span>
            </a>
          </article>

          <article
            className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY_FLOATING_ELEMENT-w5rK7kUzPbLQI1Y57CPnQijedQdozJ.webp"
                alt="Trophy icon for weekly race"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">$3500 WEEKLY RACE</h2>
            <p className="feature-description">
              FORGET MONTHLY LEADERBOARDS, GET CODE MANDY FOR CASH WAGER TO WIN EVERY WEEK!
            </p>
            <Link href="/leaderboard" className="primary-button">
              <span>VIEW</span>
              <span>LEADERBOARD</span>
            </Link>
          </article>

          <article
            className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TOOLS_ICON-NePfAoiUJsdObxpNYghwB6YkR9rz3I.webp"
                alt="Tools icon for gaming tools"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">GAMING TOOLS</h2>
            <p className="feature-description">TOOLS FOR DEGENERACY.</p>
            <Link href="/tools" className="primary-button">
              <span>NERD</span>
              <span>ALERT</span>
            </Link>
          </article>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="ticker" aria-label="Promo ticker">
        <div className="ticker-track">
          <span>{tickerText.repeat(10)}</span>
          <span aria-hidden="true">{tickerText.repeat(10)}</span>
        </div>
      </div>

      {/* ── Updates ── */}
      <section className="updates-section" aria-label="Latest updates">
        <div className="updates-left">
          <h2 className="updates-title">UPDATES</h2>
        </div>
        <div className="updates-feed-wrap">
          <button
            type="button"
            className="updates-feed-arrow"
            aria-label="Scroll updates left"
            onClick={() => scrollUpdatesFeed("left")}
          >
            ←
          </button>
          <div ref={updatesFeedRef} className="updates-horizontal-feed" role="list">
            {announcements.map((item, i) => (
              <article
                key={i}
                role="listitem"
                className="update-feed-card floating-card"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="update-feed-top">
                  <span className={`announcement-tag announcement-tag--${item.variant || "info"}`}>
                    {item.tag}
                  </span>
                  <time className="announcement-date">{item.date}</time>
                </div>
                <h3 className="update-feed-title">{item.title}</h3>
                <p className="update-feed-copy">{item.body}</p>
              </article>
            ))}
          </div>
          <button
            type="button"
            className="updates-feed-arrow"
            aria-label="Scroll updates right"
            onClick={() => scrollUpdatesFeed("right")}
          >
            →
          </button>
        </div>
      </section>

      {/* ── Blog / Gambling Gossip ── */}
      <section className="blog-section" aria-label="Gambling Gossip blog posts">
        <div className="blog-header">
          <h2 className="blog-title">GAMBLING GOSSIP</h2>
          <span className="blog-byline">(by Mandy)</span>
        </div>
        <div className="blog-grid">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <div className="blog-card-meta">
                <span className="blog-tag">{post.tag}</span>
                <span className="blog-date">{post.date}</span>
              </div>
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-excerpt">{post.excerpt}</p>
              <span className="blog-card-cta">READ MORE →</span>
            </Link>
          ))}
        </div>
        <div className="blog-more-wrap">
          <Link href="/blog" className="blog-more-btn">MORE</Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section" id="faq" aria-label="Frequently Asked Questions">
        <div className="faq-left">
          <h2 className="faq-heading">F.A.Q.</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <div
              key={i}
              className="faq-item"
              data-open={expandedFaq === i ? "true" : "false"}
            >
              <button
                className="faq-question-btn"
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
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-brand-name">MANDY.GG</span>
            <span className="footer-tagline">YEAH, I&apos;M A GIRL AND I GAMBLE.</span>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <Link href="/how-to-join">HOW TO JOIN</Link>
            <Link href="/rewards">REWARDS</Link>
            <Link href="/leaderboard">WEEKLY RACE</Link>
            <Link href="/tools">TOOLS</Link>
            <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer">TELEGRAM</a>
            <a href="https://discord.gg/mandygg" target="_blank" rel="noopener noreferrer">DISCORD</a>
            <a href="https://kick.com/mandycalmdown" target="_blank" rel="noopener noreferrer">KICK</a>
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

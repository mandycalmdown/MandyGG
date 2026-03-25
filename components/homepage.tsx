"use client";

import React from "react";
import Link from "next/link";
import "@/styles/mandy-home.css";
import "@/styles/blog.css";

export function Homepage() {
  const tickerText = "| CODE: MANDY ON THRILL.COM ";
  const logoRef = React.useRef<HTMLSpanElement | null>(null);
  const updatesFeedRef = React.useRef<HTMLDivElement | null>(null);

  const handleLogoMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const span = logoRef.current;
    if (!span) return;

    const rect = span.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const tiltX = ((yPercent - 50) / 50) * -8;
    const tiltY = ((xPercent - 50) / 50) * 8;

    span.style.setProperty("--mouse-x", `${xPercent}%`);
    span.style.setProperty("--mouse-y", `${yPercent}%`);
    span.style.setProperty("--tilt-x", `${tiltX}deg`);
    span.style.setProperty("--tilt-y", `${tiltY}deg`);
  };

  const handleLogoMouseLeave = () => {
    const span = logoRef.current;
    if (!span) return;
    span.style.setProperty("--mouse-x", "50%");
    span.style.setProperty("--mouse-y", "50%");
    span.style.setProperty("--tilt-x", "0deg");
    span.style.setProperty("--tilt-y", "0deg");
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y - cy) / cy) * -5;
    const ry = ((x - cx) / cx) * 5;
    const iconX = ((x - cx) / cx) * -14;
    const iconY = ((y - cy) / cy) * -14;
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
    card.style.setProperty("--icon-x", `${iconX}px`);
    card.style.setProperty("--icon-y", `${iconY}px`);
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const card = e.currentTarget;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--icon-x", "0px");
    card.style.setProperty("--icon-y", "0px");
  };

  const scrollUpdatesFeed = (direction: "left" | "right") => {
    const feed = updatesFeedRef.current;
    if (!feed) return;
    const offset = direction === "left" ? -340 : 340;
    feed.scrollBy({ left: offset, behavior: "smooth" });
  };

  const announcements = [
    { tag: "NEW", variant: "new", date: "MAR 8, 2026", title: "$3500 WEEKLY RACE IS LIVE", body: "Use code MANDY on Thrill.com to start earning towards this week's leaderboard. Top 20 players split the prize pool every week.", cta: "ENTER NOW →" },
    { tag: "UPDATE", variant: "update", date: "MAR 5, 2026", title: "NEW GAMING TOOLS DROPPING SOON", body: "Bankroll tracker, session logger, and a degenerate calculator are all in the pipeline. Join Telegram for early access.", cta: "FOLLOW UPDATES →" },
    { tag: "ALERT", variant: "alert", date: "MAR 1, 2026", title: "THRILL BONUS CODE: MANDY", body: "Deposit bonus is active. Use code MANDY for the best rakeback deal on Thrill. Don't sign up without it.", cta: "CLAIM BONUS →" },
    { tag: "INFO", variant: "", date: "FEB 22, 2026", title: "MANDY.GG IS NOW LIVE", body: "Welcome to the site. Still building, always improving. Check back for tools, race updates, and whatever chaos comes next.", cta: "ABOUT MANDY →" },
    { tag: "HOT", variant: "new", date: "FEB 16, 2026", title: "THRILL VIP LEVEL NOTES ADDED", body: "VIP notes for wagering pace, reload timing, and perk optimization are now in progress for the next tool drop.", cta: "READ NOTES →" },
  ];

  return (
    <main className="mandy-home">
      <section className="hero" aria-labelledby="hero-title">
        <h1
          id="hero-title"
          className="mandy-logo"
          onMouseMove={handleLogoMouseMove}
          onMouseLeave={handleLogoMouseLeave}
        >
          <span ref={logoRef} className="mandy-logo__gradient">MANDY.GG</span>
        </h1>
        <p className="hero-tagline">YEAH, I&apos;M A GIRL AND I GAMBLE.</p>
      </section>

      <section className="features" aria-label="Main features">
        <div className="features-grid">
          <article className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DICE_FLOATING_ELEMENT-fgALe6PAlQzuWKZm0dVQuq22ma8BCW.webp"
                alt="Thrill dice icon"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">THRILL</h2>
            <p className="feature-description">IT&apos;S LIKE STEAK BUT WITH LESS DRAMA. AND BETTER REWARDS.</p>
            <button className="primary-button primary-button--stacked" type="button">
              <span>TELL ME</span>
              <span>MORE</span>
            </button>
          </article>

          <article className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TROPHY_FLOATING_ELEMENT-w5rK7kUzPbLQI1Y57CPnQijedQdozJ.webp"
                alt="Weekly race trophy icon"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">$3500 WEEKLY RACE</h2>
            <p className="feature-description">FORGET MONTHLY LEADERBOARDS, GET CODE MANDY FOR CASH WAGER TO WIN EVERY WEEK!</p>
            <Link href="/leaderboard" className="primary-button primary-button--stacked">
              <span>VIEW</span>
              <span>LEADERBOARD</span>
            </Link>
          </article>

          <article className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TOOLS_ICON-NePfAoiUJsdObxpNYghwB6YkR9rz3I.webp"
                alt="Gaming tools icon"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">GAMING TOOLS</h2>
            <p className="feature-description">TOOLS FOR DEGENERACY.</p>
            <Link href="/gaming-tools" className="primary-button primary-button--stacked">
              <span>NERD</span>
              <span>ALERT</span>
            </Link>
          </article>
        </div>
      </section>

      <div className="ticker" aria-label="Promo ticker">
        <div className="ticker-track">
          <span>{tickerText.repeat(8)}</span>
          <span aria-hidden="true">{tickerText.repeat(8)}</span>
        </div>
      </div>

      <section className="updates-section" aria-label="Updates">
        <div className="updates-strip">
          <div className="updates-strip-head">
            <span className="updates-strip-title">LATEST UPDATES</span>
          </div>
          <div className="updates-feed-wrap">
            <button
              type="button"
              className="updates-feed-arrow updates-feed-arrow--left"
              aria-label="Scroll updates left"
              onClick={() => scrollUpdatesFeed("left")}
            >
              ←
            </button>
            <div ref={updatesFeedRef} className="updates-horizontal-feed" role="list">
            {announcements.map((item, i) => (
              <article
                key={`feed-${i}`}
                role="listitem"
                className="update-feed-card floating-card"
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="update-feed-top">
                  <span className={`announcement-tag${item.variant ? ` announcement-tag--${item.variant}` : ""}`}>
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
              className="updates-feed-arrow updates-feed-arrow--right"
              aria-label="Scroll updates right"
              onClick={() => scrollUpdatesFeed("right")}
            >
              →
            </button>
          </div>
        </div>

        <div className="update-placeholders-grid">
          <Link href="/reviews/thrill" className="placeholder-mini-card">1. CASINO REVIEW</Link>
          <Link href="/leaderboard" className="placeholder-mini-card">2. RAFFLE ANNOUNCEMENT</Link>
          <Link href="/mandycoins" className="placeholder-mini-card">3. MANDYCOIN ANNOUNCEMENT</Link>
          <a href="https://t.me/mandygg_support_bot" className="placeholder-mini-card" target="_blank" rel="noreferrer">4. JOIN TELEGRAM</a>
        </div>
      </section>
    </main>
  );
}

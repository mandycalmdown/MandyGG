"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/app/styles/mandy-home.css";
import "@/app/styles/blog.css";
import { SEED_POSTS, formatDate } from "@/app/blog/data";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";

export default function Home() {
  const tickerText = "| CODE: MANDY ON THRILL.COM ";
  const logoRef = React.useRef<HTMLSpanElement | null>(null);
  const updatesFeedRef = React.useRef<HTMLDivElement | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
    { tag: "NEW", variant: "new", date: "MAR 25, 2026", title: "$3500 WEEKLY RACE IS LIVE", body: "Use code MANDY on Thrill.com to start earning towards this week's leaderboard. Top 20 players split the prize pool every week.", cta: "ENTER NOW →" },
    { tag: "UPDATE", variant: "update", date: "MAR 15, 2026", title: "NEW GAMING TOOLS DROPPING SOON", body: "Bankroll tracker, session logger, and a degenerate calculator are all in the pipeline. Join Telegram for early access.", cta: "FOLLOW UPDATES →" },
    { tag: "ALERT", variant: "alert", date: "MAR 1, 2026", title: "THRILL BONUS CODE: MANDY", body: "Deposit bonus is active. Use code MANDY for the best rakeback deal on Thrill. Don't sign up without it.", cta: "CLAIM BONUS →" },
    { tag: "INFO", variant: "", date: "FEB 22, 2026", title: "MANDY.GG IS NOW LIVE", body: "Welcome to the site. Still building, always improving. Check back for tools, race updates, and whatever chaos comes next.", cta: "ABOUT MANDY →" },
  ];

  const faqItems = [
    {
      question: "HOW CAN I GET THE BEST CASINO BONUSES?",
      answer: (
        <span>
          Sign up through{" "}
          <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline">Thrill.com</a>
          {" "}with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline font-bold">MANDY</a> for exclusive perks, weekly races, instant lossback, and VIP upgrades.
        </span>
      ),
    },
    {
      question: "WHAT'S THE BEST STAKE ALTERNATIVE?",
      answer: (
        <span>
          <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline">Thrill</a>
          {" "}offers the most generous bonuses and fastest payouts for crypto gamblers. You get extra rewards by joining with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline font-bold">MANDY</a>.
        </span>
      ),
    },
    {
      question: "HOW DO I CONTACT YOU?",
      answer: (
        <span>
          Join the{" "}
          <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline">official Telegram group</a>
          {" "}first. If you can{"'"}t find your answer in the group, message the{" "}
          <a href="https://t.me/mandysupport_bot" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline">MandySupport bot</a>.
        </span>
      ),
    },
    {
      question: "WHAT PERKS COME WITH CODE MANDY?",
      answer: (
        <div>
          <p className="mb-3">Using code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline font-bold">MANDY</a> gives you access to:</p>
          <ul className="list-disc list-inside space-y-2 mb-3">
            <li><strong>Weekly Leaderboard</strong>: Automatic entry into a weekly race with a $3,500 prize pool.</li>
            <li><strong>Monthly Poker Tournament</strong>: Access to a poker tournament with a $1,000 prize pool if you hit the $50,000 monthly wagering requirement.</li>
            <li><strong>Lossback</strong>: You can request lossback from day one.</li>
            <li><strong>Custom High Roller Benefits</strong>: For high volume players.</li>
          </ul>
        </div>
      ),
    },
    {
      question: "WHAT CASINO IS THE BEST?",
      answer: (
        <span>
          Currently your best option is{" "}
          <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline">Thrill</a>.
          Hands down. Sign up with code <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="text-[#c1ff00] hover:underline font-bold">MANDY</a>.
        </span>
      ),
    },
    {
      question: "ARE THESE CASINOS REAL? WILL THEY SCAM ME?",
      answer: "Any casino listed on Mandy.gg has been vetted by me. If you're not breaking the terms of service or abusing promos or alts, you should have no issues withdrawing your winnings.",
    },
  ];

  return (
    <main className="mandy-home">
      <SiteNav />

      {/* HERO SECTION */}
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

      {/* FEATURES SECTION - 3 CARDS */}
      <section className="features" aria-label="Main features">
        <div className="features-grid">
          {/* Card 1: Rewards */}
          <article className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/REWARDS_HOLOGRAM_ICON-wYnYEtXbZyiqM2munN5rPZ1laVLopd.webp"
                alt="Rewards"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">REWARDS I GOT YOU</h2>
            <p className="feature-description">THE BEST BONUSES, RAKEBACK, LOSSBACK, AND VIP PERKS ON THRILL</p>
            <a href="https://thrill.com/?r=MANDY" target="_blank" rel="noopener noreferrer" className="primary-button">
              CLAIM REWARDS
            </a>
          </article>

          {/* Card 2: Weekly Race */}
          <article className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/RACE_HOLOGRAM_ICON-D5nvoQ7KXz6sV3EUQC2MgisAEoRGa9.webp"
                alt="Race"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">$3500 WEEKLY RACE</h2>
            <p className="feature-description">COMPETE EVERY WEEK FOR CASH PRIZES. CODE MANDY GETS YOU INSTANT ENTRY.</p>
            <Link href="/leaderboard" className="primary-button">
              VIEW LEADERBOARD
            </Link>
          </article>

          {/* Card 3: Connect */}
          <article className="feature-card floating-card"
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
          >
            <div className="feature-icon-wrap">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CONNECT_HOLOGRAM_ICON-pYzxAgRsXHHpRgyxGVg2TY0CFBHpmg.webp"
                alt="Connect"
                className="feature-icon"
              />
            </div>
            <h2 className="feature-title">CONNECT</h2>
            <p className="feature-description">JOIN THE TELEGRAM COMMUNITY FOR EVENTS, UPDATES, AND DEGEN VIBES</p>
            <a href="https://t.me/MandyggChat" target="_blank" rel="noopener noreferrer" className="primary-button">
              JOIN TELEGRAM
            </a>
          </article>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker" aria-label="Promo ticker">
        <div className="ticker-track">
          <span>{tickerText.repeat(8)}</span>
          <span aria-hidden="true">{tickerText.repeat(8)}</span>
        </div>
      </div>

      {/* UPDATES FEED SECTION */}
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
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section" aria-label="Frequently Asked Questions">
        <div className="faq-container">
          <h2 className="faq-title">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="faq-grid">
            {faqItems.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  aria-expanded={expandedFaq === index}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{expandedFaq === index ? "−" : "+"}</span>
                </button>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    {typeof faq.answer === "string" ? faq.answer : faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG FEED */}
      <section className="blog-feed-section" aria-label="Latest from the blog">
        <div className="blog-feed-header">
          <span className="blog-feed-eyebrow">GAMBLING GOSSIP</span>
          <Link href="/blog" className="blog-feed-link">ALL POSTS →</Link>
        </div>
        <div className="blog-feed-grid">
          {SEED_POSTS.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-feed-card">
              <div className="blog-feed-card-meta">
                {post.tags.slice(0, 1).map((tag) => (
                  <span key={tag} className="blog-tag">{tag}</span>
                ))}
                <span className="blog-date">{formatDate(post.date)}</span>
              </div>
              <h3 className="blog-feed-card-title">{post.title}</h3>
              <p className="blog-feed-card-excerpt">{post.excerpt}</p>
              <span className="blog-feed-card-cta">READ MORE →</span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import { SiteFooter } from "@/components/site-footer";
import { faqItems } from "@/components/homepage-faq-data";
import { FeatureCarousel } from "@/components/feature-carousel";
import "@/styles/mandy-home.css";

const BLOG_POSTS = [
  {
    slug: "",
    tag: "CASINO REVIEW",
    date: "APR 2026",
    title: "LOREM IPSUM DOLOR SIT AMET CONSECTETUR ADIPISCING ELIT",
    excerpt:
      "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA.",
  },
  {
    slug: "",
    tag: "STRATEGY",
    date: "APR 2026",
    title: "UT ENIM AD MINIM VENIAM QUIS NOSTRUD EXERCITATION ULLAMCO",
    excerpt:
      "DUIS AUTE IRURE DOLOR IN REPREHENDERIT IN VOLUPTATE VELIT ESSE CILLUM DOLORE EU FUGIAT NULLA PARIATUR EXCEPTEUR SINT.",
  },
  {
    slug: "",
    tag: "ADVICE",
    date: "MAR 2026",
    title: "EXCEPTEUR SINT OCCAECAT CUPIDATAT NON PROIDENT SUNT IN CULPA",
    excerpt:
      "SUNT IN CULPA QUI OFFICIA DESERUNT MOLLIT ANIM ID EST LABORUM. SED UT PERSPICIATIS UNDE OMNIS ISTE NATUS ERROR SIT VOLUPTATEM.",
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

export function Homepage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const logoRef = useRef<HTMLDivElement>(null);
  const card  = useCardHandlers();
  const holo  = useHoloHandlers();

  const scrollFeed = (dir: "left" | "right") => {
    if (!feedRef.current) return;
    const w = feedRef.current.querySelector<HTMLElement>(".update-feed-card")?.offsetWidth ?? 320;
    feedRef.current.scrollBy({ left: dir === "left" ? -(w + 16) : (w + 16), behavior: "smooth" });
  };

  const announcements = [
    { tag: "NEW",    variant: "new",    date: "APR 2026", title: "LOREM IPSUM DOLOR SIT AMET",         body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
    { tag: "UPDATE", variant: "update", date: "APR 2026", title: "UT ENIM AD MINIM VENIAM",            body: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure." },
    { tag: "ALERT",  variant: "alert",  date: "MAR 2026", title: "DUIS AUTE IRURE DOLOR",              body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint." },
    { tag: "INFO",   variant: "info",   date: "MAR 2026", title: "EXCEPTEUR SINT OCCAECAT",            body: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
    { tag: "HOT",    variant: "new",    date: "MAR 2026", title: "NEMO ENIM IPSAM VOLUPTATEM",         body: "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos." },
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
        <FeatureCarousel />
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
          {BLOG_POSTS.map((post, i) => (
            <Link
              key={i}
              href="/blog"
              className="blog-card mandy-card"
              onMouseMove={card.onMove}
              onMouseLeave={card.onLeave}
            >
              <span className="card-gloss" aria-hidden="true" />
              <div className="blog-image-placeholder" aria-hidden="true" style={{ backgroundImage: "url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blogheader_placeholder-uB5MnjFpMp744NAGPoPiz9bVmUlMsa.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
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
      <SiteFooter />
    </main>
  );
}

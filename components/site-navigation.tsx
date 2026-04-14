"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import "@/styles/site-nav.css";

const HOLO_TEXT_SRC  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_TEXT_MASK-33yJOP7lDSqCgZJrk17eCG6mcmeOXx.mp4";
const HOLO_BTN_WEBM  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-vvBqpLnG9SqDfqO5NCxaJ1mHFqE3AU.webm";
const HOLO_BTN_MP4   = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_BUTTON-zrU5QXiUVY9IjiMdNU0qMrdnhBGg9M.mp4";
const HOLO_WIDE_WEBM = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_WIDE-CNLyaOSVK5cArFRfu1FNHzb433j8iI.webm";
const HOLO_WIDE_MP4  = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HOLO_WIDE-RpqZaJvObzwBscZHWnnvAXCjgzTJWB.mp4";

const TICKER_TEXT = "| CODE: MANDY ON THRILL.COM ";

const NAV_LINKS = [
  { href: "/",             label: "HOME" },
  { href: "/how-to-join",  label: "HOW TO" },
  { href: "/rewards",      label: "REWARDS" },
  { href: "/dashboard",    label: "DEGEN DASHBOARD" },
  { href: "/leaderboard",  label: "LEADERBOARD" },
  // { href: "/raffle",       label: "RAFFLE" },  // HIDDEN
  // { href: "/blog",         label: "GOSSIP" },  // HIDDEN
  { href: "/#faq",         label: "FAQ" },
];

interface SiteNavigationProps {
  currentPage?: string;
}

export function SiteNavigation({ currentPage }: SiteNavigationProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user,     setUser    ] = useState<User | null>(null);
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUser(s?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="nav-sticky-wrapper">
      {/* ── Nav bar ── */}
      <nav className="site-nav" aria-label="Main navigation">
        <div className="site-nav__inner">

          {/* Logo — holo text, "MANDY.GG" on desktop, "M" on mobile */}
          <Link href="/" className="site-nav__logo nav-logo-holo" aria-label="Mandy.gg home">
            <span className="nav-logo-holo__text nav-logo-holo__text--desktop">MANDY.GG</span>
            <span className="nav-logo-holo__text nav-logo-holo__text--mobile">M</span>
            <video autoPlay loop muted playsInline aria-hidden="true" className="nav-logo-holo__video">
              <source src={HOLO_TEXT_SRC} type="video/mp4" />
            </video>
          </Link>

          {/* Desktop links */}
          <div className="site-nav__links" role="list">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                role="listitem"
                className={`site-nav__link${currentPage === link.href ? " site-nav__link--active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="site-nav__auth">
            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="nav-holo-btn"
                aria-label="Sign out"
              >
                <video autoPlay loop muted playsInline aria-hidden="true" className="nav-holo-btn__video">
                  <source src={HOLO_BTN_WEBM} type="video/webm" />
                  <source src={HOLO_BTN_MP4}  type="video/mp4" />
                </video>
                <span className="nav-holo-btn__label">SIGN OUT</span>
              </button>
            ) : (
              <Link href="/auth/login" className="nav-holo-btn" aria-label="Sign in">
                <video autoPlay loop muted playsInline aria-hidden="true" className="nav-holo-btn__video">
                  <source src={HOLO_BTN_WEBM} type="video/webm" />
                  <source src={HOLO_BTN_MP4}  type="video/mp4" />
                </video>
                <span className="nav-holo-btn__label">SIGN IN</span>
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="site-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hbg-line${menuOpen ? " hbg-line--top-open" : ""}`} />
            <span className={`hbg-line${menuOpen ? " hbg-line--mid-open" : ""}`} />
            <span className={`hbg-line${menuOpen ? " hbg-line--bot-open" : ""}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="site-nav__mobile-drawer">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav__mobile-link${currentPage === link.href ? " site-nav__mobile-link--active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="site-nav__mobile-auth">
              {user ? (
                <button
                  type="button"
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  className="nav-holo-btn nav-holo-btn--wide"
                >
                  <video autoPlay loop muted playsInline aria-hidden="true" className="nav-holo-btn__video">
                    <source src={HOLO_BTN_WEBM} type="video/webm" />
                    <source src={HOLO_BTN_MP4}  type="video/mp4" />
                  </video>
                  <span className="nav-holo-btn__label">SIGN OUT</span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className="nav-holo-btn nav-holo-btn--wide"
                  onClick={() => setMenuOpen(false)}
                >
                  <video autoPlay loop muted playsInline aria-hidden="true" className="nav-holo-btn__video">
                    <source src={HOLO_BTN_WEBM} type="video/webm" />
                    <source src={HOLO_BTN_MP4}  type="video/mp4" />
                  </video>
                  <span className="nav-holo-btn__label">SIGN IN</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

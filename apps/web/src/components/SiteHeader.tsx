"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/lib/useCurrentUser";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact Us" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, loading } = useCurrentUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isPlayRoute = pathname?.startsWith("/play");

  useEffect(() => {
    setMenuOpen(false);
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (!isPlayRoute || menuOpen) return;

    const timer = window.setTimeout(() => {
      setHidden(true);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [isPlayRoute, menuOpen, pathname]);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;

      setScrolled(currentY > 8);

      if (menuOpen) {
        setHidden(false);
        lastY = currentY;
        return;
      }

      const scrollingDown = currentY > lastY + 8;
      const scrollingUp = currentY < lastY - 8;

      if (scrollingDown && currentY > 80) {
        setHidden(true);
      }

      if (scrollingUp || currentY < 40) {
        setHidden(false);
      }

      lastY = currentY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  async function signOut() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    window.dispatchEvent(new Event("wga:user-changed"));
    window.location.href = "/";
  }

  const activePath = pathname || "/";

  const authControls = user ? (
    <>
      <span className="wgaUserPill" title={user.email}>
        👤 {user.displayName}
      </span>

      <button type="button" className="wgaLogoutButton" onClick={signOut}>
        Sign out
      </button>
    </>
  ) : (
    <>
      <Link className="pill" href="/login">
        {loading ? "Checking…" : "Sign in"}
      </Link>

      <Link className="cta smallCta" href="/signup">
        Create account
      </Link>
    </>
  );

  return (
    <header
      className={[
        "wgaHeader",
        scrolled ? "isScrolled" : "",
        hidden ? "isHidden" : "",
        menuOpen ? "isOpen" : "",
        isPlayRoute ? "isPlayRoute" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="wgaHeaderInner">
        <Link className="wgaBrand" href="/" aria-label="WebGameArena home">
          <span className="wgaBrandIcon">W</span>

          <span className="wgaBrandText">
            <strong>WebGameArena</strong>
            <small>Free browser games</small>
          </span>
        </Link>

        <nav className="wgaDesktopNav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={activePath === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="wgaDesktopActions">{authControls}</div>

        <button
          type="button"
          className="wgaMenuButton"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => {
            setHidden(false);
            setMenuOpen((value) => !value);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="wgaMobilePanel" aria-hidden={!menuOpen}>
        <nav className="wgaMobileNav" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}

          <div className="wgaMobileAuth">{authControls}</div>
        </nav>
      </div>
    </header>
  );
}

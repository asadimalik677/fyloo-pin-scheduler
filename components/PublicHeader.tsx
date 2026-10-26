"use client";

import Link from "next/link";
import { useState } from "react";

export default function PublicHeader() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <header className="public-craft-header">
      <div className="public-craft-header-inner">
        <Link href="/" className="public-brand">
          <div className="craft-seal">F</div>
          <div className="public-brand-copy">
            <span className="public-brand-title">Fyloo</span>
            <span className="public-brand-subtitle">Pin Scheduler</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="public-desktop-nav">
          <Link href="/#features" className="public-nav-link">Features</Link>
          <Link href="/#how-it-works" className="public-nav-link">How It Works</Link>
          <Link href="/pricing" className="public-nav-link">Pricing</Link>
          <Link href="/dashboard" className="public-nav-link">Dashboard</Link>
        </nav>

        {/* CTA Actions */}
        <div className="public-header-ctas">
          <Link href="/login" className="craft-btn-outline craft-btn-sm">
            Log In
          </Link>
          <Link href="/signup" className="craft-btn-primary craft-btn-sm">
            Sign Up Free
          </Link>
          <button
            type="button"
            className="public-mobile-btn"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileNav && (
        <div className="public-mobile-drawer">
          <Link href="/#features" onClick={() => setMobileNav(false)}>Features</Link>
          <Link href="/#how-it-works" onClick={() => setMobileNav(false)}>How It Works</Link>
          <Link href="/pricing" onClick={() => setMobileNav(false)}>Pricing</Link>
          <Link href="/dashboard" onClick={() => setMobileNav(false)}>Dashboard</Link>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Link href="/login" onClick={() => setMobileNav(false)} className="craft-btn-outline" style={{ flex: 1, textAlign: "center" }}>
              Log In
            </Link>
            <Link href="/signup" onClick={() => setMobileNav(false)} className="craft-btn-primary" style={{ flex: 1, textAlign: "center" }}>
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

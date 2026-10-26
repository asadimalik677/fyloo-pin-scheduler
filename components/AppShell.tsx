"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  active?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AppShell({
  children,
  active,
  title,
  subtitle,
  actions,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    // Check connection status by checking boards or token
    fetch("/api/boards")
      .then((res) => {
        setConnected(res.ok);
      })
      .catch(() => {
        setConnected(false);
      });
  }, []);

  const navItems = [
    {
      id: "dashboard",
      href: "/dashboard",
      label: "Dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
      ),
    },
    {
      id: "boards",
      href: "/boards",
      label: "Boards",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      id: "compose",
      href: "/compose",
      label: "Composer",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      ),
    },
    {
      id: "bulk",
      href: "/bulk",
      label: "Bulk Scheduler",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="m8.5 10 7 7-7 7" />
          <circle cx="8" cy="8" r="2" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      ),
    },
    {
      id: "queue",
      href: "/queue",
      label: "Queue & Calendar",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="4" rx="2" />
          <path d="M16 2v4" />
          <path d="M8 2v4" />
          <path d="M3 10h18" />
        </svg>
      ),
    },
    {
      id: "drafts",
      href: "/drafts",
      label: "Drafts",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" x2="15" y1="13" y2="13" />
          <line x1="9" x2="13" y1="17" y2="17" />
        </svg>
      ),
    },
    {
      id: "published",
      href: "/published",
      label: "Published History",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      id: "schedule-settings",
      href: "/settings/schedule",
      label: "Schedule Settings",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  const currentTab = active || (pathname ? pathname.replace("/", "") : "dashboard");

  return (
    <div className="craft-app-container">
      {/* Mobile Top Header */}
      <header className="craft-mobile-header">
        <button
          type="button"
          className="craft-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          <span className="craft-hamburger-bar" />
          <span className="craft-hamburger-bar" />
          <span className="craft-hamburger-bar" />
        </button>

        <Link href="/dashboard" className="craft-brand-inline">
          <div className="craft-seal-mini">F</div>
          <span className="craft-brand-title">Fyloo</span>
        </Link>

        <div className="craft-mobile-status">
          {connected === true ? (
            <span className="status-dot connected" title="Pinterest Connected" />
          ) : connected === false ? (
            <Link href="/login" className="craft-reconnect-badge">
              Connect
            </Link>
          ) : null}
        </div>
      </header>

      {/* Responsive Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="craft-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Handcrafted Sidebar */}
      <aside
        className={`craft-sidebar ${mobileMenuOpen ? "is-open" : ""}`}
      >
        <div className="craft-sidebar-brand-card">
          <Link href="/dashboard" className="craft-brand-link">
            <div className="craft-seal">F</div>
            <div className="craft-brand-text">
              <span className="craft-brand-name">Fyloo</span>
              <span className="craft-brand-badge">Pin Scheduler</span>
            </div>
          </Link>
        </div>

        {/* Pinterest Connection Status Banner */}
        <div className="craft-sidebar-connection">
          {connected === true ? (
            <div className="craft-conn-pill is-connected">
              <span className="status-dot connected" />
              <span>Pinterest Active</span>
            </div>
          ) : connected === false ? (
            <Link href="/login" className="craft-conn-pill is-disconnected">
              <span className="status-dot disconnected" />
              <span>Connect Pinterest</span>
            </Link>
          ) : (
            <div className="craft-conn-pill is-checking">
              <span>Checking connection...</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="craft-sidebar-nav">
          <div className="craft-nav-section-label">WORKSPACE</div>
          {navItems.map((item) => {
            const isActive =
              currentTab === item.id ||
              pathname === item.href ||
              (item.id === "dashboard" && pathname === "/dashboard");
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`craft-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="craft-nav-icon">{item.icon}</span>
                <span className="craft-nav-text">{item.label}</span>
                {item.id === "compose" && <span className="craft-badge-hot">+</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="craft-sidebar-footer">
          <div className="craft-nav-section-label">PUBLIC PAGES</div>
          <div className="craft-footer-links">
            <Link href="/" className="craft-footer-link">
              Landing Page
            </Link>
            <span className="craft-dot-sep">•</span>
            <Link href="/pricing" className="craft-footer-link">
              Pricing
            </Link>
            <span className="craft-dot-sep">•</span>
            <Link href="/login" className="craft-footer-link">
              Connect
            </Link>
          </div>
          <p className="craft-sidebar-tagline">
            Handmade with care for the Fyloo shop.
          </p>
        </div>
      </aside>

      {/* Main Workspace View */}
      <main className="craft-main-viewport">
        {(title || actions) && (
          <div className="craft-view-header">
            <div className="craft-view-heading">
              {title && <h1 className="craft-page-title">{title}</h1>}
              {subtitle && <p className="craft-page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="craft-view-actions">{actions}</div>}
          </div>
        )}

        <div className="craft-content-area">{children}</div>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
  active?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

interface UserSession {
  id: string;
  email: string;
  provider: string;
}

export default function AppShell({
  children,
  active,
  title,
  subtitle,
  actions,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // 1. Verify user session
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((j) => {
        if (!j.authenticated) {
          router.push(`/login?redirect=${encodeURIComponent(pathname || "/dashboard")}`);
        } else {
          setUser(j.user);
        }
      })
      .catch(() => {});

    // 2. Check Pinterest connection
    fetch("/api/boards")
      .then((res) => {
        setConnected(res.ok);
      })
      .catch(() => {
        setConnected(false);
      });
  }, [pathname, router]);

  async function handleLogout() {
    await fetch("/api/auth/user-logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navSections = [
    {
      label: "STUDIO CREATIVE",
      items: [
        { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: "📊" },
        { id: "compose", href: "/compose", label: "Pin Composer", icon: "✏️", hot: "+" },
        { id: "ai-creator", href: "/ai-creator", label: "AI Pin Creator", icon: "✨" },
        { id: "bulk", href: "/bulk", label: "Bulk Scheduler", icon: "📦" },
        { id: "drafts", href: "/drafts", label: "Drafts Workshop", icon: "📝" },
      ],
    },
    {
      label: "SCHEDULE & QUEUE",
      items: [
        { id: "queue", href: "/queue", label: "Queue & Calendar", icon: "📅" },
        { id: "planner", href: "/planner", label: "Content Planner", icon: "🗓️" },
        { id: "automation", href: "/automation", label: "Automation Health", icon: "⚡" },
        { id: "schedule-settings", href: "/settings/schedule", label: "Time Slots", icon: "⚙️" },
        { id: "api-keys", href: "/settings/api-keys", label: "API Keys", icon: "🔑" },
      ],
    },
    {
      label: "INTELLIGENCE & SEO",
      items: [
        { id: "keywords", href: "/keywords", label: "Keyword Research", icon: "🔍" },
        { id: "competitor-spy", href: "/competitor-spy", label: "Competitor Spy", icon: "🕵️" },
        { id: "trends", href: "/trends", label: "Trend Radar", icon: "📈" },
        { id: "analytics", href: "/analytics", label: "Pin Analytics", icon: "📉" },
        { id: "growth", href: "/growth", label: "Growth Dashboard", icon: "🌱" },
        { id: "seo-auditor", href: "/seo-auditor", label: "SEO Auditor", icon: "🛡️" },
        { id: "boards", href: "/boards", label: "Boards Manager", icon: "📌" },
        { id: "published", href: "/published", label: "Published History", icon: "✓" },
        { id: "assistant", href: "/assistant", label: "AI Assistant", icon: "🤖" },
      ],
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
          ) : (
            <a href="/api/auth/login" className="craft-reconnect-badge">
              Connect Pinterest
            </a>
          )}
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
      <aside className={`craft-sidebar ${mobileMenuOpen ? "is-open" : ""}`}>
        <div className="craft-sidebar-brand-card">
          <Link href="/dashboard" className="craft-brand-link">
            <div className="craft-seal">F</div>
            <div className="craft-brand-text">
              <span className="craft-brand-name">Fyloo</span>
              <span className="craft-brand-badge">Pin Studio</span>
            </div>
          </Link>
        </div>

        {/* Pinterest Connection Status Banner (Separate step after login) */}
        <div className="craft-sidebar-connection">
          {connected === true ? (
            <div className="craft-conn-pill is-connected">
              <span className="status-dot connected" />
              <span>Pinterest Connected</span>
            </div>
          ) : (
            <a href="/api/auth/login" className="craft-conn-pill is-disconnected">
              <span className="status-dot disconnected" />
              <span>Connect Pinterest →</span>
            </a>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="craft-sidebar-nav">
          {navSections.map((sec, secIdx) => (
            <div key={secIdx} style={{ marginBottom: 12 }}>
              <div className="craft-nav-section-label">{sec.label}</div>
              {sec.items.map((item) => {
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
                    {item.hot && <span className="craft-badge-hot">{item.hot}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer with Logged In User & Logout */}
        <div className="craft-sidebar-footer">
          {user ? (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2D2118", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                👤 {user.email}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <span style={{ fontSize: "0.72rem", color: "#8E7564" }}>Supabase Auth</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#9D1C2F",
                    fontWeight: 700,
                    fontSize: "0.76rem",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : null}

          <div className="craft-footer-links">
            <Link href="/" className="craft-footer-link">Landing</Link>
            <span className="craft-dot-sep">•</span>
            <Link href="/pricing" className="craft-footer-link">Pricing</Link>
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

import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="public-craft-footer">
      <div className="public-footer-inner">
        <div className="public-footer-brand-col">
          <div className="craft-brand-inline">
            <div className="craft-seal-mini">F</div>
            <span className="craft-brand-title">Fyloo Pin Scheduler</span>
          </div>
          <p className="public-footer-tagline">
            Handcrafted pin publishing on autopilot. Designed exclusively for maker shops, artisanal creators, and curated brands.
          </p>
          <div className="public-footer-badge">
            <span className="craft-dot-sep">🌿</span> Handcrafted for the Fyloo Shop
          </div>
        </div>

        <div className="public-footer-links-grid">
          <div className="public-footer-col">
            <h4 className="public-footer-heading">Product</h4>
            <Link href="/#features">Features</Link>
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/pricing">Pricing Plans</Link>
            <Link href="/login">Pinterest Connect</Link>
          </div>

          <div className="public-footer-col">
            <h4 className="public-footer-heading">Workspace</h4>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/compose">Composer</Link>
            <Link href="/bulk">Bulk Scheduler</Link>
            <Link href="/boards">Boards Manager</Link>
          </div>

          <div className="public-footer-col">
            <h4 className="public-footer-heading">Schedule</h4>
            <Link href="/queue">Calendar & Queue</Link>
            <Link href="/drafts">Drafts Workshop</Link>
            <Link href="/published">Published History</Link>
            <Link href="/settings/schedule">Time Slots Settings</Link>
          </div>
        </div>
      </div>

      <div className="public-footer-bottom">
        <p>© {new Date().getFullYear()} Fyloo Pin Scheduler. Built with artisanal care. Single-user Pinterest automation.</p>
        <div className="public-footer-bottom-links">
          <Link href="/dashboard">App Access</Link>
          <span>•</span>
          <Link href="/api/publish-due">Cron Status</Link>
          <span>•</span>
          <Link href="/pricing">Plans</Link>
        </div>
      </div>
    </footer>
  );
}

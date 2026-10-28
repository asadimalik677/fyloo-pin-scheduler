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
            Professional Pinterest automation platform. Schedule pins, automate distribution, research keywords, and track growth on autopilot.
          </p>
          <div className="public-footer-badge">
            Official Pinterest API v5 Integration
          </div>
        </div>
        <div className="public-footer-links-grid">
          <div className="public-footer-col">
            <h4 className="public-footer-heading">Platform</h4>
            <Link href="/#features">Features</Link>
            <Link href="/#how-it-works">How It Works</Link>
            <Link href="/#demo-preview">Analytics Preview</Link>
            <Link href="/pricing">Pricing Plans</Link>
          </div>
          <div className="public-footer-col">
            <h4 className="public-footer-heading">Studio</h4>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/compose">Pin Composer</Link>
            <Link href="/bulk">Bulk Scheduler</Link>
            <Link href="/boards">Boards Manager</Link>
            <Link href="/queue">Calendar & Queue</Link>
          </div>
          <div className="public-footer-col">
            <h4 className="public-footer-heading">Intelligence</h4>
            <Link href="/keywords">Keyword Research</Link>
            <Link href="/competitor-spy">Competitor Spy</Link>
            <Link href="/trends">Trend Radar</Link>
            <Link href="/analytics">Pin Analytics</Link>
            <Link href="/growth">Growth Tracking</Link>
          </div>
        </div>
      </div>
      <div className="public-footer-bottom">
        <p>© {new Date().getFullYear()} Fyloo Pin Scheduler. Built for modern brands and creators. All rights reserved.</p>
        <div className="public-footer-bottom-links">
          <Link href="/dashboard">Studio App</Link>
          <span>•</span>
          <Link href="/api/publish-due">Cron Health</Link>
          <span>•</span>
          <Link href="/pricing">Pricing</Link>
          <span>•</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

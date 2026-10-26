import Link from "next/link";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { isConnected } from "../lib/token";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const connected = await isConnected();

  const features = [
    {
      icon: "✨",
      title: "Pin Composer & Live Preview",
      desc: "Craft beautiful pins with real-time visual previews of your artwork, board tags, formatted descriptions, and product links before anything goes live.",
    },
    {
      icon: "📦",
      title: "Bulk Pin Scheduler",
      desc: "Upload dozens of shop photos in one batch, customize titles individually or share a collection template, and queue them across days effortlessly.",
    },
    {
      icon: "📅",
      title: "Visual Calendar & Queue",
      desc: "See your upcoming pins grouped by day in a tidy calendar timeline. Reschedule time slots, edit details, or remove queued pins with a click.",
    },
    {
      icon: "⚡",
      title: "Hands-Free Auto Publishing",
      desc: "Native background publishing via scheduled crons. Your queued pins publish automatically to Pinterest at the exact moment you choose.",
    },
    {
      icon: "📌",
      title: "Boards Organizer",
      desc: "Browse visual cards for every board in your Pinterest profile. Inspect existing pins and create new pins directly to target collections.",
    },
    {
      icon: "📝",
      title: "Drafts Workshop",
      desc: "Save unfinished pin ideas, seasonal collections, or uncaptioned product shots as drafts to polish and schedule whenever inspiration strikes.",
    },
  ];

  const steps = [
    {
      num: "1",
      title: "Connect Pinterest",
      desc: "Link your Pinterest creator or business account with one click using official OAuth. No complex setup or API keys required.",
    },
    {
      num: "2",
      title: "Create or Bulk Upload Pins",
      desc: "Upload high-res product photos, pick your target board, refine titles and tags, or bulk-schedule an entire seasonal release in seconds.",
    },
    {
      num: "3",
      title: "Set Schedule and Relax",
      desc: "Pick your ideal daily posting slots or let our smart schedule distribute your pins automatically. Auto-publishing handles the rest.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicHeader />

      <main style={{ flex: 1 }}>
        {/* Connection Notice if active */}
        {connected && (
          <div
            style={{
              background: "#EEF5F0",
              borderBottom: "1px solid #C7E0CF",
              padding: "10px 24px",
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#245735",
              fontWeight: 600,
            }}
          >
            ✓ Pinterest account is connected.{" "}
            <Link href="/dashboard" style={{ color: "#9D1C2F", fontWeight: 700, marginLeft: 8 }}>
              Open Workspace Dashboard →
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-eyebrow">Artisanal Pinterest Publishing</div>
          <h1 className="landing-headline">
            Schedule Pinterest Pins Automatically, with Handmade Precision
          </h1>
          <p className="landing-subline">
            The dedicated single-account pin scheduler crafted for the Fyloo shop—keep your boards blooming with daily inspiration on autopilot.
          </p>
          <div className="landing-cta-row">
            <Link href={connected ? "/dashboard" : "/login"} className="craft-btn-primary" style={{ padding: "14px 32px", fontSize: "1.05rem" }}>
              {connected ? "Go to Dashboard" : "Get started"}
            </Link>
            <a href="#how-it-works" className="craft-btn-outline" style={{ padding: "13px 28px", fontSize: "1.05rem" }}>
              See how it works
            </a>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 16, color: "#8E7564", fontSize: "0.86rem", fontWeight: 600 }}>
            <span>✓ Official Pinterest API v5</span>
            <span>•</span>
            <span>✓ No monthly fees</span>
            <span>•</span>
            <span>✓ Direct Board Sync</span>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ padding: "20px 0" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px", padding: "0 20px" }}>
            <h2 style={{ fontSize: "2rem" }}>Tailored Tools for Effortless Pinning</h2>
            <p style={{ color: "#6A5343", fontSize: "1.05rem" }}>
              Everything you need to showcase handmade collections, drive organic traffic, and maintain a consistent presence.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, i) => (
              <div key={i} className="feature-craft-card">
                <div className="feature-icon-badge">{feat.icon}</div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="steps-section">
          <div className="steps-inner">
            <div className="landing-eyebrow" style={{ background: "#FFFDF9" }}>
              Simple 3-Step Routine
            </div>
            <h2 style={{ fontSize: "2.1rem" }}>How It Works in 3 Easy Steps</h2>
            <p style={{ color: "#6A5343", fontSize: "1.05rem", maxWidth: 600, margin: "0 auto" }}>
              Take your Pinterest workflow from sporadic posting to steady, curated growth in under five minutes.
            </p>

            <div className="steps-grid">
              {steps.map((st) => (
                <div key={st.num} className="step-card">
                  <div className="step-number">{st.num}</div>
                  <h3 className="step-title">{st.title}</h3>
                  <p className="step-desc">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser Section */}
        <section style={{ padding: "80px 24px 60px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div className="landing-eyebrow">Fair & Transparent Plans</div>
          <h2 style={{ fontSize: "2.1rem" }}>Crafted for Solo Makers & Growing Shops</h2>
          <p style={{ color: "#6A5343", fontSize: "1.05rem", maxWidth: 620, margin: "0 auto 36px" }}>
            Whether you are just stocking your virtual shelves or shipping high-volume seasonal releases, explore our sample pricing tiers.
          </p>

          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #E7D7C1",
              borderRadius: 20,
              padding: "36px 32px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
              boxShadow: "0 6px 24px rgba(78, 44, 22, 0.06)",
              textAlign: "left",
              marginBottom: 28,
            }}
          >
            <div style={{ padding: 12, borderRight: "1px solid #F0E6D8" }}>
              <span className="craft-pill craft-pill-neutral" style={{ marginBottom: 10 }}>Starter</span>
              <h3 style={{ fontSize: "1.4rem", margin: "8px 0" }}>$12 <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#8E7564" }}>/ mo</span></h3>
              <p style={{ fontSize: "0.88rem", color: "#6A5343", margin: "0 0 12px" }}>For emerging makers starting their Pinterest presence.</p>
              <ul style={{ paddingLeft: 18, fontSize: "0.84rem", color: "#6A5343", margin: 0 }}>
                <li>Up to 100 pins / month</li>
                <li>Single board queues</li>
                <li>Standard daily slots</li>
              </ul>
            </div>

            <div style={{ padding: 12, borderRight: "1px solid #F0E6D8" }}>
              <span className="craft-pill craft-pill-queued" style={{ marginBottom: 10, background: "#9D1C2F", color: "#fff", border: "none" }}>★ Pro (Most Popular)</span>
              <h3 style={{ fontSize: "1.4rem", margin: "8px 0" }}>$24 <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#8E7564" }}>/ mo</span></h3>
              <p style={{ fontSize: "0.88rem", color: "#6A5343", margin: "0 0 12px" }}>For active boutique creators posting daily pins.</p>
              <ul style={{ paddingLeft: 18, fontSize: "0.84rem", color: "#6A5343", margin: 0 }}>
                <li>Unlimited queued pins</li>
                <li>Bulk image uploading</li>
                <li>Custom time slot scheduler</li>
              </ul>
            </div>

            <div style={{ padding: 12 }}>
              <span className="craft-pill craft-pill-neutral" style={{ marginBottom: 10 }}>Business</span>
              <h3 style={{ fontSize: "1.4rem", margin: "8px 0" }}>$48 <span style={{ fontSize: "0.85rem", fontWeight: "normal", color: "#8E7564" }}>/ mo</span></h3>
              <p style={{ fontSize: "0.88rem", color: "#6A5343", margin: "0 0 12px" }}>For high-volume catalogs and multi-collection shops.</p>
              <ul style={{ paddingLeft: 18, fontSize: "0.84rem", color: "#6A5343", margin: 0 }}>
                <li>Priority cron publishing</li>
                <li>Full drafts & history storage</li>
                <li>Dedicated support</li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.82rem", color: "#8E7564", fontStyle: "italic" }}>
              Sample pricing shown for demonstration purposes.
            </span>
            <Link href="/pricing" className="craft-btn-primary">
              View Detailed Plans & Features →
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

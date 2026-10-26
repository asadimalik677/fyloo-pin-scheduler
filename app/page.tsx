import Link from "next/link";
import PublicHeader from "../components/PublicHeader";
import PublicFooter from "../components/PublicFooter";
import { isConnected } from "../lib/token";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const connected = await isConnected();

  const features = [
    {
      icon: "⚡",
      title: "Pin Composer & Live Preview",
      desc: "Compose high-converting pins with real-time visual previews of your artwork, board selection, rich descriptions, and destination links before dispatch.",
    },
    {
      icon: "📦",
      title: "Bulk Multi-Pin Scheduler",
      desc: "Upload dozens of images in a single batch, assign individual or shared metadata, and distribute them smoothly across upcoming days in seconds.",
    },
    {
      icon: "📅",
      title: "Smart Calendar & Queue",
      desc: "Manage scheduled pins in a clear day-by-day calendar timeline. Reorder, reschedule, or adjust posting times with intuitive controls.",
    },
    {
      icon: "🔄",
      title: "Hands-Free Auto-Publishing",
      desc: "Native cloud background dispatch powered by scheduled cron tasks. Your queued pins publish automatically to Pinterest at exact target moments.",
    },
    {
      icon: "📌",
      title: "Interactive Boards Manager",
      desc: "Explore visual cards for every board in your Pinterest profile. Inspect active pins, monitor board metrics, and schedule directly into target boards.",
    },
    {
      icon: "✨",
      title: "AI Creative & SEO Engine",
      desc: "Generate keyword-rich titles, SEO descriptions, and alt tags with zero external subscription costs using built-in algorithmic intelligence.",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Connect Pinterest Account",
      desc: "Authorize your Pinterest creator or business account with one click using the official Pinterest OAuth v5 protocol. Safe, certified, and fast.",
    },
    {
      num: "02",
      title: "Compose or Bulk Upload",
      desc: "Draft individual pins with live visual preview or drag-and-drop 30+ catalog photos at once to populate your publishing pipeline.",
    },
    {
      num: "03",
      title: "Set Your Ideal Schedule",
      desc: "Configure morning, afternoon, and evening posting slots. Let our automatic queue fill your best engagement windows evenly.",
    },
    {
      num: "04",
      title: "Automate & Track Growth",
      desc: "Cloud background workers dispatch each pin right on time without needing your computer running. Monitor reach and click-through performance.",
    },
  ];

  const faqs = [
    {
      q: "Does Fyloo Pin Scheduler require my laptop to stay on?",
      a: "No. All scheduled queues are dispatched through native cloud background workers on Vercel. Once your pins are queued, they publish automatically even when you are offline.",
    },
    {
      q: "Is Fyloo integrated with the official Pinterest API?",
      a: "Yes. Fyloo connects directly through the official Pinterest API v5 using OAuth 2.0 authorization, keeping your account secure and 100% compliant with Pinterest developer guidelines.",
    },
    {
      q: "Can I manage multiple boards and custom daily time slots?",
      a: "Absolutely. You can schedule pins to any public board on your connected account and configure distinct morning, afternoon, and evening dispatch slots in Settings.",
    },
    {
      q: "Can I edit or reschedule pins after adding them to the queue?",
      a: "Yes. You have full control from the Queue & Calendar page to reschedule target dates, modify pin details, or delete items before they are dispatched.",
    },
  ];

  const testimonials = [
    {
      quote: "Scheduling our entire monthly release used to take hours. With Fyloo's bulk scheduler, we queue 40 pins in 10 minutes and our reach grew by 35%.",
      author: "Elena Rostova",
      role: "Studio Founder & E-commerce Seller",
    },
    {
      quote: "The live preview composer and automatic time slots are game-changers. No more setting phone reminders or manual pin uploads.",
      author: "Marcus Chen",
      role: "Digital Brand Creator",
    },
    {
      quote: "Clean, fast, and completely reliable. The background cron publishes like clockwork every morning and evening.",
      author: "Sarah Lindqvist",
      role: "Design Director",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
      <PublicHeader />

      <main style={{ flex: 1 }}>
        {/* Connected account banner */}
        {connected && (
          <div
            style={{
              background: "#F0FDF4",
              borderBottom: "1px solid #BBF7D0",
              padding: "10px 24px",
              textAlign: "center",
              fontSize: "0.88rem",
              color: "#166534",
              fontWeight: 600,
            }}
          >
            ✓ Pinterest account is connected.{" "}
            <Link href="/dashboard" style={{ color: "#2563EB", fontWeight: 700, marginLeft: 8 }}>
              Open Studio Dashboard →
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-eyebrow">
            ⚡ FYLOO PIN SCHEDULER 2.0 • OFFICIAL PINTEREST API V5
          </div>
          <h1 className="landing-headline">
            Automate your Pinterest growth on complete autopilot
          </h1>
          <p className="landing-subline">
            The modern scheduling studio for creators and online shops. Plan weeks of high-converting pins, bulk-upload catalogs, and let automated cloud workers handle the rest.
          </p>

          {/* Benefit Checklist */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 32,
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            <span><span style={{ color: "#16A34A", marginRight: 4 }}>✓</span> Native Background Publishing</span>
            <span><span style={{ color: "#16A34A", marginRight: 4 }}>✓</span> Bulk Multi-Pin Scheduler</span>
            <span><span style={{ color: "#16A34A", marginRight: 4 }}>✓</span> Direct Board Queue Sync</span>
          </div>

          <div className="landing-cta-row">
            <Link
              href={connected ? "/dashboard" : "/signup"}
              className="craft-btn-primary"
              style={{ padding: "12px 28px", fontSize: "1rem" }}
            >
              {connected ? "Go to Dashboard" : "Start free"}
            </Link>
            <a
              href="#demo-preview"
              className="craft-btn-outline"
              style={{ padding: "12px 24px", fontSize: "1rem" }}
            >
              Watch demo ↓
            </a>
          </div>

          <div className="landing-trust-line">
            <span>No credit card required</span>
            <span>•</span>
            <span>Cancel anytime</span>
            <span>•</span>
            <span>Official Pinterest Developer API</span>
          </div>
        </section>

        {/* Features 6-Card Grid */}
        <section id="features" style={{ padding: "32px 0 64px" }}>
          <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 40px", padding: "0 20px" }}>
            <h2 style={{ fontSize: "1.85rem", marginBottom: 8 }}>Everything needed to dominate Pinterest reach</h2>
            <p style={{ color: "#64748B", fontSize: "1rem" }}>
              Powerful creation, queue automation, and strategic scheduling built cleanly into one focused platform.
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

        {/* 4-Step Workflow Section */}
        <section id="how-it-works" className="steps-section">
          <div className="steps-inner">
            <div className="landing-eyebrow">
              STREAMLINED 4-STEP WORKFLOW
            </div>
            <h2 style={{ fontSize: "1.85rem", marginBottom: 8 }}>How Fyloo Pin Scheduler works</h2>
            <p style={{ color: "#64748B", fontSize: "1rem", maxWidth: 580, margin: "0 auto" }}>
              From initial connection to hands-free daily publishing in under four minutes.
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

        {/* Analytics & Workflow Demo Preview Section (Scroll target for 'Watch demo') */}
        <section id="demo-preview" style={{ padding: "72px 20px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 36px" }}>
            <div className="landing-eyebrow">
              PLATFORM INTELLIGENCE
            </div>
            <h2 style={{ fontSize: "1.85rem", marginBottom: 8 }}>Real-time analytics and publication intelligence</h2>
            <p style={{ color: "#64748B", fontSize: "1rem" }}>
              Keep your finger on the pulse of every board, engagement trend, and scheduled dispatch window.
            </p>
          </div>

          {/* 4 Stat Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div className="craft-stat-box">
              <span className="craft-stat-label">Pins Published</span>
              <div className="craft-stat-val">1,280+</div>
              <span style={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 600 }}>↑ +18% this month</span>
            </div>
            <div className="craft-stat-box">
              <span className="craft-stat-label">Total Impressions</span>
              <div className="craft-stat-val">248.5K</div>
              <span style={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 600 }}>↑ +34% vs previous period</span>
            </div>
            <div className="craft-stat-box">
              <span className="craft-stat-label">Saves & Repins</span>
              <div className="craft-stat-val">14,890</div>
              <span style={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 600 }}>↑ 6.2% engagement rate</span>
            </div>
            <div className="craft-stat-box">
              <span className="craft-stat-label">Outbound Store Clicks</span>
              <div className="craft-stat-val">8,420</div>
              <span style={{ fontSize: "0.8rem", color: "#2563EB", fontWeight: 600 }}>High-intent buyer referral</span>
            </div>
          </div>

          {/* Studio Preview Interactive Mock Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E2E8F0",
                paddingBottom: 14,
                marginBottom: 18,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Active Queue Timeline Demo
                </span>
                <h4 style={{ margin: "2px 0 0", fontSize: "1.05rem" }}>Automated Dispatch Queue & Slot Monitor</h4>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span className="craft-pill craft-pill-published">Cron Worker: Active</span>
                <span className="craft-pill craft-pill-queued">12 Pins Ready in Queue</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563EB", marginBottom: 6 }}>
                  TODAY • 09:30 AM (MORNING SLOT)
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#0F172A", marginBottom: 4 }}>
                  Minimalist Ceramic Vases Collection
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  Board: Home Decor Trends • Status: <span style={{ color: "#16A34A", fontWeight: 600 }}>Dispatched</span>
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#D97706", marginBottom: 6 }}>
                  TODAY • 02:45 PM (AFTERNOON SLOT)
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#0F172A", marginBottom: 4 }}>
                  Botanical Linen Table Runner Catalog
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  Board: Dining Inspiration • Status: <span style={{ color: "#D97706", fontWeight: 600 }}>Queued (Next up)</span>
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  TODAY • 08:15 PM (EVENING SLOT)
                </div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "#0F172A", marginBottom: 4 }}>
                  Handmade Terracotta Planters Guide
                </div>
                <div style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  Board: Indoor Gardening • Status: <span style={{ color: "#475569", fontWeight: 600 }}>Queued</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: "48px 20px 64px", background: "#FFFFFF", borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 36px" }}>
              <div className="landing-eyebrow">COMMUNITY PRAISE</div>
              <h2 style={{ fontSize: "1.85rem", marginBottom: 8 }}>Trusted by creators and modern shop owners</h2>
              <p style={{ color: "#64748B", fontSize: "0.98rem" }}>
                See how independent creators simplify their Pinterest marketing workflows.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <p style={{ fontSize: "0.92rem", color: "#334155", lineHeight: 1.55, margin: "0 0 16px", fontStyle: "italic" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0F172A" }}>{t.author}</div>
                    <div style={{ fontSize: "0.78rem", color: "#64748B" }}>{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser Section */}
        <section style={{ padding: "72px 20px 60px", maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
          <div className="landing-eyebrow">TRANSPARENT PLANS</div>
          <h2 style={{ fontSize: "1.85rem", marginBottom: 8 }}>Plans built for creators and growing shops</h2>
          <p style={{ color: "#64748B", fontSize: "1rem", maxWidth: 580, margin: "0 auto 36px" }}>
            Choose the right tier for your catalog size. All plans include official API publishing and automated queue dispatch.
          </p>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "32px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
              textAlign: "left",
              marginBottom: 28,
            }}
          >
            <div style={{ padding: 12, borderRight: "1px solid #F1F5F9" }}>
              <span className="craft-pill craft-pill-neutral" style={{ marginBottom: 8 }}>Starter</span>
              <h3 style={{ fontSize: "1.6rem", margin: "6px 0 2px", fontWeight: 800 }}>$12 <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748B" }}>/ mo</span></h3>
              <p style={{ fontSize: "0.86rem", color: "#475569", margin: "0 0 12px" }}>For emerging makers starting their Pinterest presence.</p>
              <ul style={{ paddingLeft: 18, fontSize: "0.84rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
                <li>60 scheduled pins / month</li>
                <li>Up to 5 synced Pinterest boards</li>
                <li>Composer with live preview</li>
              </ul>
            </div>

            <div style={{ padding: 12, borderRight: "1px solid #F1F5F9" }}>
              <span className="craft-pill" style={{ marginBottom: 8, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>★ Pro (Most Popular)</span>
              <h3 style={{ fontSize: "1.6rem", margin: "6px 0 2px", fontWeight: 800 }}>$24 <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748B" }}>/ mo</span></h3>
              <p style={{ fontSize: "0.86rem", color: "#475569", margin: "0 0 12px" }}>For active boutique creators posting daily pins.</p>
              <ul style={{ paddingLeft: 18, fontSize: "0.84rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
                <li>Unlimited scheduled pins</li>
                <li>Bulk multi-image uploader</li>
                <li>Custom daily posting slots</li>
              </ul>
            </div>

            <div style={{ padding: 12 }}>
              <span className="craft-pill craft-pill-neutral" style={{ marginBottom: 8 }}>Business</span>
              <h3 style={{ fontSize: "1.6rem", margin: "6px 0 2px", fontWeight: 800 }}>$48 <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "#64748B" }}>/ mo</span></h3>
              <p style={{ fontSize: "0.86rem", color: "#475569", margin: "0 0 12px" }}>For high-volume catalogs and multi-collection shops.</p>
              <ul style={{ paddingLeft: 18, fontSize: "0.84rem", color: "#475569", margin: 0, lineHeight: 1.6 }}>
                <li>Priority cloud cron publishing</li>
                <li>Unlimited boards & drafts storage</li>
                <li>Extended analytics archive</li>
              </ul>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748B" }}>
              Sample pricing shown for demonstration purposes.
            </span>
            <Link href="/pricing" className="craft-btn-primary">
              View Detailed Plan Comparison →
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: "48px 20px 80px", maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="landing-eyebrow">QUESTIONS & ANSWERS</div>
            <h2 style={{ fontSize: "1.85rem", marginBottom: 8 }}>Frequently Asked Questions</h2>
            <p style={{ color: "#64748B", fontSize: "0.98rem" }}>
              Common questions about automated scheduling, account connection, and reliability.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: 10,
                  padding: "18px 20px",
                }}
              >
                <h4 style={{ margin: "0 0 6px", fontSize: "0.98rem", color: "#0F172A" }}>{faq.q}</h4>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#475569", lineHeight: 1.5 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

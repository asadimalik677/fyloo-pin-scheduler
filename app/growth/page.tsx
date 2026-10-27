"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { GrowthMetrics } from "../../lib/growth";

export default function GrowthDashboardPage() {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/growth")
      .then((r) => r.json())
      .then((j) => setMetrics(j.metrics ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      active="growth"
      title="Growth & Attribution Dashboard"
      subtitle="Track verified keyword trends, pin distribution performance, and actionable growth opportunities."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/keywords" className="craft-btn-secondary craft-btn-sm">
            Keyword Research →
          </Link>
          <Link href="/compose" className="craft-btn-primary">
            + Schedule Pin
          </Link>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
          Retrieving growth signals and real keyword relative interest...
        </div>
      ) : metrics ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Connect Pinterest Banner if disconnected */}
          {!metrics.connected && (
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 14,
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: "1.2rem" }}>📈</span>
                  <strong style={{ color: "#1E3A8A", fontSize: "1rem" }}>
                    Connect Pinterest for real data
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "#475569", maxWidth: 640 }}>
                  Account traffic velocity, save growth, and referral visits require an authorized Pinterest account. No invented numbers or fake percentages are shown.
                </p>
              </div>
              <a
                href="/api/auth/login"
                className="craft-btn-primary"
                style={{ padding: "10px 20px", fontSize: "0.88rem" }}
              >
                Connect Pinterest Account →
              </a>
            </div>
          )}

          {/* Top Growth KPIs */}
          <div className="craft-stats-grid">
            <div className="craft-stat-box featured">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Traffic Velocity</span>
                <span style={{ fontSize: "1.2rem" }}>🚀</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#2563EB", fontSize: metrics.connected ? "1.6rem" : "1.05rem" }}>
                {metrics.trafficVelocity}
              </div>
              <div className="craft-stat-desc">Monthly organic reach momentum</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Save Rate Growth</span>
                <span style={{ fontSize: "1.2rem" }}>📌</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#0F172A", fontSize: metrics.connected ? "1.6rem" : "1.05rem" }}>
                {metrics.saveGrowth}
              </div>
              <div className="craft-stat-desc">Repin engagement acceleration</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Attributed Shop Visits</span>
                <span style={{ fontSize: "1.2rem" }}>🛍️</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#0F172A", fontSize: metrics.monthlyVisits !== null ? "1.6rem" : "1.05rem" }}>
                {metrics.monthlyVisits !== null ? metrics.monthlyVisits.toLocaleString() : "Connect Pinterest for real data"}
              </div>
              <div className="craft-stat-desc">Referral traffic to shop links</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Keyword Share</span>
                <span style={{ fontSize: "1.2rem" }}>🎯</span>
              </div>
              <div className="craft-stat-val" style={{ fontSize: metrics.connected ? "1.6rem" : "1.05rem" }}>
                {metrics.keywordShare}
              </div>
              <div className="craft-stat-desc">Organic search presence</div>
            </div>
          </div>

          {/* Actionable Recommendations Spotlight */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>💡</span>
                <h3 className="craft-card-title">Priority Growth Recommendations</h3>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {metrics.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 6px", fontSize: "1.05rem", color: "#0F172A" }}>
                      {rec.title}
                    </h4>
                    <p style={{ margin: "0 0 14px", fontSize: "0.86rem", color: "#475569", lineHeight: 1.5 }}>
                      {rec.description}
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 12 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2563EB" }}>
                      {rec.impact}
                    </span>
                    <Link href={rec.actionLink} className="craft-btn-outline craft-btn-sm" style={{ fontSize: "0.8rem" }}>
                      {rec.actionLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Keyword Trend Visibility Table */}
          <div className="craft-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "#0F172A" }}>Saved Keywords & Google Trends Signal</h3>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748B" }}>
                Relative interest (0-100) measured via Google Trends. Never search volume.
              </p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 18px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>Keyword</th>
                    <th style={{ padding: "12px 18px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>Relative Interest</th>
                    <th style={{ padding: "12px 18px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>Data Source</th>
                    <th style={{ padding: "12px 18px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>Account Ranking</th>
                    <th style={{ padding: "12px 18px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.keywordRankings.map((k, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 18px", fontWeight: 650, color: "#0F172A" }}>
                        {k.keyword}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.88rem" }}>
                        {k.relativeInterest !== null ? (
                          <span style={{ fontWeight: 700, color: "#2563EB" }}>
                            {k.relativeInterest}/100
                          </span>
                        ) : (
                          <span style={{ color: "#94A3B8", fontStyle: "italic" }}>not available</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.82rem", color: "#64748B" }}>
                        <span className="craft-pill craft-pill-neutral">{k.trendSource}</span>
                      </td>
                      <td style={{ padding: "12px 18px", fontSize: "0.85rem", color: "#64748B" }}>
                        {k.accountRank}
                      </td>
                      <td style={{ padding: "12px 18px", textAlign: "right" }}>
                        <Link
                          href={`/compose?tags=${encodeURIComponent(k.keyword)}`}
                          className="craft-btn-outline craft-btn-sm"
                          style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                        >
                          Pin Topic
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

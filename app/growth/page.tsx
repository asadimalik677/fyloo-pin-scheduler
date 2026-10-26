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
      subtitle="Track keyword visibility trajectory, content format performance, and actionable growth opportunities."
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
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Analyzing growth trajectory and keyword rankings...
        </div>
      ) : metrics ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top Growth KPIs */}
          <div className="craft-stats-grid">
            <div className="craft-stat-box featured">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Traffic Velocity</span>
                <span style={{ fontSize: "1.2rem" }}>🚀</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#2E8B57", fontSize: "1.8rem" }}>
                {metrics.trafficVelocity}
              </div>
              <div className="craft-stat-desc">Monthly organic reach momentum</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Save Rate Growth</span>
                <span style={{ fontSize: "1.2rem" }}>📌</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#9D1C2F", fontSize: "1.8rem" }}>
                {metrics.saveGrowth}
              </div>
              <div className="craft-stat-desc">Repin engagement acceleration</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Attributed Shop Visits</span>
                <span style={{ fontSize: "1.2rem" }}>🛍️</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#C27438", fontSize: "1.8rem" }}>
                ~{metrics.monthlyVisits.toLocaleString()}
              </div>
              <div className="craft-stat-desc">Monthly referral traffic to shop</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Keyword Share</span>
                <span style={{ fontSize: "1.2rem" }}>🎯</span>
              </div>
              <div className="craft-stat-val" style={{ fontSize: "1.35rem", lineHeight: 1.25 }}>
                Top 5
              </div>
              <div className="craft-stat-desc">Ranked in 4 core maker categories</div>
            </div>
          </div>

          {/* Actionable Recommendations Spotlight */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>💡</span>
                <h3 className="craft-card-title">Priority Growth Recommendations</h3>
              </div>
              <span className="craft-pill craft-pill-queued">Actionable AI Insights</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {metrics.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E7D7C1",
                    borderRadius: 14,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 750, color: "#2D2118", fontSize: "1.05rem" }}>
                        {rec.title}
                      </span>
                    </div>
                    <p style={{ margin: "0 0 12px", fontSize: "0.86rem", color: "#6A5343", lineHeight: 1.48 }}>
                      {rec.description}
                    </p>
                    <div style={{ fontSize: "0.78rem", color: "#2E8B57", fontWeight: 700, marginBottom: 16 }}>
                      ★ Expected Impact: {rec.impact}
                    </div>
                  </div>

                  <Link href={rec.actionLink} className="craft-btn-secondary craft-btn-sm" style={{ textAlign: "center" }}>
                    {rec.actionLabel}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Keyword Progress & Content Formats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
            {/* Keyword Position Tracker */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Target Keyword Rankings</h3>
                <Link href="/keywords" className="craft-btn-outline craft-btn-sm">
                  Manage Keywords →
                </Link>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FBF4EA", borderBottom: "1px solid #E7D7C1" }}>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "0.8rem", color: "#6A5343", textTransform: "uppercase" }}>Keyword</th>
                      <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "0.8rem", color: "#6A5343", textTransform: "uppercase" }}>Rank</th>
                      <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "0.8rem", color: "#6A5343", textTransform: "uppercase" }}>Monthly Vol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.keywordRankings.map((kr, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #F0E6D8" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "#2D2118", fontSize: "0.9rem" }}>
                          {kr.keyword}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center" }}>
                          <span
                            style={{
                              background: kr.rank <= 3 ? "#EEF5F0" : "#FAF4EB",
                              color: kr.rank <= 3 ? "#245735" : "#7B5610",
                              padding: "3px 8px",
                              borderRadius: 9999,
                              fontWeight: 800,
                              fontSize: "0.82rem",
                            }}
                          >
                            #{kr.rank} {kr.change > 0 ? `(▲${kr.change})` : `(▼${Math.abs(kr.change)})`}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontSize: "0.84rem", color: "#6A5343" }}>
                          {kr.monthlyVolume}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Content Format Velocity */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Content Format Velocity</h3>
                <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>What performs best</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {metrics.contentFormatPerformance.map((fp, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E7D7C1",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: "#2D2118", fontSize: "0.95rem" }}>
                        {fp.format}
                      </span>
                      <span className="craft-pill craft-pill-neutral" style={{ fontSize: "0.72rem" }}>
                        {fp.shareOfPins} of pins
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 14, fontSize: "0.82rem", color: "#8E7564", margin: "6px 0 8px" }}>
                      <span>★ Avg Saves: <strong style={{ color: "#C27438" }}>{fp.avgSaves}</strong></span>
                      <span>↗ Avg Clicks: <strong style={{ color: "#2E8B57" }}>{fp.avgClicks}</strong></span>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.82rem", color: "#6A5343", fontStyle: "italic" }}>
                      "{fp.recommendation}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

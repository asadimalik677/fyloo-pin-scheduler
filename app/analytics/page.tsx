"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { AnalyticsSummary } from "../../lib/analytics";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((j) => setData(j.analytics ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      active="analytics"
      title="Pin & Account Analytics"
      subtitle="Track your Pinterest impressions, pin saves, outbound shop clicks, and collection benchmarks."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/growth" className="craft-btn-secondary craft-btn-sm">
            Growth Dashboard →
          </Link>
          <Link href="/published" className="craft-btn-outline craft-btn-sm">
            Published History
          </Link>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Calculating pin performance metrics...
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top 4 Stat Cards */}
          <div className="craft-stats-grid">
            <div className="craft-stat-box featured">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Total Impressions</span>
                <span style={{ fontSize: "1.2rem" }}>👁️</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#9D1C2F" }}>
                {data.impressions.toLocaleString()}
              </div>
              <div className="craft-stat-desc">Pin views across feeds & search</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Total Saves (Repins)</span>
                <span style={{ fontSize: "1.2rem" }}>📌</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#C27438" }}>
                {data.saves.toLocaleString()}
              </div>
              <div className="craft-stat-desc">Shoppers who saved your pins</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Outbound Clicks</span>
                <span style={{ fontSize: "1.2rem" }}>↗</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#2E8B57" }}>
                {data.outboundClicks.toLocaleString()}
              </div>
              <div className="craft-stat-desc">Direct visits to your shop link</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Avg. Click Rate</span>
                <span style={{ fontSize: "1.2rem" }}>📈</span>
              </div>
              <div className="craft-stat-val">
                {data.ctr}%
              </div>
              <div className="craft-stat-desc">Industry benchmark: 1.5% - 2.8%</div>
            </div>
          </div>

          {/* Account Performance Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
            {/* Board Performance Breakdown */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Performance by Pinterest Board</h3>
                <span style={{ fontSize: "0.82rem", color: "#8E7564" }}>
                  {data.boardMetrics.length} boards
                </span>
              </div>

              {data.boardMetrics.length === 0 ? (
                <p style={{ color: "#8E7564" }}>No boards connected yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.boardMetrics.map((b) => (
                    <div
                      key={b.boardId}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E7D7C1",
                        borderRadius: 12,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: "#2D2118", fontSize: "0.98rem" }}>
                          📁 {b.boardName}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#8E7564" }}>
                          {b.pinCount} pins in collection
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "#C27438", fontSize: "0.95rem" }}>
                            {b.saves}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#8E7564", textTransform: "uppercase" }}>
                            Saves
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 700, color: "#2E8B57", fontSize: "0.95rem" }}>
                            {b.clicks}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#8E7564", textTransform: "uppercase" }}>
                            Clicks
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Activity & Posting Cadence */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Weekly Cadence</h3>
                <span style={{ fontSize: "0.82rem", color: "#8E7564" }}>Velocity</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.weeklyActivity.map((w) => (
                  <div key={w.day} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 36, fontWeight: 700, fontSize: "0.88rem", color: "#6A5343" }}>
                      {w.day}
                    </span>
                    <div style={{ flex: 1, height: 10, background: "#FAF4EB", borderRadius: 9999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          background: w.pins > 1 ? "#9D1C2F" : "#C27438",
                          width: `${(w.views / 900) * 100}%`,
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#8E7564", width: 64, textAlign: "right" }}>
                      {w.pins} {w.pins === 1 ? "pin" : "pins"}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#EEF5F0",
                  border: "1px solid #C7E0CF",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#245735",
                  marginTop: 20,
                  lineHeight: 1.5,
                }}
              >
                🌿 <strong>Artisan Tip:</strong> Posting 1 to 2 pins daily maintains consistent Pinterest algorithm engagement better than posting 14 pins all on one day.
              </div>
            </div>
          </div>

          {/* Top Performing Pins Leaderboard */}
          <div className="craft-card">
            <div className="craft-card-header">
              <h3 className="craft-card-title">Top Performing Pins Leaderboard</h3>
              <span style={{ fontSize: "0.82rem", color: "#8E7564" }}>
                Ranked by CTR & Saves
              </span>
            </div>

            {data.topPins.length === 0 ? (
              <p style={{ color: "#8E7564", fontStyle: "italic" }}>
                No published pins recorded yet. As your scheduled queue publishes pins, your top performers will be ranked here.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FBF4EA", borderBottom: "1px solid #E7D7C1" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Pin Title</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Board</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Impressions</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Saves</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Clicks</th>
                      <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPins.map((tp, idx) => (
                      <tr key={tp.id} style={{ borderBottom: "1px solid #F0E6D8" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2D2118" }}>
                          #{idx + 1} {tp.title}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "#6A5343" }}>
                          {tp.boardName}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 650 }}>
                          {tp.impressions.toLocaleString()}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#C27438", fontWeight: 700 }}>
                          {tp.saves}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", color: "#2E8B57", fontWeight: 700 }}>
                          {tp.clicks}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 750, color: "#9D1C2F" }}>
                          {tp.ctr}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

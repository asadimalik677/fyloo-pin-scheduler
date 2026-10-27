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
      subtitle="Track your verified Pinterest engagement, scheduled pin velocity, and board distributions."
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
        <div style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
          Retrieving pin analytics and account telemetry...
        </div>
      ) : data ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Connect Pinterest Alert if disconnected */}
          {!data.connected && (
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
                  <span style={{ fontSize: "1.2rem" }}>📌</span>
                  <strong style={{ color: "#1E3A8A", fontSize: "1rem" }}>
                    Connect Pinterest for real data
                  </strong>
                </div>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "#475569", maxWidth: 640 }}>
                  Impressions, saves, and outbound clicks require an authorized Pinterest account connection. Zero invented or synthetic numbers are displayed.
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

          {/* Top 4 Stat Cards */}
          <div className="craft-stats-grid">
            <div className="craft-stat-box featured">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Total Impressions</span>
                <span style={{ fontSize: "1.2rem" }}>👁️</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#2563EB", fontSize: data.impressions !== null ? "1.8rem" : "1.05rem" }}>
                {data.impressions !== null ? data.impressions.toLocaleString() : "Connect Pinterest for real data"}
              </div>
              <div className="craft-stat-desc">Pin views across feeds & search</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Total Saves (Repins)</span>
                <span style={{ fontSize: "1.2rem" }}>📌</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#0F172A", fontSize: data.saves !== null ? "1.8rem" : "1.05rem" }}>
                {data.saves !== null ? data.saves.toLocaleString() : "Connect Pinterest for real data"}
              </div>
              <div className="craft-stat-desc">Shoppers who saved your pins</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Outbound Clicks</span>
                <span style={{ fontSize: "1.2rem" }}>↗</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#0F172A", fontSize: data.outboundClicks !== null ? "1.8rem" : "1.05rem" }}>
                {data.outboundClicks !== null ? data.outboundClicks.toLocaleString() : "Connect Pinterest for real data"}
              </div>
              <div className="craft-stat-desc">Direct visits to your shop link</div>
            </div>

            <div className="craft-stat-box">
              <div className="craft-stat-head">
                <span className="craft-stat-label">Active Queue Pins</span>
                <span style={{ fontSize: "1.2rem" }}>🗓️</span>
              </div>
              <div className="craft-stat-val" style={{ color: "#15803D" }}>
                {data.queuedCount}
              </div>
              <div className="craft-stat-desc">{data.publishedCount} pins published</div>
            </div>
          </div>

          {/* Account Performance Matrix */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
            {/* Board Performance Breakdown */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Performance by Pinterest Board</h3>
                <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  {data.boardMetrics.length} boards
                </span>
              </div>

              {data.boardMetrics.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#64748B" }}>
                  <p style={{ margin: "0 0 10px" }}>No board metrics available.</p>
                  <p style={{ fontSize: "0.82rem", margin: 0, fontStyle: "italic" }}>
                    Connect Pinterest for real data to see individual board analytics.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {data.boardMetrics.map((b) => (
                    <div
                      key={b.boardId}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
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
                        <div style={{ fontWeight: 700, color: "#0F172A", fontSize: "0.98rem" }}>
                          📁 {b.boardName}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                          {b.pinCount} pins in collection
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, color: "#64748B", fontSize: "0.88rem" }}>
                            {b.saves}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase" }}>
                            Saves
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, color: "#64748B", fontSize: "0.88rem" }}>
                            {b.clicks}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase" }}>
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
                <h3 className="craft-card-title">Real Scheduled Cadence</h3>
                <span style={{ fontSize: "0.82rem", color: "#64748B" }}>Weekly Schedule</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.weeklyActivity.map((w) => (
                  <div key={w.day} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 36, fontWeight: 700, fontSize: "0.88rem", color: "#0F172A" }}>
                      {w.day}
                    </span>
                    <div style={{ flex: 1, height: 10, background: "#F1F5F9", borderRadius: 9999, overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          background: w.pins > 0 ? "#2563EB" : "#E2E8F0",
                          width: `${Math.min((w.pins / 5) * 100, 100)}%`,
                          borderRadius: 9999,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "#64748B", width: 64, textAlign: "right" }}>
                      {w.pins} {w.pins === 1 ? "pin" : "pins"}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.84rem",
                  color: "#475569",
                  marginTop: 20,
                  lineHeight: 1.5,
                }}
              >
                📊 <strong>Cadence Note:</strong> Graph displays your real scheduled pins queue distribution across the week.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

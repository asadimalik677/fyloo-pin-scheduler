"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { SeasonalQuarter, TrendItem } from "../../lib/trends";

export default function TrendRadarPage() {
  const [calendar, setCalendar] = useState<SeasonalQuarter[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q3");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then((j) => {
        setCalendar(j.calendar ?? []);
        setTrends(j.risingTrends ?? []);
        setConnected(Boolean(j.connected));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeQuarterData = calendar.find((c) => c.quarter === selectedQuarter) || calendar[0];

  const filteredTrends = trends.filter((t) => {
    if (filterCategory === "all") return true;
    return t.category === filterCategory;
  });

  return (
    <AppShell
      active="trends"
      title="Pinterest Trend Radar"
      subtitle="Discover rising search queries sourced from Google Trends and plan your pin timing with the seasonal radar."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/keywords" className="craft-btn-outline craft-btn-sm">
            Keyword Research →
          </Link>
          <Link href="/compose" className="craft-btn-primary">
            + Create Trending Pin
          </Link>
        </div>
      }
    >
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
          Scanning Google Trends rising queries and seasonal radar...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Account Telemetry Notice if not connected */}
          {!connected && (
            <div
              style={{
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <strong style={{ color: "#1E3A8A", fontSize: "0.95rem" }}>
                  Connect Pinterest for real account trend data
                </strong>
                <p style={{ margin: "2px 0 0", fontSize: "0.84rem", color: "#475569" }}>
                  Global trend signals below are sourced in real-time from Google Trends. Account-specific audience trends require an authorized Pinterest connection.
                </p>
              </div>
              <a href="/api/auth/login" className="craft-btn-primary craft-btn-sm">
                Connect Account
              </a>
            </div>
          )}

          {/* Seasonal Calendar & Timing Engine */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <div>
                <h3 className="craft-card-title">Artisan Seasonal Radar</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "#64748B" }}>
                  Pinterest users search 45 to 60 days before an event. Plan your pins according to this maker calendar.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {calendar.map((c) => (
                  <button
                    key={c.quarter}
                    type="button"
                    onClick={() => setSelectedQuarter(c.quarter)}
                    className={selectedQuarter === c.quarter ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
                  >
                    {c.quarter}
                  </button>
                ))}
              </div>
            </div>

            {activeQuarterData && (
              <div
                style={{
                  background: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  borderRadius: 14,
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1.7fr",
                  gap: 24,
                }}
              >
                <div>
                  <span className="craft-pill craft-pill-queued" style={{ marginBottom: 8 }}>
                    {activeQuarterData.months}
                  </span>
                  <h4 style={{ fontSize: "1.25rem", margin: "8px 0", color: "#0F172A" }}>
                    {activeQuarterData.season}
                  </h4>
                  <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.55, margin: "0 0 16px" }}>
                    {activeQuarterData.focus}
                  </p>
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      color: "#2563EB",
                      fontWeight: 600,
                    }}
                  >
                    ⏰ Timing: {activeQuarterData.actionableWindow}
                  </div>
                </div>

                <div>
                  <h5 style={{ margin: "0 0 10px", fontSize: "0.85rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Top Trending Searches for this window:
                  </h5>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {activeQuarterData.topSearches.map((s, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 14px",
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                          borderRadius: 8,
                          fontSize: "0.88rem",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "#0F172A" }}>
                          🔍 {s}
                        </span>
                        <Link
                          href={`/compose?title=${encodeURIComponent(s)}&tags=${encodeURIComponent(s.toLowerCase().replace(/\s+/g, ", "))}`}
                          className="craft-btn-outline craft-btn-sm"
                          style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                        >
                          Use Idea →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rising Topics Leaderboard */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <div>
                <h3 className="craft-card-title">Real Rising Queries (Google Trends)</h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748B" }}>
                  Verified rising relative interest from Google Trends. Never estimated search volume.
                </p>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["all", "Ceramics & Pottery", "Home & Living", "Gifting & Holidays"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={filterCategory === cat ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
                    style={{ fontSize: "0.78rem", padding: "4px 12px" }}
                  >
                    {cat === "all" ? "All Niches" : cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {filteredTrends.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: 14,
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span className="craft-pill craft-pill-neutral" style={{ fontSize: "0.72rem" }}>
                      {t.category}
                    </span>
                    <span
                      style={{
                        background: "#EFF6FF",
                        color: "#1D4ED8",
                        border: "1px solid #BFDBFE",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                      }}
                    >
                      {t.growth}
                    </span>
                  </div>

                  <h4 style={{ margin: "4px 0 8px", fontSize: "1.1rem", lineHeight: 1.3, color: "#0F172A" }}>
                    {t.topic}
                  </h4>

                  <div style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 12 }}>
                    Source: <strong style={{ color: "#2563EB" }}>{t.source}</strong>
                  </div>

                  {/* Recommended Hashtags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14, flex: 1 }}>
                    {t.recommendedTags.map((tag, idx) => (
                      <span key={idx} className="pin-tag-chip" style={{ fontSize: "0.72rem" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/compose?title=${encodeURIComponent(t.topic)}&tags=${encodeURIComponent(t.recommendedTags.join(", "))}`}
                    className="craft-btn-primary craft-btn-sm"
                    style={{ width: "100%", textAlign: "center" }}
                  >
                    Create Pin for this Trend →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

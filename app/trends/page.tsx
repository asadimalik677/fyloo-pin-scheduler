"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { SeasonalQuarter, TrendItem } from "../../lib/trends";

export default function TrendRadarPage() {
  const [calendar, setCalendar] = useState<SeasonalQuarter[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q3");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trends")
      .then((r) => r.json())
      .then((j) => {
        setCalendar(j.calendar ?? []);
        setTrends(j.risingTrends ?? []);
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
      subtitle="Discover rising aesthetics, breakout seasonal topics, and timing predictions for your handmade collections."
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
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Scanning Pinterest trend signals and seasonal calendars...
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Seasonal Calendar & Timing Engine */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <div>
                <h3 className="craft-card-title">Artisan Seasonal Radar</h3>
                <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "#8E7564" }}>
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
                  background: "#FFFDF9",
                  border: "1.5px solid #E7D7C1",
                  borderRadius: 16,
                  padding: "24px 26px",
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1.7fr",
                  gap: 28,
                }}
              >
                <div>
                  <span className="craft-pill craft-pill-queued" style={{ marginBottom: 8 }}>
                    {activeQuarterData.months}
                  </span>
                  <h4 style={{ fontSize: "1.35rem", margin: "8px 0" }}>
                    {activeQuarterData.season}
                  </h4>
                  <p style={{ color: "#6A5343", fontSize: "0.92rem", lineHeight: 1.55, margin: "0 0 16px" }}>
                    {activeQuarterData.focus}
                  </p>
                  <div
                    style={{
                      background: "#FAF4EB",
                      border: "1px solid #E7D7C1",
                      borderRadius: 10,
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                      color: "#9D1C2F",
                      fontWeight: 650,
                    }}
                  >
                    ⏰ Timing: {activeQuarterData.actionableWindow}
                  </div>
                </div>

                <div>
                  <h5 style={{ margin: "0 0 10px", fontSize: "0.95rem", color: "#8E7564", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                          border: "1px solid #E7D7C1",
                          borderRadius: 8,
                          fontSize: "0.9rem",
                        }}
                      >
                        <span style={{ fontWeight: 650, color: "#2D2118" }}>
                          🔍 {s}
                        </span>
                        <Link
                          href={`/compose?title=${encodeURIComponent(s)}&tags=${encodeURIComponent(s.toLowerCase().replace(/\s+/g, ", "))}`}
                          className="craft-btn-secondary craft-btn-sm"
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
              <h3 className="craft-card-title">Rising Pinterest Maker Trends</h3>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["all", "Ceramics & Pottery", "Home & Living", "Gifting & Holidays", "Craft Techniques"].map((cat) => (
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
              {filteredTrends.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E7D7C1",
                    borderRadius: 16,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 2px 8px rgba(78, 44, 22, 0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span className="craft-pill craft-pill-neutral" style={{ fontSize: "0.75rem" }}>
                      {t.category}
                    </span>
                    <span
                      style={{
                        background: "#EEF5F0",
                        color: "#245735",
                        border: "1px solid #C7E0CF",
                        padding: "3px 10px",
                        borderRadius: 9999,
                        fontSize: "0.82rem",
                        fontWeight: 800,
                      }}
                    >
                      {t.growth}
                    </span>
                  </div>

                  <h4 style={{ margin: "4px 0 8px", fontSize: "1.18rem", lineHeight: 1.3 }}>
                    {t.topic}
                  </h4>

                  <p style={{ fontSize: "0.86rem", color: "#6A5343", margin: "0 0 14px", lineHeight: 1.48, flex: 1 }}>
                    {t.description}
                  </p>

                  <div style={{ fontSize: "0.8rem", color: "#8E7564", marginBottom: 8 }}>
                    Peak Month: <strong>{t.peakMonth}</strong>
                  </div>

                  {/* Recommended Hashtags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
                    {t.recommendedTags.map((tag, idx) => (
                      <span key={idx} className="pin-tag-chip" style={{ fontSize: "0.72rem" }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Direct Composer Action */}
                  <Link
                    href={`/compose?title=${encodeURIComponent(t.sampleTitle)}&tags=${encodeURIComponent(t.recommendedTags.join(", "))}`}
                    className="craft-btn-primary craft-btn-sm"
                    style={{ textAlign: "center", width: "100%" }}
                  >
                    + Create Pin with this Trend
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

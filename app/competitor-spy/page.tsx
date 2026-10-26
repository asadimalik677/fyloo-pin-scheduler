"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface CompetitorProfile {
  handle: string;
  name: string;
  bio: string;
  followers: string;
  monthlyViews: string;
  boards: {
    id: string;
    name: string;
    pinCount: number;
    description: string;
    topics: string[];
  }[];
  topPins: {
    id: string;
    title: string;
    description: string;
    hashtags: string[];
    linkDomain: string;
    estimatedSaves: number;
  }[];
}

interface ContentGap {
  topic: string;
  competitorBoard: string;
  opportunity: "High" | "Medium";
  suggestedAction: string;
}

export default function CompetitorSpyPage() {
  const [handle, setHandle] = useState("potterycrafts");
  const [profile, setProfile] = useState<CompetitorProfile | null>(null);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function fetchCompetitor(h: string = handle) {
    if (!h.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/competitors?handle=${encodeURIComponent(h.trim())}`);
      const json = await res.json();
      if (res.ok) {
        setProfile(json.profile);
        setContentGaps(json.contentGaps ?? []);
      } else {
        setStatusMsg(`Error: ${json.error || "Lookup failed"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Network error"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCompetitor("potterycrafts");
  }, []);

  const sampleCompetitors = ["potterycrafts", "artisanwoodcraft", "claystudio", "linenmaker", "ceramicdesign"];

  return (
    <AppShell
      active="competitor-spy"
      title="Competitor Spy & Content Gaps"
      subtitle="Analyze top creators in your niche, inspect their board strategies, and discover untargeted search topics."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/keywords" className="craft-btn-secondary craft-btn-sm">
            Keyword Research →
          </Link>
          <Link href="/compose" className="craft-btn-primary">
            + New Pin
          </Link>
        </div>
      }
    >
      {/* Search Bar Card */}
      <div className="craft-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchCompetitor();
          }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}
        >
          <input
            type="text"
            className="craft-input"
            style={{ flex: 1, minWidth: 260, fontSize: "1.05rem" }}
            placeholder="Enter Pinterest creator handle (e.g. potterycrafts, artisanwoodcraft)..."
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
          />
          <button type="submit" disabled={loading} className="craft-btn-primary">
            {loading ? "Analyzing..." : "🔎 Inspect Competitor"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span style={{ color: "#8E7564", fontWeight: 650 }}>Suggested creator profiles:</span>
          {sampleCompetitors.map((samp) => (
            <button
              key={samp}
              type="button"
              onClick={() => {
                setHandle(samp);
                fetchCompetitor(samp);
              }}
              style={{
                background: "#FAF4EB",
                border: "1px solid #E7D7C1",
                padding: "3px 10px",
                borderRadius: 9999,
                fontSize: "0.82rem",
                color: "#6A5343",
                cursor: "pointer",
              }}
            >
              @{samp}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div style={{ background: "#FDF0F2", border: "1px solid #F3BAC2", color: "#9D1C2F", padding: "12px 18px", borderRadius: 12, marginBottom: 20 }}>
          {statusMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Inspecting public boards and extracting top pin metadata...
        </div>
      ) : profile && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Creator Profile Header Card */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div className="craft-seal" style={{ width: 56, height: 56, fontSize: "1.8rem" }}>
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "1.5rem" }}>{profile.name}</h2>
                  <div style={{ color: "#8E7564", fontSize: "0.9rem", fontWeight: 600 }}>
                    @{profile.handle} • Public Pinterest Creator
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
                <div style={{ background: "#FAF4EB", border: "1px solid #E7D7C1", padding: "10px 18px", borderRadius: 12 }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#2D2118", fontFamily: "Georgia, serif" }}>
                    {profile.followers}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#8E7564", textTransform: "uppercase", fontWeight: 700 }}>Followers</div>
                </div>
                <div style={{ background: "#FAF4EB", border: "1px solid #E7D7C1", padding: "10px 18px", borderRadius: 12 }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#9D1C2F", fontFamily: "Georgia, serif" }}>
                    {profile.monthlyViews}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#8E7564", textTransform: "uppercase", fontWeight: 700 }}>Monthly Views</div>
                </div>
              </div>
            </div>

            <p style={{ margin: "16px 0 0", color: "#6A5343", fontSize: "0.95rem", lineHeight: 1.5 }}>
              {profile.bio}
            </p>
          </div>

          {/* Content Gap Analysis Spotlight Card */}
          <div
            style={{
              background: "#FFFDF9",
              border: "2px solid #C27438",
              borderRadius: 20,
              padding: "24px 28px",
              boxShadow: "0 8px 24px rgba(194, 116, 56, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: "1.5rem" }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: "1.3rem", color: "#2D2118" }}>
                Content Gap Opportunities for Fyloo
              </h3>
            </div>
            <p style={{ color: "#6A5343", fontSize: "0.9rem", margin: "0 0 18px" }}>
              These high-traction topics are driving substantial traffic for @{profile.handle}, but have no corresponding boards in your current Pinterest workspace:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contentGaps.map((gap, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#FAF4EB",
                    border: "1px solid #E7D7C1",
                    borderRadius: 14,
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 750, color: "#2D2118", fontSize: "0.98rem" }}>
                        {gap.topic}
                      </span>
                      <span className="craft-pill craft-pill-queued" style={{ fontSize: "0.72rem" }}>
                        {gap.opportunity} Opportunity
                      </span>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#6A5343" }}>
                      {gap.suggestedAction}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/compose?title=${encodeURIComponent(gap.topic)}&tags=${encodeURIComponent(gap.topic.toLowerCase())}`}
                      className="craft-btn-primary craft-btn-sm"
                    >
                      Draft Pin for This Gap →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitor Public Boards & Top Pins Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
            {/* Left: Public Boards */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Competitor's Boards ({profile.boards.length})</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {profile.boards.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E7D7C1",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#2D2118" }}>
                        📁 {b.name}
                      </span>
                      <span className="craft-pill craft-pill-neutral">
                        {b.pinCount} pins
                      </span>
                    </div>
                    <p style={{ margin: "0 0 10px", fontSize: "0.86rem", color: "#6A5343" }}>
                      {b.description}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {b.topics.map((top, i) => (
                        <span key={i} className="pin-tag-chip" style={{ fontSize: "0.75rem" }}>
                          #{top}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Top Performing Pins */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Top Performing Pins</h3>
                <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>High save rate</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {profile.topPins.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E7D7C1",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.98rem", color: "#2D2118", lineHeight: 1.3 }}>
                        {p.title}
                      </span>
                      <span style={{ fontSize: "0.8rem", fontWeight: 750, color: "#C27438", whiteSpace: "nowrap", marginLeft: 8 }}>
                        ★ {p.estimatedSaves.toLocaleString()} saves
                      </span>
                    </div>
                    <p style={{ margin: "0 0 8px", fontSize: "0.85rem", color: "#6A5343" }}>
                      {p.description}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {p.hashtags.map((h, idx) => (
                        <span key={idx} style={{ color: "#9D1C2F", fontSize: "0.78rem", fontWeight: 650 }}>
                          {h}
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#8E7564" }}>
                      Outbound Link Domain: <strong>{p.linkDomain}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

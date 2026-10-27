"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { CompetitorProfile, ContentGap } from "../../lib/competitors";

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
      subtitle="Inspect live public Pinterest creator profiles and uncover search content gaps using real autocomplete queries."
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
            {loading ? "Inspecting..." : "🔎 Inspect Competitor"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span style={{ color: "#64748B", fontWeight: 600 }}>Suggested creator profiles:</span>
          {sampleCompetitors.map((samp) => (
            <button
              key={samp}
              type="button"
              onClick={() => {
                setHandle(samp);
                fetchCompetitor(samp);
              }}
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                padding: "3px 10px",
                borderRadius: 9999,
                fontSize: "0.82rem",
                color: "#475569",
                cursor: "pointer",
              }}
            >
              @{samp}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "12px 18px", borderRadius: 12, marginBottom: 20 }}>
          {statusMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#64748B" }}>
          Inspecting public Pinterest profile and querying autocomplete queries...
        </div>
      ) : profile && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Creator Profile Header Card */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <div className="craft-seal" style={{ width: 56, height: 56, fontSize: "1.6rem" }}>
                  {profile.name.charAt(0)}
                </div>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: "1.4rem", color: "#0F172A" }}>{profile.name}</h2>
                  <div style={{ color: "#64748B", fontSize: "0.88rem", fontWeight: 500 }}>
                    @{profile.handle} •{" "}
                    <a
                      href={profile.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2563EB", textDecoration: "underline" }}
                    >
                      View live profile on Pinterest ↗
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, textAlign: "center" }}>
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "10px 18px", borderRadius: 12 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#64748B" }}>
                    {profile.followers}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>
                    Followers
                  </div>
                </div>
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "10px 18px", borderRadius: 12 }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#64748B" }}>
                    {profile.monthlyViews}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginTop: 4 }}>
                    Monthly Views
                  </div>
                </div>
              </div>
            </div>

            <p style={{ margin: "16px 0 0", color: "#475569", fontSize: "0.92rem", lineHeight: 1.5 }}>
              {profile.bio}
            </p>

            {/* Connect Pinterest Notice */}
            <div
              style={{
                marginTop: 16,
                padding: "10px 14px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: "0.82rem",
                color: "#64748B",
              }}
            >
              🔒 <strong>Real Data Notice:</strong> {profile.notice} Zero synthetic or invented follower counts are shown.
            </div>
          </div>

          {/* Real Associated Search Queries from Google Autocomplete */}
          {profile.publicSearchTags.length > 0 && (
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Real Public Autocomplete Searches for @{profile.handle}</h3>
                <span className="craft-pill craft-pill-neutral">Google Autocomplete</span>
              </div>
              <p style={{ color: "#64748B", fontSize: "0.86rem", margin: "0 0 14px" }}>
                Verified real search queries associated with this brand from Google search suggestions:
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {profile.publicSearchTags.map((tag, i) => (
                  <div
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      padding: "6px 14px",
                      borderRadius: 9999,
                      fontSize: "0.85rem",
                      color: "#0F172A",
                    }}
                  >
                    <span>{tag}</span>
                    <Link
                      href={`/keywords?q=${encodeURIComponent(tag)}`}
                      style={{ color: "#2563EB", fontSize: "0.78rem" }}
                      title="Research in Keyword Tool"
                    >
                      🔍
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Gap Analysis Spotlight Card */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 16,
              padding: "24px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "1.4rem" }}>⚡</span>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#0F172A" }}>
                Content Gap Opportunities
              </h3>
            </div>
            <p style={{ color: "#64748B", fontSize: "0.88rem", margin: "0 0 16px" }}>
              Search topics trending for @{profile.handle} that are currently missing from your Pinterest boards:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {contentGaps.map((gap, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
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
                      <span style={{ fontWeight: 650, color: "#0F172A", fontSize: "0.95rem" }}>
                        {gap.topic}
                      </span>
                      <span className="craft-pill craft-pill-queued" style={{ fontSize: "0.72rem" }}>
                        {gap.opportunity} Opportunity
                      </span>
                    </div>
                    <div style={{ fontSize: "0.84rem", color: "#475569" }}>
                      {gap.suggestedAction}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/compose?title=${encodeURIComponent(gap.topic)}&tags=${encodeURIComponent(gap.topic.toLowerCase())}`}
                      className="craft-btn-primary craft-btn-sm"
                    >
                      Draft Pin →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

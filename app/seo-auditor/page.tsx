"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { SEOAuditResult } from "../../lib/seo-auditor";

export default function SEOAuditorPage() {
  const [url, setUrl] = useState("https://fyloo.com/products/matcha-mug");
  const [keyword, setKeyword] = useState("ceramic matcha mug");
  const [audit, setAudit] = useState<SEOAuditResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleAudit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    setAiSuggestions([]);
    setAiNote(null);
    try {
      const userApiKey = (() => {
        try {
          return localStorage.getItem("fyloo_gemini_key") || "";
        } catch {
          return "";
        }
      })();
      const res = await fetch("/api/seo-auditor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), keyword: keyword.trim(), userApiKey }),
      });
      const json = await res.json();
      if (res.ok) {
        setAudit(json.audit);
      } else {
        setStatusMsg(`Audit failed: ${json.error || "Unknown error"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to run audit"}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleAudit();
  }, []);

  return (
    <AppShell
      active="seo-auditor"
      title="AI SEO & Rich Pin Auditor"
      subtitle="Analyze product URLs for Pinterest Rich Pin compatibility, keyword relevance, and meta tags."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          {audit && (
            <Link
              href={`/compose?link=${encodeURIComponent(audit.url)}&title=${encodeURIComponent(audit.titleCheck.title)}`}
              className="craft-btn-primary"
            >
              Pin this Audited URL →
            </Link>
          )}
        </div>
      }
    >
      {/* Search Audit Card */}
      <div className="craft-card">
        <form onSubmit={handleAudit}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr auto", gap: 14, alignItems: "end" }}>
            <div className="craft-form-group" style={{ marginBottom: 0 }}>
              <label className="craft-label">Shop Page / Product URL</label>
              <input
                type="text"
                className="craft-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourshop.com/products/artisan-mug"
                required
              />
            </div>

            <div className="craft-form-group" style={{ marginBottom: 0 }}>
              <label className="craft-label">Focus Keyword</label>
              <input
                type="text"
                className="craft-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. ceramic mug, stoneware vase"
              />
            </div>

            <button type="submit" disabled={loading} className="craft-btn-primary" style={{ height: 46 }}>
              {loading ? "Auditing Page..." : "⚡ Run SEO Audit"}
            </button>
          </div>
        </form>
      </div>

      {statusMsg && (
        <div style={{ background: "#FDF0F2", border: "1px solid #F3BAC2", color: "#9D1C2F", padding: "12px 18px", borderRadius: 12, marginBottom: 20 }}>
          {statusMsg}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Scanning HTML tags, Pinterest Rich Pins, and keyword density...
        </div>
      ) : audit ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top Score & Summary Banner */}
          <div
            style={{
              background: "#FFFDF9",
              border: "1.5px solid #E7D7C1",
              borderRadius: 20,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20,
              boxShadow: "0 4px 18px rgba(78, 44, 22, 0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* Circular Health Score Stamp */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  border: "4px solid #9D1C2F",
                  display: "grid",
                  placeItems: "center",
                  background: "#FAF4EB",
                  boxShadow: "0 4px 12px rgba(157, 28, 47, 0.15)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2118", fontFamily: "Georgia, serif", lineHeight: 1 }}>
                    {audit.overallScore}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "#8E7564", textTransform: "uppercase", fontWeight: 700 }}>
                    SCORE
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.35rem" }}>
                  SEO & Pinterest Health Score: {audit.overallScore}/100
                </h3>
                <div style={{ fontSize: "0.88rem", color: "#6A5343" }}>
                  Audited: <strong>{audit.url}</strong> • Status {audit.status} OK
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <span className={audit.pinterestRichPinsCheck.richPinReady ? "craft-pill craft-pill-published" : "craft-pill craft-pill-queued"}>
                {audit.pinterestRichPinsCheck.richPinReady ? "✓ Rich Pins Ready" : "⚠ Rich Pins Needs Setup"}
              </span>
              <span className="craft-pill craft-pill-neutral">
                {audit.linkHealth.testedLinksCount} Links Checked
              </span>
            </div>
          </div>

          {/* AI Suggestions */}
          {(aiSuggestions.length > 0 || aiNote) && (
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h4 style={{ margin: 0, fontSize: "1.1rem" }}>AI Improvement Suggestions</h4>
              </div>
              {aiSuggestions.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.9rem", color: "#2D2118", lineHeight: 1.7 }}>
                  {aiSuggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#6A5343" }}>
                  {aiNote} <Link href="/settings/api-keys">Settings &gt; API Keys</Link>
                </p>
              )}
            </div>
          )}

          {/* Detailed Audit Breakdown Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
            {/* Left: Metadata Checks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Title Tag Check */}
              <div className="craft-card" style={{ marginBottom: 0 }}>
                <div className="craft-card-header">
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>HTML Title Tag</h4>
                  <span className={`craft-pill craft-pill-${audit.titleCheck.status === "good" ? "published" : "queued"}`}>
                    {audit.titleCheck.length} characters
                  </span>
                </div>
                <div style={{ background: "#FAF4EB", border: "1px solid #E7D7C1", borderRadius: 10, padding: "10px 14px", fontWeight: 650, fontSize: "0.92rem", marginBottom: 8 }}>
                  "{audit.titleCheck.title}"
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6A5343" }}>
                  {audit.titleCheck.message}
                </p>
              </div>

              {/* Meta Description Check */}
              <div className="craft-card" style={{ marginBottom: 0 }}>
                <div className="craft-card-header">
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Meta Description</h4>
                  <span className={`craft-pill craft-pill-${audit.metaDescriptionCheck.status === "good" ? "published" : "queued"}`}>
                    {audit.metaDescriptionCheck.length} characters
                  </span>
                </div>
                <div style={{ background: "#FAF4EB", border: "1px solid #E7D7C1", borderRadius: 10, padding: "10px 14px", fontSize: "0.88rem", color: "#2D2118", marginBottom: 8, lineHeight: 1.45 }}>
                  "{audit.metaDescriptionCheck.description}"
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#6A5343" }}>
                  {audit.metaDescriptionCheck.message}
                </p>
              </div>

              {/* Pinterest Rich Pins Readiness */}
              <div className="craft-card" style={{ marginBottom: 0 }}>
                <div className="craft-card-header">
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Pinterest Rich Pins & Open Graph</h4>
                  <span className={`craft-pill craft-pill-${audit.pinterestRichPinsCheck.status === "good" ? "published" : "queued"}`}>
                    {audit.pinterestRichPinsCheck.richPinReady ? "Validated" : "Action Required"}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>og:title Tag</span>
                    <strong>{audit.pinterestRichPinsCheck.hasOgTitle ? "✓ Present" : "✕ Missing"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>og:description Tag</span>
                    <strong>{audit.pinterestRichPinsCheck.hasOgDescription ? "✓ Present" : "✕ Missing"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>og:image (Pin Artwork Target)</span>
                    <strong>{audit.pinterestRichPinsCheck.ogImage ? "✓ Configured" : "✕ Missing"}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Keyword Relevance & Actionable Suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Keyword Relevance Card */}
              <div className="craft-card" style={{ marginBottom: 0 }}>
                <div className="craft-card-header">
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Keyword Relevance: "{audit.keywordRelevance.keyword}"</h4>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.88rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Found in &lt;title&gt;</span>
                    <strong>{audit.keywordRelevance.inTitle ? "✓ Yes" : "✕ No"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Found in Meta Description</span>
                    <strong>{audit.keywordRelevance.inMetaDesc ? "✓ Yes" : "✕ No"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Found in H1 Heading</span>
                    <strong>{audit.keywordRelevance.inH1 ? "✓ Yes" : "✕ No"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Page Keyword Density</span>
                    <strong>{audit.keywordRelevance.density} ({audit.keywordRelevance.occurrences} matches)</strong>
                  </div>
                </div>
              </div>

              {/* Actionable Suggestions Checklist */}
              <div className="craft-card" style={{ marginBottom: 0 }}>
                <div className="craft-card-header">
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>Prioritized Optimization Checklist</h4>
                  <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>{audit.suggestions.length} items</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {audit.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E7D7C1",
                        borderRadius: 12,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#2D2118" }}>
                          {sug.category}
                        </span>
                        <span
                          className={`craft-pill craft-pill-${sug.priority === "High" ? "failed" : sug.priority === "Medium" ? "queued" : "neutral"}`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {sug.priority} Priority
                        </span>
                      </div>
                      <p style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "#6A5343", lineHeight: 1.45 }}>
                        {sug.recommendation}
                      </p>
                      <div style={{ fontSize: "0.75rem", color: "#2E8B57", fontWeight: 650 }}>
                        Expected Impact: {sug.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

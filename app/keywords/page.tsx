"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface KeywordSuggestion {
  keyword: string;
  cluster: string;
  competition: "Low" | "Medium" | "High";
  score: number;
  intent: string;
  suggestedBoard: string;
}

interface SavedKeywordList {
  id: string;
  name: string;
  keywords: string[];
}

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("ceramic mug");
  const [results, setResults] = useState<KeywordSuggestion[]>([]);
  const [clusters, setClusters] = useState<{ [cluster: string]: KeywordSuggestion[] }>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "clusters" | "saved">("all");

  // Saved lists
  const [savedLists, setSavedLists] = useState<SavedKeywordList[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function searchKeywords(searchQ: string = query) {
    if (!searchQ.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/keywords/search?q=${encodeURIComponent(searchQ.trim())}`);
      const json = await res.json();
      if (res.ok) {
        setResults(json.keywords ?? []);
        setClusters(json.clusters ?? {});
      } else {
        setStatusMsg(`Search error: ${json.error || "Failed to fetch keywords"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to search"}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadLists() {
    try {
      const res = await fetch("/api/keywords/lists");
      const json = await res.json();
      if (res.ok) {
        setSavedLists(json.lists ?? []);
        if (json.lists?.length > 0 && !selectedListId) {
          setSelectedListId(json.lists[0].id);
        }
      }
    } catch {}
  }

  useEffect(() => {
    searchKeywords("ceramic mug");
    loadLists();
  }, []);

  async function handleCreateList(e: React.FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const res = await fetch("/api/keywords/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newListName.trim(), keywords: [] }),
      });
      const json = await res.json();
      if (res.ok) {
        setSavedLists(json.lists ?? []);
        setSelectedListId(json.list?.id || "");
        setNewListName("");
        setStatusMsg("✓ Created new keyword list!");
      }
    } catch {}
  }

  async function addKeywordToList(kw: string, listId: string = selectedListId) {
    const list = savedLists.find((l) => l.id === listId);
    if (!list) return;
    if (list.keywords.includes(kw)) {
      setStatusMsg(`"${kw}" is already in "${list.name}".`);
      return;
    }
    const updatedKeywords = [...list.keywords, kw];
    try {
      const res = await fetch("/api/keywords/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: list.id, name: list.name, keywords: updatedKeywords }),
      });
      const json = await res.json();
      if (res.ok) {
        setSavedLists(json.lists ?? []);
        setStatusMsg(`✓ Added "${kw}" to "${list.name}".`);
      }
    } catch {}
  }

  function exportCSV() {
    const headers = ["Keyword", "Cluster", "Competition", "Opportunity Score", "Intent", "Suggested Board"];
    const rows = results.map((r) => [
      `"${r.keyword.replace(/"/g, '""')}"`,
      `"${r.cluster}"`,
      `"${r.competition}"`,
      r.score,
      `"${r.intent}"`,
      `"${r.suggestedBoard}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `pinterest-keywords-${query.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const sampleSeeds = ["ceramic mug", "pottery ideas", "crochet patterns", "handmade candles", "woodworking gifts", "cottagecore decor"];

  return (
    <AppShell
      active="keywords"
      title="Pinterest Keyword Research"
      subtitle="Discover high-opportunity search terms, cluster keywords, and export SEO tags for your pins."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={exportCSV}
            disabled={results.length === 0}
            className="craft-btn-outline"
            style={{ fontSize: "0.88rem" }}
          >
            📥 Export CSV ({results.length})
          </button>
          <Link href="/compose" className="craft-btn-primary">
            + Open Composer
          </Link>
        </div>
      }
    >
      {/* Status banner */}
      {statusMsg && (
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid #E7D7C1",
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.9rem",
            color: "#2D2118",
          }}
        >
          <span>{statusMsg}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8E7564" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Bar Card */}
      <div className="craft-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchKeywords();
          }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}
        >
          <input
            type="text"
            className="craft-input"
            style={{ flex: 1, minWidth: 260, fontSize: "1.05rem" }}
            placeholder="Enter seed topic (e.g. ceramic mug, chunky knit blanket, soy candle)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading} className="craft-btn-primary">
            {loading ? "Searching..." : "🔍 Search Autocomplete"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span style={{ color: "#8E7564", fontWeight: 650 }}>Popular maker queries:</span>
          {sampleSeeds.map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => {
                setQuery(seed);
                searchKeywords(seed);
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
              {seed}
            </button>
          ))}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={activeTab === "all" ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
        >
          All Keywords ({results.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("clusters")}
          className={activeTab === "clusters" ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
        >
          By Clusters ({Object.keys(clusters).length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={activeTab === "saved" ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
        >
          Saved Lists ({savedLists.length})
        </button>
      </div>

      {/* Tab: All Keywords Table */}
      {activeTab === "all" && (
        <div className="craft-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
              <thead>
                <tr style={{ background: "#FBF4EA", borderBottom: "1px solid #E7D7C1" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Keyword</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Cluster</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Competition</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Score</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343" }}>Search Intent</th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", color: "#6A5343", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F0E6D8" }}>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#2D2118" }}>
                      {r.keyword}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.88rem", color: "#6A5343" }}>
                      <span className="craft-pill craft-pill-neutral">{r.cluster}</span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      {r.competition === "Low" && <span className="craft-pill craft-pill-published">Low Competition</span>}
                      {r.competition === "Medium" && <span className="craft-pill craft-pill-queued">Medium</span>}
                      {r.competition === "High" && <span className="craft-pill craft-pill-failed">High</span>}
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: r.score >= 70 ? "#2E8B57" : "#C27438" }}>
                      {r.score}/100
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "0.85rem", color: "#6A5343" }}>
                      {r.intent}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => addKeywordToList(r.keyword)}
                          className="craft-btn-secondary craft-btn-sm"
                          title="Save to list"
                        >
                          + Save
                        </button>
                        <Link
                          href={`/compose?tags=${encodeURIComponent(r.keyword)}&title=${encodeURIComponent(r.keyword.charAt(0).toUpperCase() + r.keyword.slice(1))}`}
                          className="craft-btn-outline craft-btn-sm"
                          title="Use in Composer"
                        >
                          Use in Pin
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: By Clusters */}
      {activeTab === "clusters" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {Object.entries(clusters).map(([clusterName, clusterItems]) => (
            <div key={clusterName} className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h4 style={{ margin: 0, fontSize: "1.15rem" }}>{clusterName}</h4>
                <span className="craft-pill craft-pill-neutral">{clusterItems.length} terms</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {clusterItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "#FFFFFF",
                      border: "1px solid #E7D7C1",
                      borderRadius: 10,
                      fontSize: "0.88rem",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 650, color: "#2D2118" }}>{item.keyword}</div>
                      <div style={{ fontSize: "0.75rem", color: "#8E7564" }}>
                        {item.intent} • {item.competition} Comp
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addKeywordToList(item.keyword)}
                      className="craft-btn-outline craft-btn-sm"
                    >
                      + Save
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Saved Lists */}
      {activeTab === "saved" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
          {/* Left: Selected List Details */}
          <div className="craft-card">
            <div className="craft-card-header">
              <h3 className="craft-card-title">Saved Keywords</h3>
              {selectedListId && (
                <button
                  type="button"
                  onClick={() => {
                    const l = savedLists.find((x) => x.id === selectedListId);
                    if (!l) return;
                    const blob = new Blob([l.keywords.join("\n")], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${l.name}.txt`;
                    a.click();
                  }}
                  className="craft-btn-outline craft-btn-sm"
                >
                  Export List
                </button>
              )}
            </div>

            {savedLists.length === 0 ? (
              <p style={{ color: "#8E7564" }}>No saved lists yet. Create one using the form on the right.</p>
            ) : (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label className="craft-label">Active List:</label>
                  <select
                    className="craft-select"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                  >
                    {savedLists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.keywords.length} keywords)
                      </option>
                    ))}
                  </select>
                </div>

                {(() => {
                  const current = savedLists.find((l) => l.id === selectedListId);
                  if (!current || current.keywords.length === 0) {
                    return <p style={{ color: "#8E7564", fontStyle: "italic" }}>No keywords saved in this list yet.</p>;
                  }
                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {current.keywords.map((kw, i) => (
                        <div
                          key={i}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#FAF4EB",
                            border: "1px solid #E7D7C1",
                            padding: "6px 12px",
                            borderRadius: 9999,
                            fontSize: "0.85rem",
                            fontWeight: 650,
                          }}
                        >
                          <span>{kw}</span>
                          <Link
                            href={`/compose?tags=${encodeURIComponent(kw)}`}
                            style={{ fontSize: "0.75rem", color: "#9D1C2F" }}
                            title="Compose with this keyword"
                          >
                            📌
                          </Link>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right: Create New List Form */}
          <div className="craft-card" style={{ height: "fit-content" }}>
            <div className="craft-card-header">
              <h4 style={{ margin: 0 }}>Create New List</h4>
            </div>
            <form onSubmit={handleCreateList}>
              <div className="craft-form-group">
                <label className="craft-label">List Name</label>
                <input
                  type="text"
                  className="craft-input"
                  placeholder="e.g. Autumn Glazes, Holiday Gifts"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="craft-btn-primary craft-btn-sm" style={{ width: "100%" }}>
                + Create List
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

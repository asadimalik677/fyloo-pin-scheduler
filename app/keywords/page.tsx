"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { RealKeywordItem, KeywordSearchResults } from "../../lib/keyword-sources";

interface SavedKeywordList {
  id: string;
  name: string;
  keywords: string[];
}

export default function KeywordResearchPage() {
  const [query, setQuery] = useState("ceramic mug");
  const [pinKey, setPinKey] = useState("");
  const [showPinKeyInput, setShowPinKeyInput] = useState(false);
  const [filterPhrase, setFilterPhrase] = useState("");
  const [selectedSourceFilter, setSelectedSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"keyword-asc" | "keyword-desc" | "source" | "interest">("keyword-asc");

  const [results, setResults] = useState<RealKeywordItem[]>([]);
  const [totalFound, setTotalFound] = useState(0);
  const [googleTrendsInterest, setGoogleTrendsInterest] = useState<number | null>(null);
  const [googleTrendsStatus, setGoogleTrendsStatus] = useState<"available" | "not available">("not available");
  const [pinStatus, setPinStatus] = useState<"connected" | "not connected" | "error">("not connected");
  const [sourcesUsed, setSourcesUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"table" | "saved">("table");

  // Saved lists
  const [savedLists, setSavedLists] = useState<SavedKeywordList[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [newListName, setNewListName] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function searchKeywords(searchQ: string = query, apiKey: string = pinKey) {
    if (!searchQ.trim()) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const params = new URLSearchParams({
        q: searchQ.trim(),
      });
      if (apiKey.trim()) {
        params.set("pinKey", apiKey.trim());
      }

      const res = await fetch(`/api/keywords/search?${params.toString()}`);
      const json: KeywordSearchResults & { error?: string } = await res.json();
      if (res.ok) {
        setResults(json.keywords ?? []);
        setTotalFound(json.total ?? 0);
        setGoogleTrendsInterest(json.googleTrendsSeedInterest ?? null);
        setGoogleTrendsStatus(json.googleTrendsStatus ?? "not available");
        setPinStatus(json.pinPinterestStatus ?? "not connected");
        setSourcesUsed(json.sourcesUsed ?? []);
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

  // Filter & sort results
  const filteredResults = useMemo(() => {
    let list = [...results];

    // Filter by phrase
    if (filterPhrase.trim()) {
      const f = filterPhrase.toLowerCase().trim();
      list = list.filter((item) => item.keyword.toLowerCase().includes(f));
    }

    // Filter by source
    if (selectedSourceFilter !== "all") {
      list = list.filter((item) => item.sourceLabel.toLowerCase().includes(selectedSourceFilter.toLowerCase()));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === "keyword-asc") {
        return a.keyword.localeCompare(b.keyword);
      }
      if (sortBy === "keyword-desc") {
        return b.keyword.localeCompare(a.keyword);
      }
      if (sortBy === "source") {
        return a.source.localeCompare(b.source);
      }
      if (sortBy === "interest") {
        const valA = a.relativeInterest ?? -1;
        const valB = b.relativeInterest ?? -1;
        return valB - valA;
      }
      return 0;
    });

    return list;
  }, [results, filterPhrase, selectedSourceFilter, sortBy]);

  function exportCSV() {
    const headers = [
      "Keyword",
      "Source",
      "Source Category",
      "Relative Interest (0-100)",
      "Trend Signal",
      "Trend Data Source",
      "Pin Count",
      "Competition",
      "Saves",
      "Est Clicks",
      "Opportunity",
      "Pin Data Source",
    ];
    const rows = filteredResults.map((r) => [
      `"${r.keyword.replace(/"/g, '""')}"`,
      `"${r.source}"`,
      `"${r.sourceLabel}"`,
      r.relativeInterest !== null ? r.relativeInterest : "not available",
      `"${r.trendSignal}"`,
      `"${r.trendSource}"`,
      `"${r.pinCount}"`,
      `"${r.competition}"`,
      `"${r.saves}"`,
      `"${r.estClicks}"`,
      `"${r.opportunity}"`,
      `"${r.pinSource}"`,
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

  const sampleSeeds = [
    "ceramic mug",
    "pottery ideas",
    "crochet patterns",
    "handmade candles",
    "woodworking gifts",
    "cottagecore decor",
    "minimalist jewelry",
  ];

  return (
    <AppShell
      active="keywords"
      title="Pinterest Keyword Tool"
      subtitle="PinPress-style keyword research powered exclusively by real free data sources: Google Autocomplete (A-Z, questions, prepositions), Datamuse semantic associations, and Google Trends relative interest."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={exportCSV}
            disabled={filteredResults.length === 0}
            className="craft-btn-outline"
            style={{ fontSize: "0.88rem" }}
          >
            📥 Export CSV ({filteredResults.length})
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
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.9rem",
            color: "#0F172A",
          }}
        >
          <span>{statusMsg}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Search & Source Controls Card */}
      <div className="craft-card" style={{ marginBottom: 20 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchKeywords(query, pinKey);
          }}
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}
        >
          <input
            type="text"
            className="craft-input"
            style={{ flex: 1, minWidth: 260, fontSize: "1.05rem" }}
            placeholder="Enter seed keyword (e.g. ceramic mug, crochet blanket, soy candle)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading} className="craft-btn-primary" style={{ padding: "10px 24px" }}>
            {loading ? "Discovering Real Keywords..." : "🔍 Search Keywords"}
          </button>
        </form>

        {/* PinPinterest Key Toggle */}
        <div style={{ marginBottom: 14 }}>
          <button
            type="button"
            onClick={() => setShowPinKeyInput(!showPinKeyInput)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "0.85rem",
              color: "#2563EB",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontWeight: 600,
            }}
          >
            {showPinKeyInput ? "▼ Hide optional PinPinterest key" : "▶ Add optional free PinPinterest API key"}
          </button>

          {showPinKeyInput && (
            <div
              style={{
                marginTop: 10,
                padding: "12px 16px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
              }}
            >
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                PinPinterest API Key (api.pinpinterest.com):
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="password"
                  className="craft-input"
                  style={{ flex: 1, fontSize: "0.88rem" }}
                  placeholder="Paste your free PinPinterest API key here..."
                  value={pinKey}
                  onChange={(e) => setPinKey(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => searchKeywords(query, pinKey)}
                  className="craft-btn-secondary craft-btn-sm"
                  disabled={loading}
                >
                  Apply Key & Re-query
                </button>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "#64748B" }}>
                When omitted, PinPinterest fields will display &quot;not connected&quot;. When provided, real metrics from api.pinpinterest.com will populate. Never invented numbers.
              </p>
            </div>
          )}
        </div>

        {/* Popular sample tags */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span style={{ color: "#64748B", fontWeight: 600 }}>Suggested seed queries:</span>
          {sampleSeeds.map((seed) => (
            <button
              key={seed}
              type="button"
              onClick={() => {
                setQuery(seed);
                searchKeywords(seed, pinKey);
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
              {seed}
            </button>
          ))}
        </div>
      </div>

      {/* Real Data Transparency & Diagnostics Banner */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "1.1rem" }}>📡</span>
            <strong style={{ color: "#0F172A", fontSize: "0.95rem" }}>Verified Real Free Data Sources</strong>
            <span style={{ fontSize: "0.82rem", color: "#64748B" }}>({totalFound} unique keywords expanded)</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.78rem", padding: "4px 10px", borderRadius: 9999, background: "#EFF6FF", color: "#1D4ED8", fontWeight: 600, border: "1px solid #BFDBFE" }}>
              ✓ Google Autocomplete (A-Z, Prepositions)
            </span>
            <span style={{ fontSize: "0.78rem", padding: "4px 10px", borderRadius: 9999, background: "#EFF6FF", color: "#1D4ED8", fontWeight: 600, border: "1px solid #BFDBFE" }}>
              ✓ Datamuse Semantic API
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "4px 10px",
                borderRadius: 9999,
                background: googleTrendsStatus === "available" ? "#F0FDF4" : "#F8FAFC",
                color: googleTrendsStatus === "available" ? "#15803D" : "#64748B",
                fontWeight: 600,
                border: "1px solid " + (googleTrendsStatus === "available" ? "#BBF7D0" : "#E2E8F0"),
              }}
            >
              {googleTrendsStatus === "available"
                ? `✓ Google Trends: ${googleTrendsInterest}/100 Relative Interest`
                : "Google Trends: not available"}
            </span>
            <span
              style={{
                fontSize: "0.78rem",
                padding: "4px 10px",
                borderRadius: 9999,
                background: pinStatus === "connected" ? "#F0FDF4" : "#F8FAFC",
                color: pinStatus === "connected" ? "#15803D" : "#64748B",
                fontWeight: 600,
                border: "1px solid " + (pinStatus === "connected" ? "#BBF7D0" : "#E2E8F0"),
              }}
            >
              {pinStatus === "connected" ? "✓ PinPinterest API: Connected" : "PinPinterest: not connected"}
            </span>
          </div>
        </div>

        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748B", lineHeight: 1.5 }}>
          <strong>Policy Notice:</strong> Zero fake synthesized modifiers. Zero heuristic 0-100 word-count scores. Google Trends metrics represent <em>relative interest (0-100)</em> over the past 12 months, never estimated search volume. Every column carries its explicit source attribution.
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setActiveTab("table")}
          className={activeTab === "table" ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
        >
          Results Table ({filteredResults.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={activeTab === "saved" ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
        >
          Saved Lists ({savedLists.length})
        </button>
      </div>

      {/* TAB: Table View */}
      {activeTab === "table" && (
        <>
          {/* Filter & Sort Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 14,
              padding: "10px 14px",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 240 }}>
              <span style={{ fontSize: "0.88rem", color: "#64748B" }}>🔎</span>
              <input
                type="text"
                placeholder="Filter by phrase (e.g. handmade, with handle, gift)..."
                value={filterPhrase}
                onChange={(e) => setFilterPhrase(e.target.value)}
                className="craft-input"
                style={{ padding: "6px 12px", fontSize: "0.88rem", flex: 1 }}
              />
              {filterPhrase && (
                <button
                  type="button"
                  onClick={() => setFilterPhrase("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", fontSize: "0.85rem" }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                <span style={{ color: "#64748B" }}>Source:</span>
                <select
                  value={selectedSourceFilter}
                  onChange={(e) => setSelectedSourceFilter(e.target.value)}
                  className="craft-select"
                  style={{ padding: "5px 10px", fontSize: "0.85rem" }}
                >
                  <option value="all">All Sources</option>
                  <option value="Autocomplete">Google Autocomplete</option>
                  <option value="Datamuse">Datamuse API</option>
                  <option value="Trends">Google Trends</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                <span style={{ color: "#64748B" }}>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="craft-select"
                  style={{ padding: "5px 10px", fontSize: "0.85rem" }}
                >
                  <option value="keyword-asc">Keyword (A → Z)</option>
                  <option value="keyword-desc">Keyword (Z → A)</option>
                  <option value="interest">Relative Interest</option>
                  <option value="source">Source</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="craft-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
                <thead>
                  <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Keyword
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Source
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Relative Interest
                      <div style={{ fontSize: "0.68rem", textTransform: "none", color: "#64748B", fontWeight: 400 }}>
                        (Google Trends 0-100)
                      </div>
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Pin Count
                      <div style={{ fontSize: "0.68rem", textTransform: "none", color: "#64748B", fontWeight: 400 }}>
                        (PinPinterest)
                      </div>
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Competition
                      <div style={{ fontSize: "0.68rem", textTransform: "none", color: "#64748B", fontWeight: 400 }}>
                        (PinPinterest)
                      </div>
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Saves
                      <div style={{ fontSize: "0.68rem", textTransform: "none", color: "#64748B", fontWeight: 400 }}>
                        (PinPinterest)
                      </div>
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Est. Clicks
                      <div style={{ fontSize: "0.68rem", textTransform: "none", color: "#64748B", fontWeight: 400 }}>
                        (PinPinterest)
                      </div>
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "left" }}>
                      Opportunity
                      <div style={{ fontSize: "0.68rem", textTransform: "none", color: "#64748B", fontWeight: 400 }}>
                        (PinPinterest)
                      </div>
                    </th>
                    <th style={{ padding: "12px 16px", fontSize: "0.8rem", textTransform: "uppercase", color: "#475569", textAlign: "right" }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: "32px 20px", textAlign: "center", color: "#64748B" }}>
                        {loading ? "Fetching real keyword suggestions..." : "No keywords match your filter."}
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((r, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 650, color: "#0F172A", maxWidth: 260 }}>
                          <div style={{ wordBreak: "break-word" }}>{r.keyword}</div>
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.82rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: r.source.includes("Trends")
                                ? "#FEF3C7"
                                : r.source.includes("Datamuse")
                                ? "#F3E8FF"
                                : "#EFF6FF",
                              color: r.source.includes("Trends")
                                ? "#92400E"
                                : r.source.includes("Datamuse")
                                ? "#6B21A8"
                                : "#1D4ED8",
                            }}
                          >
                            {r.source}
                          </span>
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                          {r.relativeInterest !== null ? (
                            <div>
                              <span style={{ fontWeight: 700, color: "#2563EB" }}>
                                {r.relativeInterest}/100
                              </span>
                              <div style={{ fontSize: "0.72rem", color: "#64748B" }}>relative interest</div>
                            </div>
                          ) : r.trendSignal !== "not available" ? (
                            <div>
                              <span style={{ fontWeight: 700, color: "#059669" }}>
                                {r.trendSignal}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8rem" }}>
                              not available
                            </span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                          {r.pinCount === "not connected" ? (
                            <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8rem" }}>not connected</span>
                          ) : (
                            <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.pinCount}</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                          {r.competition === "not connected" ? (
                            <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8rem" }}>not connected</span>
                          ) : (
                            <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.competition}</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                          {r.saves === "not connected" ? (
                            <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8rem" }}>not connected</span>
                          ) : (
                            <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.saves}</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                          {r.estClicks === "not connected" ? (
                            <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8rem" }}>not connected</span>
                          ) : (
                            <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.estClicks}</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", fontSize: "0.85rem" }}>
                          {r.opportunity === "not connected" ? (
                            <span style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "0.8rem" }}>not connected</span>
                          ) : (
                            <span style={{ fontWeight: 600, color: "#0F172A" }}>{r.opportunity}</span>
                          )}
                        </td>

                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                            <button
                              type="button"
                              onClick={() => addKeywordToList(r.keyword)}
                              className="craft-btn-secondary craft-btn-sm"
                              title="Save to list"
                              style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                            >
                              + Save
                            </button>
                            <Link
                              href={`/compose?tags=${encodeURIComponent(r.keyword)}&title=${encodeURIComponent(
                                r.keyword.charAt(0).toUpperCase() + r.keyword.slice(1)
                              )}`}
                              className="craft-btn-outline craft-btn-sm"
                              title="Use in Composer"
                              style={{ padding: "4px 8px", fontSize: "0.78rem" }}
                            >
                              Use
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB: Saved Lists Management */}
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
                  Export List (.txt)
                </button>
              )}
            </div>

            {savedLists.length === 0 ? (
              <p style={{ color: "#64748B" }}>No saved lists yet. Create one using the form on the right.</p>
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
                    return <p style={{ color: "#64748B", fontStyle: "italic" }}>No keywords saved in this list yet.</p>;
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
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            padding: "6px 12px",
                            borderRadius: 9999,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#0F172A",
                          }}
                        >
                          <span>{kw}</span>
                          <Link
                            href={`/compose?tags=${encodeURIComponent(kw)}`}
                            style={{ fontSize: "0.75rem", color: "#2563EB" }}
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
              <h4 style={{ margin: 0, color: "#0F172A" }}>Create New List</h4>
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

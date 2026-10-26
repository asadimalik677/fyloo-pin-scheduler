"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { DuplicateWarning, CSVImportedRow } from "../../lib/planner";

interface QueuePin {
  id: string;
  title: string;
  board_id: string;
  board_name?: string;
  scheduled_at: string;
  status: "queued" | "published" | "failed";
  link?: string;
  image_url?: string;
}

interface DraftItem {
  id: string;
  title: string;
  board_name?: string;
  updated_at: string;
}

export default function ContentPlannerPage() {
  const [queue, setQueue] = useState<QueuePin[]>([]);
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [duplicateWarnings, setDuplicateWarnings] = useState<DuplicateWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // CSV Import Modal
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [parsedRows, setParsedRows] = useState<CSVImportedRow[]>([]);
  const [importing, setImporting] = useState(false);

  async function loadPlanner() {
    setLoading(true);
    try {
      const res = await fetch("/api/planner");
      const json = await res.json();
      if (res.ok) {
        setQueue(json.queue ?? []);
        setDrafts(json.drafts ?? []);
        setDuplicateWarnings(json.duplicateWarnings ?? []);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlanner();
  }, []);

  async function handleRescheduleDuplicate(warning: DuplicateWarning) {
    // Add 7 days to Pin B
    const newDate = new Date(new Date(warning.pinB.scheduled_at).getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: warning.pinB.id, scheduled_at: newDate.toISOString() }),
      });
      if (res.ok) {
        setStatusMsg(`✓ Spaced duplicate pin by +7 days to ${newDate.toLocaleDateString()}.`);
        loadPlanner();
      }
    } catch {}
  }

  async function handleParseCSV() {
    if (!csvText.trim()) return;
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText }),
      });
      const json = await res.json();
      if (res.ok) {
        setParsedRows(json.rows ?? []);
      }
    } catch {}
  }

  async function handleImportCSVRowsToDrafts() {
    setImporting(true);
    try {
      for (const row of parsedRows) {
        await fetch("/api/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: row.title,
            description: row.description,
            board_name: row.boardName,
            link: row.link,
          }),
        });
      }
      setStatusMsg(`✓ Successfully imported ${parsedRows.length} pins into Drafts Workshop!`);
      setShowCSVModal(false);
      setParsedRows([]);
      setCsvText("");
      loadPlanner();
    } catch (e) {
      setStatusMsg(`Import error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setImporting(false);
    }
  }

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }
  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  return (
    <AppShell
      active="planner"
      title="Content Planner & Calendar"
      subtitle="Visual monthly calendar view with duplicate-pin warnings and bulk CSV schedule import."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setShowCSVModal(true)}
            className="craft-btn-outline craft-btn-sm"
          >
            📥 Import CSV
          </button>
          <Link href="/compose" className="craft-btn-primary">
            + Schedule Pin
          </Link>
        </div>
      }
    >
      {/* Status Alert Banner */}
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
          }}
        >
          <span>{statusMsg}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Duplicate Pin Protection Alerts */}
      {duplicateWarnings.length > 0 && (
        <div
          style={{
            background: "#FFFDF9",
            border: "2px solid #C27438",
            borderRadius: 18,
            padding: "20px 24px",
            marginBottom: 24,
            boxShadow: "0 6px 20px rgba(194, 116, 56, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: "1.4rem" }}>⚠️</span>
            <h4 style={{ margin: 0, fontSize: "1.15rem", color: "#2D2118" }}>
              Duplicate-Pin Protection Alert ({duplicateWarnings.length})
            </h4>
          </div>
          <p style={{ margin: "0 0 16px", color: "#6A5343", fontSize: "0.88rem" }}>
            Pinterest distribution algorithms penalize accounts that post identical destination links or titles too closely together. Space identical items at least 7 days apart:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {duplicateWarnings.map((warn) => (
              <div
                key={warn.id}
                style={{
                  background: "#FAF4EB",
                  border: "1px solid #E7D7C1",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#2D2118" }}>
                    "{warn.pinA.title}" vs "{warn.pinB.title}"
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#8E7564" }}>
                    {warn.reason}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRescheduleDuplicate(warn)}
                  className="craft-btn-secondary craft-btn-sm"
                >
                  Auto-Space by +7 Days →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Interactive Calendar */}
      <div className="craft-card">
        {/* Month Navigation Bar */}
        <div className="craft-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <h3 className="craft-card-title" style={{ fontSize: "1.45rem" }}>
              {monthName} {year}
            </h3>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={prevMonth}
                className="craft-btn-outline craft-btn-sm"
              >
                ← Prev
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="craft-btn-outline craft-btn-sm"
              >
                Next →
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: "0.82rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="craft-pill craft-pill-queued" style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }} />
              Queued Pin
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span className="craft-pill craft-pill-published" style={{ width: 8, height: 8, padding: 0, borderRadius: "50%" }} />
              Published
            </span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8, textAlign: "center" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={{ fontWeight: 750, fontSize: "0.82rem", color: "#8E7564", textTransform: "uppercase" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {/* Empty cells before month start */}
          {Array.from({ length: firstDay }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              style={{
                minHeight: 100,
                background: "transparent",
                border: "1px dashed transparent",
              }}
            />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const pinsOnDay = queue.filter((q) => q.scheduled_at && q.scheduled_at.startsWith(dateStr));
            const isToday =
              dateStr === new Date().toISOString().split("T")[0];

            return (
              <div
                key={dayNum}
                style={{
                  minHeight: 110,
                  background: isToday ? "#FAF4EB" : "#FFFFFF",
                  border: `1.5px solid ${isToday ? "#9D1C2F" : "#E7D7C1"}`,
                  borderRadius: 10,
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span
                    style={{
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      color: isToday ? "#9D1C2F" : "#2D2118",
                    }}
                  >
                    {dayNum}
                  </span>
                  {pinsOnDay.length > 0 && (
                    <span style={{ fontSize: "0.72rem", color: "#8E7564", fontWeight: 700 }}>
                      {pinsOnDay.length}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto" }}>
                  {pinsOnDay.map((p) => (
                    <Link
                      key={p.id}
                      href="/queue"
                      style={{
                        display: "block",
                        padding: "3px 6px",
                        borderRadius: 6,
                        fontSize: "0.74rem",
                        fontWeight: 650,
                        background: p.status === "published" ? "#EEF5F0" : "#FDF7EA",
                        color: p.status === "published" ? "#245735" : "#7B5610",
                        border: `1px solid ${p.status === "published" ? "#C7E0CF" : "#F2DBAD"}`,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textDecoration: "none",
                      }}
                      title={`${p.title} (${new Date(p.scheduled_at).toLocaleTimeString()})`}
                    >
                      {new Date(p.scheduled_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} • {p.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className="craft-modal-backdrop" onClick={() => setShowCSVModal(false)}>
          <div className="craft-modal-card" style={{ maxWidth: 650 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #E7D7C1", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: "1.3rem" }}>Bulk CSV Pin Import</h3>
              <button type="button" onClick={() => setShowCSVModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#6A5343", margin: "0 0 14px" }}>
              Paste CSV text or upload an export file. Expected header columns: <code>Title, Description, Board, ScheduledAt, Link</code>
            </p>

            <div style={{ marginBottom: 16 }}>
              <textarea
                className="craft-textarea"
                style={{ minHeight: 140, fontFamily: "monospace", fontSize: "0.84rem" }}
                placeholder={`Title,Description,Board,ScheduledAt,Link\n"Ceramic Matcha Bowl","Handmade stoneware bowl with white glaze","Ceramics","2026-11-01T10:00:00Z","https://fyloo.com/mug"\n"Walnut Coffee Spoon","Artisan hand carved timber spoon","Woodcraft","2026-11-02T14:30:00Z","https://fyloo.com/spoon"`}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button type="button" onClick={handleParseCSV} className="craft-btn-secondary craft-btn-sm">
                Parse & Preview Rows
              </button>
              <button
                type="button"
                onClick={() => {
                  setCsvText(`Title,Description,Board,ScheduledAt,Link\n"Autumn Stoneware Mug","Handmade ceramic mug in toasted cream glaze","Ceramics","2026-11-01T10:00:00Z","https://fyloo.com/mug"\n"Ribbed Matcha Chawan","Wheel thrown chawan bowl with satin glaze","Ceramics","2026-11-02T14:30:00Z","https://fyloo.com/chawan"\n"Carved Walnut Spoon","Heirloom walnut coffee tasting spoon","Woodcraft","2026-11-03T20:00:00Z","https://fyloo.com/spoon"`);
                }}
                className="craft-btn-outline craft-btn-sm"
              >
                Load Sample Template
              </button>
            </div>

            {parsedRows.length > 0 && (
              <div style={{ marginBottom: 18, background: "#FAF4EB", border: "1px solid #E7D7C1", borderRadius: 12, padding: "12px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>
                  Parsed {parsedRows.length} pin rows:
                </div>
                <div style={{ maxHeight: 120, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4, fontSize: "0.8rem" }}>
                  {parsedRows.map((r, i) => (
                    <div key={i}>
                      • <strong>{r.title}</strong> → <em>{r.boardName}</em> ({new Date(r.scheduledAt).toLocaleDateString()})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setShowCSVModal(false)} className="craft-btn-outline craft-btn-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedRows.length === 0 || importing}
                onClick={handleImportCSVRowsToDrafts}
                className="craft-btn-primary craft-btn-sm"
              >
                {importing ? "Importing..." : `Import ${parsedRows.length} Pins to Drafts Workshop →`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

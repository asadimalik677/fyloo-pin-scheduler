"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface QueueItem {
  id: string;
  media_id: string;
  board_id: string;
  board_name?: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  scheduled_at: string;
  status: "queued" | "published" | "failed";
  error?: string;
  pin_id?: string;
  created_at: string;
  image_url?: string;
}

export default function QueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [durable, setDurable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "queued" | "published" | "failed">("all");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Auto-publishing status
  const [runningAutoPublish, setRunningAutoPublish] = useState(false);
  const [autoPublishResult, setAutoPublishResult] = useState<{
    published: number;
    results: any[];
    timestamp: string;
  } | null>(null);

  // Reschedule Modal
  const [rescheduleItem, setRescheduleItem] = useState<QueueItem | null>(null);
  const [newTime, setNewTime] = useState("");
  const [savingReschedule, setSavingReschedule] = useState(false);

  async function loadQueue() {
    setLoading(true);
    try {
      const res = await fetch("/api/queue");
      const json = await res.json();
      setItems(json.items ?? []);
      setDurable(json.durable ?? true);
    } catch {
      setStatusMsg("Failed to load queue. Please check connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to remove "${title}" from the queue?`)) return;
    try {
      const res = await fetch(`/api/queue?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setStatusMsg("✓ Pin removed from queue.");
      } else {
        setStatusMsg(`Error: ${json.error || "Failed to remove item"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to delete"}`);
    }
  }

  function openRescheduleModal(item: QueueItem) {
    setRescheduleItem(item);
    const d = new Date(item.scheduled_at);
    const isoLocal = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setNewTime(isoLocal);
  }

  async function submitReschedule(e: React.FormEvent) {
    e.preventDefault();
    if (!rescheduleItem || !newTime) return;
    setSavingReschedule(true);
    try {
      const res = await fetch("/api/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleItem.id,
          scheduled_at: new Date(newTime).toISOString(),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i.id === rescheduleItem.id ? { ...i, scheduled_at: new Date(newTime).toISOString() } : i))
        );
        setStatusMsg(`✓ Rescheduled "${rescheduleItem.title}".`);
        setRescheduleItem(null);
      } else {
        setStatusMsg(`Error: ${json.error || "Failed to reschedule"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to reschedule"}`);
    } finally {
      setSavingReschedule(false);
    }
  }

  async function triggerPublishDue() {
    setRunningAutoPublish(true);
    setStatusMsg("Executing /api/publish-due to publish all pins whose scheduled time has arrived...");
    try {
      const res = await fetch("/api/publish-due", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setAutoPublishResult({
          published: json.published ?? 0,
          results: json.results ?? [],
          timestamp: new Date().toLocaleTimeString(),
        });
        setStatusMsg(`✓ Publish-due cycle completed: ${json.published} pin(s) published.`);
        loadQueue();
      } else {
        setStatusMsg(`Auto-publish error: ${json.error || "Failed"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Network error"}`);
    } finally {
      setRunningAutoPublish(false);
    }
  }

  // Filter items
  const filteredItems = useMemo(() => {
    if (filterStatus === "all") return items;
    return items.filter((i) => i.status === filterStatus);
  }, [items, filterStatus]);

  // Group filtered items by Day (YYYY-MM-DD)
  const groupedByDay = useMemo(() => {
    const groups: { [dayKey: string]: { date: Date; items: QueueItem[] } } = {};

    // Sort items chronologically
    const sorted = [...filteredItems].sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

    for (const item of sorted) {
      const d = new Date(item.scheduled_at);
      const dayKey = isNaN(d.getTime()) ? "unscheduled" : d.toISOString().split("T")[0];
      if (!groups[dayKey]) {
        groups[dayKey] = { date: d, items: [] };
      }
      groups[dayKey].items.push(item);
    }
    return groups;
  }, [filteredItems]);

  return (
    <AppShell
      active="queue"
      title="Queue & Calendar"
      subtitle="Scheduled pins timeline grouped by day with auto-publishing monitoring and controls."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={triggerPublishDue}
            disabled={runningAutoPublish}
            className="craft-btn-outline"
            style={{ fontSize: "0.88rem" }}
          >
            {runningAutoPublish ? "Running Cron..." : "⚡ Run Auto-Publish Now"}
          </button>
          <Link href="/compose" className="craft-btn-primary">
            + Schedule Pin
          </Link>
        </div>
      }
    >
      {/* Storage Warning if not durable */}
      {!durable && (
        <div
          style={{
            background: "#FAF4EB",
            border: "1.5px dashed #E7D7C1",
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 24,
            fontSize: "0.88rem",
            color: "#6A5343",
          }}
        >
          ℹ <strong>Storage Notice:</strong> Vercel KV is not connected in this environment; queue is stored in a local fallback file. For production persistence across serverless invocations, connect Upstash Redis in your Vercel project settings.
        </div>
      )}

      {/* Auto Publish Result Banner */}
      {autoPublishResult && (
        <div
          style={{
            background: "#EEF5F0",
            border: "1px solid #C7E0CF",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            boxShadow: "0 4px 12px rgba(46, 139, 87, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: "#245735" }}>
              ✓ Auto-Publish Run Complete ({autoPublishResult.timestamp})
            </span>
            <button
              type="button"
              onClick={() => setAutoPublishResult(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#4B6B55" }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: "0.88rem", color: "#4B6B55" }}>
            Published {autoPublishResult.published} pin(s) during this cycle.
          </div>
          {autoPublishResult.results.length > 0 && (
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
              {autoPublishResult.results.map((r, i) => (
                <div key={i} style={{ fontSize: "0.82rem", color: "#245735" }}>
                  • {r.title} — Status: <strong>{r.status}</strong> {r.pin_id ? `(ID: ${r.pin_id})` : ""}{r.error ? `— Error: ${r.error}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Notification Message */}
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

      {/* Filter Tabs Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {(["all", "queued", "published", "failed"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={filterStatus === st ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
              style={{ textTransform: "capitalize" }}
            >
              {st} {st === "all" ? `(${items.length})` : `(${items.filter((i) => i.status === st).length})`}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "0.85rem", color: "#8E7564" }}>
          Grouped by day • Time sorted
        </div>
      </div>

      {/* Queue Content */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Loading scheduled pins from queue...
        </div>
      ) : Object.keys(groupedByDay).length === 0 ? (
        <div
          style={{
            padding: "54px 20px",
            textAlign: "center",
            background: "#FFFDF9",
            borderRadius: 18,
            border: "1px dashed #E7D7C1",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📅</div>
          <h3 style={{ margin: "0 0 8px" }}>No pins match this view</h3>
          <p style={{ color: "#6A5343", fontSize: "0.92rem", maxWidth: 440, margin: "0 auto 24px" }}>
            {filterStatus === "all"
              ? "Your queue is currently empty. Schedule a pin using Composer or upload a whole batch in Bulk Scheduler."
              : `No pins currently have the status "${filterStatus}".`}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/compose" className="craft-btn-primary craft-btn-sm">
              + Schedule Single Pin
            </Link>
            <Link href="/bulk" className="craft-btn-secondary craft-btn-sm">
              📦 Bulk Scheduler
            </Link>
          </div>
        </div>
      ) : (
        <div className="queue-group-container">
          {Object.entries(groupedByDay).map(([dayKey, group]) => {
            const formattedDate =
              dayKey === "unscheduled"
                ? "Unscheduled"
                : group.date.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });

            // Check if today
            const isToday =
              dayKey === new Date().toISOString().split("T")[0];

            return (
              <div key={dayKey} className="queue-day-card">
                {/* Day Header with Ribbon */}
                <div className="queue-day-header">
                  <h3 className="queue-day-title">
                    <span>📅</span>
                    <span>{formattedDate}</span>
                    {isToday && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          background: "#9D1C2F",
                          color: "#fff",
                          padding: "2px 8px",
                          borderRadius: 9999,
                        }}
                      >
                        TODAY
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: "0.82rem", color: "#8E7564", fontWeight: 650 }}>
                    {group.items.length} {group.items.length === 1 ? "pin" : "pins"}
                  </span>
                </div>

                {/* Day Items List */}
                <div className="queue-day-items">
                  {group.items.map((item) => {
                    const scheduledTimeStr = new Date(item.scheduled_at).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div key={item.id} className="queue-pin-item">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="queue-pin-thumb"
                          />
                        ) : (
                          <div
                            className="queue-pin-thumb"
                            style={{
                              display: "grid",
                              placeItems: "center",
                              fontSize: "1.4rem",
                              color: "#C27438",
                            }}
                          >
                            📌
                          </div>
                        )}

                        <div className="queue-pin-info">
                          <h4 className="queue-pin-title">{item.title}</h4>
                          <div className="queue-pin-meta">
                            <span style={{ fontWeight: 700, color: "#2D2118" }}>
                              ⏰ {scheduledTimeStr}
                            </span>
                            {item.board_name ? (
                              <span>📁 {item.board_name}</span>
                            ) : (
                              <span>📁 Board {item.board_id.slice(0, 8)}...</span>
                            )}

                            {/* Status Badge */}
                            {item.status === "queued" && (
                              <span className="craft-pill craft-pill-queued">
                                Queued
                              </span>
                            )}
                            {item.status === "published" && (
                              <span className="craft-pill craft-pill-published">
                                ✓ Published
                              </span>
                            )}
                            {item.status === "failed" && (
                              <span className="craft-pill craft-pill-failed" title={item.error}>
                                ✕ Failed
                              </span>
                            )}

                            {/* Link to Live Pinterest Pin if published */}
                            {item.status === "published" && item.pin_id && (
                              <a
                                href={`https://www.pinterest.com/pin/${item.pin_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: "0.78rem",
                                  color: "#245735",
                                  textDecoration: "underline",
                                }}
                              >
                                View Pin on Pinterest ↗
                              </a>
                            )}

                            {/* Error display if failed */}
                            {item.status === "failed" && item.error && (
                              <span style={{ fontSize: "0.78rem", color: "#9D1C2F" }}>
                                Error: {item.error}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="queue-pin-actions">
                          {item.status === "queued" && (
                            <>
                              <button
                                type="button"
                                onClick={() => openRescheduleModal(item)}
                                className="craft-btn-outline craft-btn-sm"
                                title="Change schedule date and time"
                              >
                                Reschedule
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id, item.title)}
                                className="craft-btn-danger"
                                title="Remove this pin from the queue"
                              >
                                Remove
                              </button>
                            </>
                          )}

                          {item.status !== "queued" && (
                            <button
                              type="button"
                              onClick={() => handleDelete(item.id, item.title)}
                              className="craft-btn-outline craft-btn-sm"
                              title="Delete history record"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleItem && (
        <div
          className="craft-modal-backdrop"
          onClick={() => setRescheduleItem(null)}
        >
          <div
            className="craft-modal-card"
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
                borderBottom: "1px solid #E7D7C1",
                paddingBottom: 12,
              }}
            >
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Reschedule Pin</h3>
              <button
                type="button"
                onClick={() => setRescheduleItem(null)}
                style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#6A5343", margin: "0 0 16px" }}>
              Set a new target publication date and time for: <strong>{rescheduleItem.title}</strong>
            </p>

            <form onSubmit={submitReschedule}>
              <div className="craft-form-group">
                <label htmlFor="reschedule-time" className="craft-label">
                  New Scheduled Date & Time
                </label>
                <input
                  id="reschedule-time"
                  type="datetime-local"
                  className="craft-input"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setRescheduleItem(null)}
                  className="craft-btn-outline craft-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReschedule}
                  className="craft-btn-primary craft-btn-sm"
                >
                  {savingReschedule ? "Saving..." : "Update Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

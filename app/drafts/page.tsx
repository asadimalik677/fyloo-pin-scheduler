"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface DraftItem {
  id: string;
  board_id?: string;
  board_name?: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image_data?: string;
  image_name?: string;
  created_at: string;
  updated_at: string;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Quick Schedule Modal state
  const [schedulingDraft, setSchedulingDraft] = useState<DraftItem | null>(null);
  const [scheduledAt, setScheduledAt] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  async function loadDrafts() {
    setLoading(true);
    try {
      const res = await fetch("/api/drafts");
      const json = await res.json();
      setDrafts(json.drafts ?? []);
    } catch {
      setStatusMsg("Failed to load drafts workshop.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDrafts();
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete draft "${title}"?`)) return;
    try {
      const res = await fetch(`/api/drafts?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        setStatusMsg("✓ Draft deleted.");
      } else {
        setStatusMsg(`Error: ${json.error || "Failed to delete"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to delete"}`);
    }
  }

  function openQuickSchedule(draft: DraftItem) {
    setSchedulingDraft(draft);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 30, 0, 0);
    const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduledAt(isoLocal);
  }

  async function handleQuickScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!schedulingDraft || !scheduledAt) return;
    setIsScheduling(true);
    setStatusMsg("Scheduling draft into queue...");
    try {
      // Re-create file blob from base64 if available
      let file: Blob;
      if (schedulingDraft.image_data) {
        const parts = schedulingDraft.image_data.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        file = new Blob([u8arr], { type: mime });
      } else {
        // Placeholder 1x1 png if no image
        file = new Blob([], { type: "image/jpeg" });
      }

      const form = new FormData();
      form.append("image", file, schedulingDraft.image_name || "draft-image.jpg");
      form.append("board_id", schedulingDraft.board_id || "");
      if (schedulingDraft.board_name) form.append("board_name", schedulingDraft.board_name);
      form.append("title", schedulingDraft.title);
      form.append("description", schedulingDraft.description);
      form.append("tags", (schedulingDraft.tags || []).join(", "));
      if (schedulingDraft.link) form.append("link", schedulingDraft.link);
      form.append("scheduled_at", new Date(scheduledAt).toISOString());

      const res = await fetch("/api/queue", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        // Delete draft once queued
        await fetch(`/api/drafts?id=${schedulingDraft.id}`, { method: "DELETE" });
        setDrafts((prev) => prev.filter((d) => d.id !== schedulingDraft.id));
        setStatusMsg(`✓ "${schedulingDraft.title}" moved from drafts to the scheduled queue!`);
        setSchedulingDraft(null);
      } else {
        setStatusMsg(`Error: ${json.error || "Failed to queue draft"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to queue draft"}`);
    } finally {
      setIsScheduling(false);
    }
  }

  return (
    <AppShell
      active="drafts"
      title="Drafts Workshop"
      subtitle="Pins saved for later. Polish descriptions, adjust product imagery, and schedule when ready."
      actions={
        <Link href="/compose" className="craft-btn-primary">
          + Create Draft in Composer
        </Link>
      }
    >
      {/* Status Banner */}
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

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Loading drafts from workshop...
        </div>
      ) : drafts.length === 0 ? (
        <div
          style={{
            padding: "54px 20px",
            textAlign: "center",
            background: "#FFFDF9",
            borderRadius: 18,
            border: "1px dashed #E7D7C1",
          }}
        >
          <div style={{ fontSize: "2.6rem", marginBottom: 12 }}>📝</div>
          <h3 style={{ margin: "0 0 8px" }}>No drafts saved yet</h3>
          <p style={{ color: "#6A5343", fontSize: "0.92rem", maxWidth: 460, margin: "0 auto 24px" }}>
            When working in the Composer, click "Save as Draft" to store incomplete pin concepts, seasonal collections, or uncaptioned product shots without publishing or scheduling.
          </p>
          <Link href="/compose" className="craft-btn-primary craft-btn-sm">
            + Open Composer
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 22,
          }}
        >
          {drafts.map((draft) => (
            <div
              key={draft.id}
              style={{
                background: "#FFFDF9",
                border: "1px solid #E7D7C1",
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 4px 16px rgba(78, 44, 22, 0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Media Thumbnail */}
              <div
                style={{
                  height: 180,
                  background: "#FAF4EB",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {draft.image_data ? (
                  <img
                    src={draft.image_data}
                    alt={draft.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{ textAlign: "center", color: "#8E7564" }}>
                    <div style={{ fontSize: "2rem" }}>🖼️</div>
                    <div style={{ fontSize: "0.78rem", marginTop: 4 }}>No image attached</div>
                  </div>
                )}
                {draft.board_name && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: 8,
                      background: "rgba(255, 255, 255, 0.92)",
                      padding: "3px 10px",
                      borderRadius: 9999,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#C27438",
                    }}
                  >
                    📌 {draft.board_name}
                  </span>
                )}
              </div>

              {/* Draft Body */}
              <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                <h3 style={{ margin: "0 0 6px", fontSize: "1.18rem", lineHeight: 1.3 }}>
                  {draft.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.86rem",
                    color: "#6A5343",
                    margin: "0 0 12px",
                    lineHeight: 1.45,
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {draft.description || "No description written yet."}
                </p>

                {/* Tags */}
                {draft.tags && draft.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                    {draft.tags.slice(0, 4).map((t, idx) => (
                      <span key={idx} className="pin-tag-chip" style={{ fontSize: "0.72rem" }}>
                        #{t}
                      </span>
                    ))}
                    {draft.tags.length > 4 && (
                      <span style={{ fontSize: "0.72rem", color: "#8E7564", alignSelf: "center" }}>
                        +{draft.tags.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Meta & Actions */}
                <div
                  style={{
                    borderTop: "1px solid #F0E6D8",
                    paddingTop: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", color: "#8E7564" }}>
                    Saved {new Date(draft.updated_at).toLocaleDateString()}
                  </span>

                  <div style={{ display: "flex", gap: 6 }}>
                    <Link
                      href={`/compose?draftId=${draft.id}`}
                      className="craft-btn-outline craft-btn-sm"
                      title="Edit in full Composer"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => openQuickSchedule(draft)}
                      className="craft-btn-secondary craft-btn-sm"
                      title="Schedule into Queue"
                    >
                      Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(draft.id, draft.title)}
                      className="craft-btn-danger"
                      title="Delete draft"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Schedule Modal */}
      {schedulingDraft && (
        <div
          className="craft-modal-backdrop"
          onClick={() => setSchedulingDraft(null)}
        >
          <div
            className="craft-modal-card"
            style={{ maxWidth: 440 }}
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
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>Schedule Draft</h3>
              <button
                type="button"
                onClick={() => setSchedulingDraft(null)}
                style={{ background: "none", border: "none", fontSize: "1.1rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.88rem", color: "#6A5343", margin: "0 0 16px" }}>
              Moving <strong>"{schedulingDraft.title}"</strong> to the queue. Choose when you want auto-publishing to post this pin:
            </p>

            <form onSubmit={handleQuickScheduleSubmit}>
              <div className="craft-form-group">
                <label htmlFor="draft-schedule-time" className="craft-label">
                  Posting Date & Time
                </label>
                <input
                  id="draft-schedule-time"
                  type="datetime-local"
                  className="craft-input"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setSchedulingDraft(null)}
                  className="craft-btn-outline craft-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScheduling}
                  className="craft-btn-primary craft-btn-sm"
                >
                  {isScheduling ? "Queueing Pin..." : "Add to Queue →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

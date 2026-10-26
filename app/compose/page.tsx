"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AppShell from "../../components/AppShell";

export const dynamic = "force-dynamic";

interface Board {
  id: string;
  name: string;
}

function ComposeContent() {
  const searchParams = useSearchParams();
  const preselectedBoardId = searchParams.get("boardId");
  const draftId = searchParams.get("draftId");

  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [link, setLink] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Load boards and draft (if editing a draft)
  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then((j) => {
        const boardList = j.boards ?? [];
        setBoards(boardList);
        if (preselectedBoardId) {
          setBoardId(preselectedBoardId);
        } else if (boardList.length > 0) {
          setBoardId(boardList[0].id);
        }
      })
      .catch(() => {
        setStatusMessage({
          text: "Could not load boards. Please ensure Pinterest is connected.",
          type: "error",
        });
      });

    // If draftId provided, fetch draft data
    if (draftId) {
      fetch("/api/drafts")
        .then((r) => r.json())
        .then((j) => {
          const draft = (j.drafts ?? []).find((d: any) => d.id === draftId);
          if (draft) {
            setTitle(draft.title || "");
            setDescription(draft.description || "");
            setTags((draft.tags || []).join(", "));
            setLink(draft.link || "");
            if (draft.board_id) setBoardId(draft.board_id);
            if (draft.image_data) setImagePreviewUrl(draft.image_data);
          }
        });
    }
  }, [preselectedBoardId, draftId]);

  // Set default schedule time to tomorrow morning 09:00 if not set
  useEffect(() => {
    if (!scheduledAt) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const isoLocal = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setScheduledAt(isoLocal);
    }
  }, [scheduledAt]);

  function handleImageChange(file: File | null) {
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  }

  const selectedBoardName = useMemo(() => {
    return boards.find((b) => b.id === boardId)?.name || "Select a Board";
  }, [boards, boardId]);

  const parsedTagsList = useMemo(() => {
    return tags
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
  }, [tags]);

  function buildFormData(): FormData | null {
    if (!image && !imagePreviewUrl) {
      setStatusMessage({ text: "Please choose an image for your pin.", type: "error" });
      return null;
    }
    if (!boardId) {
      setStatusMessage({ text: "Please select a target Pinterest board.", type: "error" });
      return null;
    }
    if (!title.trim()) {
      setStatusMessage({ text: "Please enter a title for your pin.", type: "error" });
      return null;
    }

    const form = new FormData();
    if (image) {
      form.append("image", image);
    }
    form.append("board_id", boardId);
    form.append("board_name", selectedBoardName);
    form.append("title", title);
    form.append("description", description);
    form.append("tags", tags);
    form.append("link", link);
    return form;
  }

  // Publish Now action
  async function handlePublishNow(e: React.FormEvent) {
    e.preventDefault();
    const form = buildFormData();
    if (!form) return;
    if (!image) {
      setStatusMessage({ text: "To publish now, please select an image file.", type: "error" });
      return;
    }

    setLoading(true);
    setStatusMessage({ text: "Publishing directly to Pinterest...", type: "info" });
    try {
      const res = await fetch("/api/pins", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        setStatusMessage({
          text: `✓ Pin published successfully! Pinterest ID: ${json.pin?.id}`,
          type: "success",
        });
        // If from draft, optionally delete draft
        if (draftId) {
          fetch(`/api/drafts?id=${draftId}`, { method: "DELETE" });
        }
      } else {
        setStatusMessage({ text: `Error: ${json.error || "Publish failed"}`, type: "error" });
      }
    } catch (e) {
      setStatusMessage({ text: `Network error: ${e instanceof Error ? e.message : "Failed"}`, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // Add to Queue action
  async function handleAddToQueue(e: React.FormEvent) {
    e.preventDefault();
    const form = buildFormData();
    if (!form) return;
    if (!scheduledAt) {
      setStatusMessage({ text: "Please set a schedule date and time.", type: "error" });
      return;
    }
    if (!image) {
      setStatusMessage({ text: "Please choose an image file to schedule.", type: "error" });
      return;
    }

    form.append("scheduled_at", new Date(scheduledAt).toISOString());

    setLoading(true);
    setStatusMessage({ text: "Preparing media and adding to queue...", type: "info" });
    try {
      const res = await fetch("/api/queue", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        setStatusMessage({
          text: "✓ Pin scheduled and added to the Queue successfully!",
          type: "success",
        });
        if (draftId) {
          fetch(`/api/drafts?id=${draftId}`, { method: "DELETE" });
        }
      } else {
        setStatusMessage({ text: `Error: ${json.error || "Queue failed"}`, type: "error" });
      }
    } catch (e) {
      setStatusMessage({ text: `Network error: ${e instanceof Error ? e.message : "Failed"}`, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  // Save as Draft action
  async function handleSaveDraft(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ text: "Saving draft...", type: "info" });
    try {
      const form = new FormData();
      if (draftId) form.append("id", draftId);
      if (boardId) form.append("board_id", boardId);
      form.append("board_name", selectedBoardName);
      form.append("title", title || "Untitled Draft");
      form.append("description", description);
      form.append("tags", tags);
      form.append("link", link);
      if (image) {
        form.append("image", image);
      } else if (imagePreviewUrl) {
        form.append("image_data", imagePreviewUrl);
      }

      const res = await fetch("/api/drafts", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) {
        setStatusMessage({ text: "✓ Saved to Drafts Workshop!", type: "success" });
      } else {
        setStatusMessage({ text: `Error: ${json.error || "Save draft failed"}`, type: "error" });
      }
    } catch (e) {
      setStatusMessage({ text: `Error: ${e instanceof Error ? e.message : "Failed"}`, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      active="compose"
      title="Pin Composer"
      subtitle="Craft your pin with live visual preview, custom tags, and scheduled delivery."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/bulk" className="craft-btn-secondary craft-btn-sm">
            Bulk Scheduler →
          </Link>
          <Link href="/drafts" className="craft-btn-outline craft-btn-sm">
            Drafts Workshop
          </Link>
        </div>
      }
    >
      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          style={{
            background:
              statusMessage.type === "success"
                ? "#EEF5F0"
                : statusMessage.type === "error"
                ? "#FDF0F2"
                : "#FAF5EC",
            border: `1.5px solid ${
              statusMessage.type === "success"
                ? "#C7E0CF"
                : statusMessage.type === "error"
                ? "#F3BAC2"
                : "#E7D7C1"
            }`,
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color:
              statusMessage.type === "success"
                ? "#245735"
                : statusMessage.type === "error"
                ? "#9D1C2F"
                : "#6A5343",
            fontWeight: 600,
          }}
        >
          <span>{statusMessage.text}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="composer-layout">
        {/* Left Column: Pin Creation Form */}
        <div className="craft-card" style={{ marginBottom: 0 }}>
          <div className="craft-card-header">
            <h3 className="craft-card-title">Pin Specifications</h3>
            <span style={{ fontSize: "0.82rem", color: "#8E7564" }}>
              {draftId ? "Editing Draft" : "New Pin"}
            </span>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {/* Board Selector */}
            <div className="craft-form-group">
              <label htmlFor="board-select" className="craft-label">
                Target Board <span style={{ color: "#9D1C2F" }}>*</span>
              </label>
              <select
                id="board-select"
                className="craft-select"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                required
              >
                {boards.length === 0 && <option value="">No boards loaded</option>}
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <div className="craft-help-text">
                Need a new board? <Link href="/boards#create-board">Create one in Boards</Link>
              </div>
            </div>

            {/* Image Upload Zone */}
            <div className="craft-form-group">
              <label className="craft-label">
                Pin Artwork / Product Photo <span style={{ color: "#9D1C2F" }}>*</span>
              </label>
              <div
                className="craft-dropzone"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />
                <div className="craft-dropzone-icon">🖼️</div>
                <div style={{ fontWeight: 700, fontSize: "0.98rem", marginBottom: 4 }}>
                  {image ? image.name : "Click to select or drop product photo"}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#8E7564" }}>
                  PNG, JPG, or WEBP. 2:3 aspect ratio (e.g. 1000x1500) looks best on Pinterest.
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="craft-form-group">
              <label htmlFor="pin-title" className="craft-label">
                Pin Title <span style={{ color: "#9D1C2F" }}>*</span>
              </label>
              <input
                id="pin-title"
                type="text"
                className="craft-input"
                placeholder="e.g. Handcrafted Ceramic Matcha Mug in Forest Glaze"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <div className="craft-help-text" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Up to 100 characters. Shown boldly at the top of your pin.</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Description */}
            <div className="craft-form-group">
              <label htmlFor="pin-desc" className="craft-label">
                Description
              </label>
              <textarea
                id="pin-desc"
                className="craft-textarea"
                placeholder="Tell your shop story, materials used, size details, and why makers love this piece..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <div className="craft-help-text" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Pinterest API appends your tags as searchable hashtags.</span>
                <span>{description.length}/500</span>
              </div>
            </div>

            {/* Tags */}
            <div className="craft-form-group">
              <label htmlFor="pin-tags" className="craft-label">
                Tags (Comma separated)
              </label>
              <input
                id="pin-tags"
                type="text"
                className="craft-input"
                placeholder="ceramics, handmade, pottery, coffee mug, artisan"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <div className="craft-help-text">
                Tags help Pinterest searchers find your items (e.g. #ceramics #handmade).
              </div>
            </div>

            {/* Destination Link */}
            <div className="craft-form-group">
              <label htmlFor="pin-link" className="craft-label">
                Destination Link (Etsy / Shop URL)
              </label>
              <input
                id="pin-link"
                type="url"
                className="craft-input"
                placeholder="https://fyloo.com/products/matcha-mug"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <div className="craft-help-text">
                Where shoppers go when they click your pin.
              </div>
            </div>

            {/* Scheduled Date and Time */}
            <div className="craft-form-group">
              <label htmlFor="pin-schedule" className="craft-label">
                Schedule Date & Time (for Queue)
              </label>
              <input
                id="pin-schedule"
                type="datetime-local"
                className="craft-input"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <div className="craft-help-text">
                Pins are published when this time arrives by /api/publish-due.
              </div>
            </div>

            {/* Action Buttons Row */}
            <div
              style={{
                borderTop: "1px solid #E7D7C1",
                paddingTop: 20,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                disabled={loading}
                onClick={handlePublishNow}
                className="craft-btn-primary"
              >
                {loading ? "Processing..." : "Publish Now"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleAddToQueue}
                className="craft-btn-secondary"
              >
                Add to Queue
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSaveDraft}
                className="craft-btn-outline"
                style={{ marginLeft: "auto" }}
              >
                Save as Draft
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: LIVE Preview Card */}
        <div className="composer-preview-sticky">
          <div style={{ marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#C27438" }}>
              Live Pin Preview
            </span>
            <span style={{ fontSize: "0.78rem", color: "#8E7564" }}>
              Updates as you type
            </span>
          </div>

          <div className="pin-live-card">
            {/* Top Board Bar */}
            <div className="pin-live-badge-bar">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>📌</span> {selectedBoardName}
              </span>
              <span style={{ fontSize: "0.72rem", color: "#8E7564" }}>Preview</span>
            </div>

            {/* Image Preview */}
            <div className="pin-live-media-wrap">
              {imagePreviewUrl ? (
                <img
                  src={imagePreviewUrl}
                  alt={title || "Pin preview"}
                  className="pin-live-img"
                />
              ) : (
                <div className="pin-live-empty-state">
                  <div style={{ fontSize: "2.4rem", marginBottom: 8, opacity: 0.6 }}>📷</div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>No image selected yet</div>
                  <div style={{ fontSize: "0.78rem", color: "#8E7564", marginTop: 4 }}>
                    Choose an image to see it rendered here
                  </div>
                </div>
              )}
            </div>

            {/* Pin Content Details */}
            <div className="pin-live-content">
              <span className="pin-live-board-pill">
                Collection: {selectedBoardName}
              </span>

              <h2 className="pin-live-title">
                {title || "Your Pin Title Will Appear Here"}
              </h2>

              <p className="pin-live-desc">
                {description || "Write a thoughtful description to inspire Pinterest shoppers and describe your handmade pieces."}
              </p>

              {/* Tags Chips Preview */}
              {parsedTagsList.length > 0 && (
                <div className="pin-live-tags">
                  {parsedTagsList.map((tag, idx) => (
                    <span key={idx} className="pin-tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Outbound Link Chip */}
              {link && (
                <div className="pin-live-link">
                  <span>↗</span>
                  <span>{link.replace(/^https?:\/\//, "")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function ComposePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Loading pin composer...
        </div>
      }
    >
      <ComposeContent />
    </Suspense>
  );
}


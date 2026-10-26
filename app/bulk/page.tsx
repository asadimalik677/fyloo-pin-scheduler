"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface Board {
  id: string;
  name: string;
}

interface ScheduleSlot {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

interface BulkPinItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  tags: string;
  link: string;
  board_id: string;
  board_name?: string;
  scheduled_at: string;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg?: string;
}

export default function BulkSchedulerPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [items, setItems] = useState<BulkPinItem[]>([]);

  // Shared defaults
  const [sharedBoardId, setSharedBoardId] = useState("");
  const [sharedTitlePrefix, setSharedTitlePrefix] = useState("");
  const [sharedDescription, setSharedDescription] = useState("");
  const [sharedTags, setSharedTags] = useState("");
  const [sharedLink, setSharedLink] = useState("");

  // Cadence settings
  const [startDate, setStartDate] = useState("");
  const [cadenceMode, setCadenceMode] = useState<"slots" | "daily1" | "daily2">("slots");
  const [fixedTime, setFixedTime] = useState("10:00");

  // Progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressCount, setProgressCount] = useState(0);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  // Load boards and time slots
  useEffect(() => {
    fetch("/api/boards")
      .then((r) => r.json())
      .then((j) => {
        const bl = j.boards ?? [];
        setBoards(bl);
        if (bl.length > 0) setSharedBoardId(bl[0].id);
      })
      .catch(() => {});

    fetch("/api/settings/schedule")
      .then((r) => r.json())
      .then((j) => {
        const slots = j.settings?.slots ?? [];
        setScheduleSlots(slots.filter((s: ScheduleSlot) => s.enabled));
      })
      .catch(() => {});

    // Default start date to tomorrow
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    setStartDate(tom.toISOString().split("T")[0]);
  }, []);

  // Handle files selection
  function handleFilesSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newItems: BulkPinItem[] = files.map((file, idx) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const preview = URL.createObjectURL(file);
      return {
        id: crypto.randomUUID(),
        file,
        previewUrl: preview,
        title: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
        description: sharedDescription,
        tags: sharedTags,
        link: sharedLink,
        board_id: sharedBoardId,
        board_name: boards.find((b) => b.id === sharedBoardId)?.name,
        scheduled_at: "",
        status: "idle",
      };
    });

    const combined = [...items, ...newItems];
    setItems(combined);
    applyScheduleCadence(combined);
  }

  // Calculate schedule timestamps for all items
  function applyScheduleCadence(currentItems: BulkPinItem[] = items) {
    if (currentItems.length === 0 || !startDate) return;

    const [year, month, day] = startDate.split("-").map(Number);
    let curDate = new Date(year, month - 1, day);

    const updated = currentItems.map((item, idx) => {
      let pinTimeStr = "10:00";

      if (cadenceMode === "slots" && scheduleSlots.length > 0) {
        // Distribute through user's active time slots
        const slotIdx = idx % scheduleSlots.length;
        const dayOffset = Math.floor(idx / scheduleSlots.length);
        const targetDate = new Date(curDate);
        targetDate.setDate(targetDate.getDate() + dayOffset);

        const slot = scheduleSlots[slotIdx];
        const [hours, mins] = slot.time.split(":").map(Number);
        targetDate.setHours(hours, mins, 0, 0);

        return { ...item, scheduled_at: targetDate.toISOString() };
      } else if (cadenceMode === "daily2") {
        // 2 pins per day: 09:30 and 18:30
        const isEvening = idx % 2 === 1;
        const dayOffset = Math.floor(idx / 2);
        const targetDate = new Date(curDate);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        if (isEvening) {
          targetDate.setHours(18, 30, 0, 0);
        } else {
          targetDate.setHours(9, 30, 0, 0);
        }
        return { ...item, scheduled_at: targetDate.toISOString() };
      } else {
        // 1 pin per day at fixedTime
        const dayOffset = idx;
        const targetDate = new Date(curDate);
        targetDate.setDate(targetDate.getDate() + dayOffset);
        const [hours, mins] = fixedTime.split(":").map(Number);
        targetDate.setHours(hours, mins, 0, 0);
        return { ...item, scheduled_at: targetDate.toISOString() };
      }
    });

    setItems(updated);
  }

  // Apply shared defaults to all items
  function applySharedToAll() {
    const updated = items.map((item) => ({
      ...item,
      board_id: sharedBoardId || item.board_id,
      board_name: boards.find((b) => b.id === (sharedBoardId || item.board_id))?.name,
      description: sharedDescription || item.description,
      tags: sharedTags || item.tags,
      link: sharedLink || item.link,
      title: sharedTitlePrefix ? `${sharedTitlePrefix} — ${item.title}` : item.title,
    }));
    setItems(updated);
  }

  function removeItem(id: string) {
    const filtered = items.filter((i) => i.id !== id);
    setItems(filtered);
    applyScheduleCadence(filtered);
  }

  function updateItem(id: string, updates: Partial<BulkPinItem>) {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );
  }

  // Submit all pins to Queue sequentially
  async function handleQueueAll() {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgressCount(0);
    setCompletionMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      updateItem(item.id, { status: "uploading" });

      try {
        const form = new FormData();
        form.append("image", item.file);
        form.append("board_id", item.board_id);
        if (item.board_name) form.append("board_name", item.board_name);
        form.append("title", item.title);
        form.append("description", item.description);
        form.append("tags", item.tags);
        form.append("link", item.link);
        form.append("scheduled_at", item.scheduled_at || new Date().toISOString());

        const res = await fetch("/api/queue", { method: "POST", body: form });
        const json = await res.json();

        if (res.ok) {
          updateItem(item.id, { status: "success" });
          successCount++;
        } else {
          updateItem(item.id, { status: "error", errorMsg: json.error || "Failed" });
          failCount++;
        }
      } catch (e) {
        updateItem(item.id, {
          status: "error",
          errorMsg: e instanceof Error ? e.message : "Network error",
        });
        failCount++;
      }

      setProgressCount(i + 1);
    }

    setIsProcessing(false);
    setCompletionMessage(
      `✓ Finished bulk scheduling: ${successCount} pin(s) queued successfully.${
        failCount > 0 ? ` (${failCount} errors)` : ""
      }`
    );
  }

  return (
    <AppShell
      active="bulk"
      title="Bulk Pin Scheduler"
      subtitle="Upload dozens of images, distribute across schedule time slots, and queue them all in one go."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/settings/schedule" className="craft-btn-outline craft-btn-sm">
            ⚙ Configure Time Slots
          </Link>
          <Link href="/queue" className="craft-btn-secondary craft-btn-sm">
            View Queue →
          </Link>
        </div>
      }
    >
      {/* Completion Alert */}
      {completionMessage && (
        <div
          style={{
            background: "#EEF5F0",
            border: "1.5px solid #C7E0CF",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "#245735", fontWeight: 700 }}>
            {completionMessage}
          </div>
          <Link href="/queue" className="craft-btn-primary craft-btn-sm">
            Open Queue →
          </Link>
        </div>
      )}

      {/* Step 1: Upload Multiple Photos */}
      <div className="craft-card">
        <div className="craft-card-header">
          <h3 className="craft-card-title">1. Upload Image Batch</h3>
          <span style={{ fontSize: "0.82rem", color: "#8E7564" }}>
            {items.length} image(s) selected
          </span>
        </div>

        <div
          className="craft-dropzone"
          onClick={() => document.getElementById("bulk-file-input")?.click()}
        >
          <input
            id="bulk-file-input"
            type="file"
            multiple
            accept="image/png, image/jpeg, image/webp"
            style={{ display: "none" }}
            onChange={handleFilesSelect}
          />
          <div className="craft-dropzone-icon">📦</div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: 4 }}>
            Click to upload multiple images or drag photos here
          </div>
          <div style={{ fontSize: "0.85rem", color: "#8E7564" }}>
            Select as many files as you like. Titles will be auto-derived from filenames.
          </div>
        </div>
      </div>

      {items.length > 0 && (
        <>
          {/* Step 2: Shared Settings & Cadence Settings */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {/* Shared Defaults Card */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">2. Shared Settings</h3>
                <button
                  type="button"
                  onClick={applySharedToAll}
                  className="craft-btn-secondary craft-btn-sm"
                >
                  Apply to All Pins
                </button>
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Shared Board</label>
                <select
                  className="craft-select"
                  value={sharedBoardId}
                  onChange={(e) => setSharedBoardId(e.target.value)}
                >
                  {boards.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Title Prefix / Collection</label>
                <input
                  type="text"
                  className="craft-input"
                  placeholder="e.g. Autumn 2026 Collection"
                  value={sharedTitlePrefix}
                  onChange={(e) => setSharedTitlePrefix(e.target.value)}
                />
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Shared Description</label>
                <textarea
                  className="craft-textarea"
                  style={{ minHeight: 70 }}
                  placeholder="Shared story, maker details, or care instructions..."
                  value={sharedDescription}
                  onChange={(e) => setSharedDescription(e.target.value)}
                />
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Shared Tags</label>
                <input
                  type="text"
                  className="craft-input"
                  placeholder="handmade, artisan, pottery, shop"
                  value={sharedTags}
                  onChange={(e) => setSharedTags(e.target.value)}
                />
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Shared Destination Link</label>
                <input
                  type="url"
                  className="craft-input"
                  placeholder="https://fyloo.com/collections/autumn"
                  value={sharedLink}
                  onChange={(e) => setSharedLink(e.target.value)}
                />
              </div>
            </div>

            {/* Posting Cadence Rules Card */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">3. Schedule Cadence</h3>
                <button
                  type="button"
                  onClick={() => applyScheduleCadence()}
                  className="craft-btn-outline craft-btn-sm"
                >
                  Recalculate Dates
                </button>
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Start Date</label>
                <input
                  type="date"
                  className="craft-input"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                />
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Cadence Pattern</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="cadence"
                      checked={cadenceMode === "slots"}
                      onChange={() => {
                        setCadenceMode("slots");
                      }}
                    />
                    <span>
                      <strong>Fill My Time Slots</strong> ({scheduleSlots.length} active daily slots)
                    </span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="cadence"
                      checked={cadenceMode === "daily1"}
                      onChange={() => {
                        setCadenceMode("daily1");
                      }}
                    />
                    <span>
                      <strong>1 pin per day</strong> at fixed time
                    </span>
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="cadence"
                      checked={cadenceMode === "daily2"}
                      onChange={() => {
                        setCadenceMode("daily2");
                      }}
                    />
                    <span>
                      <strong>2 pins per day</strong> (Morning 09:30 & Evening 18:30)
                    </span>
                  </label>
                </div>
              </div>

              {cadenceMode === "daily1" && (
                <div className="craft-form-group">
                  <label className="craft-label">Posting Time</label>
                  <input
                    type="time"
                    className="craft-input"
                    value={fixedTime}
                    onChange={(e) => setFixedTime(e.target.value)}
                  />
                </div>
              )}

              <div
                style={{
                  background: "#FAF4EB",
                  border: "1px solid #E7D7C1",
                  borderRadius: 12,
                  padding: "12px 16px",
                  fontSize: "0.85rem",
                  color: "#6A5343",
                  marginTop: 18,
                }}
              >
                💡 <strong>Cadence Preview:</strong> Your {items.length} pin(s) will be distributed starting from {startDate} according to the chosen pattern.
              </div>
            </div>
          </div>

          {/* Step 3: Individual Pins Customization List */}
          <div className="craft-card">
            <div className="craft-card-header">
              <h3 className="craft-card-title">4. Review & Customize Individual Pins</h3>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={handleQueueAll}
                  disabled={isProcessing || items.length === 0}
                  className="craft-btn-primary"
                  style={{ padding: "10px 24px" }}
                >
                  {isProcessing
                    ? `Queueing (${progressCount}/${items.length})...`
                    : `Queue All ${items.length} Pins in One Go →`}
                </button>
              </div>
            </div>

            {/* Progress Bar during processing */}
            {isProcessing && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 6, fontWeight: 700 }}>
                  <span>Uploading to Pinterest media library & queueing...</span>
                  <span>{progressCount} / {items.length}</span>
                </div>
                <div style={{ width: "100%", height: 8, background: "#E7D7C1", borderRadius: 9999, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      background: "#9D1C2F",
                      width: `${(progressCount / items.length) * 100}%`,
                      transition: "width 0.25s ease",
                    }}
                  />
                </div>
              </div>
            )}

            <div className="bulk-grid">
              {items.map((item, idx) => (
                <div key={item.id} className="bulk-item-card">
                  <div style={{ position: "relative" }}>
                    <img
                      src={item.previewUrl}
                      alt={item.title}
                      className="bulk-item-thumb"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: "rgba(0, 0, 0, 0.65)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: 26,
                        height: 26,
                        display: "grid",
                        placeItems: "center",
                        cursor: "pointer",
                      }}
                      title="Remove from batch"
                    >
                      ✕
                    </button>
                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        left: 8,
                        background: "rgba(255, 255, 255, 0.9)",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <label className="craft-label" style={{ fontSize: "0.8rem" }}>Title</label>
                    <input
                      type="text"
                      className="craft-input"
                      style={{ padding: "8px 10px", fontSize: "0.88rem" }}
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="craft-label" style={{ fontSize: "0.8rem" }}>Board</label>
                    <select
                      className="craft-select"
                      style={{ padding: "8px 10px", fontSize: "0.88rem" }}
                      value={item.board_id}
                      onChange={(e) => {
                        const bName = boards.find((b) => b.id === e.target.value)?.name;
                        updateItem(item.id, { board_id: e.target.value, board_name: bName });
                      }}
                    >
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="craft-label" style={{ fontSize: "0.8rem" }}>Scheduled At</label>
                    <input
                      type="datetime-local"
                      className="craft-input"
                      style={{ padding: "8px 10px", fontSize: "0.85rem" }}
                      value={item.scheduled_at ? item.scheduled_at.slice(0, 16) : ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : "",
                        })
                      }
                    />
                  </div>

                  {/* Item Status */}
                  <div style={{ marginTop: 4, fontSize: "0.8rem" }}>
                    {item.status === "uploading" && (
                      <span style={{ color: "#C27438", fontWeight: 700 }}>⏳ Uploading media...</span>
                    )}
                    {item.status === "success" && (
                      <span style={{ color: "#2E8B57", fontWeight: 700 }}>✓ Queued</span>
                    )}
                    {item.status === "error" && (
                      <span style={{ color: "#9D1C2F", fontWeight: 700 }}>✕ {item.errorMsg}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                type="button"
                onClick={handleQueueAll}
                disabled={isProcessing || items.length === 0}
                className="craft-btn-primary"
                style={{ padding: "12px 28px", fontSize: "1rem" }}
              >
                {isProcessing
                  ? `Queueing (${progressCount}/${items.length})...`
                  : `Queue All ${items.length} Pins in One Go →`}
              </button>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}

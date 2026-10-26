"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../../components/AppShell";

interface ScheduleSlot {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
}

export default function ScheduleSettingsPage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New slot inputs
  const [newLabel, setNewLabel] = useState("");
  const [newTime, setNewTime] = useState("12:00");

  useEffect(() => {
    fetch("/api/settings/schedule")
      .then((r) => r.json())
      .then((j) => {
        setSlots(j.settings?.slots ?? []);
      })
      .catch(() => setMessage("Failed to load schedule settings."))
      .finally(() => setLoading(false));
  }, []);

  function toggleSlot(id: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function updateSlotTime(id: string, time: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, time } : s))
    );
  }

  function updateSlotLabel(id: string, label: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, label } : s))
    );
  }

  function removeSlot(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  function addSlot(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    const newSlot: ScheduleSlot = {
      id: `slot-${crypto.randomUUID().slice(0, 8)}`,
      label: newLabel.trim(),
      time: newTime || "12:00",
      enabled: true,
    };
    setSlots((prev) => [...prev, newSlot]);
    setNewLabel("");
    setNewTime("12:00");
  }

  async function handleSaveSettings() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage("✓ Daily posting time slots saved successfully!");
      } else {
        setMessage(`Error: ${json.error || "Failed to save settings"}`);
      }
    } catch (e) {
      setMessage(`Error: ${e instanceof Error ? e.message : "Failed to save"}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      active="schedule-settings"
      title="Posting Schedule Settings"
      subtitle="Define daily time slots (Morning, Afternoon, Night) that the Bulk Scheduler fills automatically."
      actions={
        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving}
          className="craft-btn-primary"
        >
          {saving ? "Saving Changes..." : "Save Time Slots"}
        </button>
      }
    >
      {/* Alert Message */}
      {message && (
        <div
          style={{
            background: message.startsWith("✓") ? "#EEF5F0" : "#FDF0F2",
            border: `1.5px solid ${message.startsWith("✓") ? "#C7E0CF" : "#F3BAC2"}`,
            borderRadius: 14,
            padding: "14px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: message.startsWith("✓") ? "#245735" : "#9D1C2F",
            fontWeight: 600,
          }}
        >
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Explanatory Craft Banner */}
      <div
        style={{
          background: "#FFFDF9",
          border: "1.5px solid #E7D7C1",
          borderRadius: 18,
          padding: "24px 28px",
          marginBottom: 28,
          display: "flex",
          gap: 20,
          alignItems: "center",
          boxShadow: "0 4px 16px rgba(78, 44, 22, 0.04)",
        }}
      >
        <div style={{ fontSize: "2.4rem" }}>🕒</div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1.2rem" }}>
            How Smart Time Slots Work
          </h3>
          <p style={{ margin: 0, color: "#6A5343", fontSize: "0.92rem", lineHeight: 1.55 }}>
            Whenever you batch-upload images in the <strong>Bulk Scheduler</strong>, the queue engine cycles through your active daily slots (for example, assigning Pin 1 to Morning, Pin 2 to Afternoon, Pin 3 to Night, Pin 4 to tomorrow morning, and so forth).
          </p>
        </div>
      </div>

      {/* Time Slots List Card */}
      <div className="craft-card">
        <div className="craft-card-header">
          <h3 className="craft-card-title">Daily Posting Windows</h3>
          <span style={{ fontSize: "0.84rem", color: "#8E7564" }}>
            {slots.filter((s) => s.enabled).length} of {slots.length} active
          </span>
        </div>

        {loading ? (
          <div style={{ padding: 36, textAlign: "center", color: "#8E7564" }}>
            Loading time slot settings...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {slots.map((slot) => (
              <div
                key={slot.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 20px",
                  background: slot.enabled ? "#FFFFFF" : "#F7EFE4",
                  border: `1.5px solid ${slot.enabled ? "#E7D7C1" : "#E2D3BE"}`,
                  borderRadius: 14,
                  opacity: slot.enabled ? 1 : 0.7,
                  transition: "all 0.15s ease",
                  flexWrap: "wrap",
                }}
              >
                {/* Checkbox toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 200, flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={slot.enabled}
                    onChange={() => toggleSlot(slot.id)}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#9D1C2F" }}
                  />
                  <input
                    type="text"
                    className="craft-input"
                    value={slot.label}
                    onChange={(e) => updateSlotLabel(slot.id, e.target.value)}
                    style={{ padding: "6px 12px", fontSize: "0.95rem", fontWeight: 700 }}
                  />
                </div>

                {/* Time Picker */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <label style={{ fontSize: "0.85rem", color: "#8E7564", fontWeight: 600 }}>
                    Time:
                  </label>
                  <input
                    type="time"
                    className="craft-input"
                    value={slot.time}
                    onChange={(e) => updateSlotTime(slot.id, e.target.value)}
                    style={{ width: 130, padding: "6px 10px" }}
                  />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  className="craft-btn-danger"
                  title="Remove this slot"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={saving}
            className="craft-btn-primary"
          >
            {saving ? "Saving Changes..." : "Save Time Slots"}
          </button>
        </div>
      </div>

      {/* Add New Slot Card */}
      <div className="craft-card" style={{ maxWidth: 540 }}>
        <div className="craft-card-header">
          <h3 className="craft-card-title">Add Custom Daily Slot</h3>
        </div>

        <form onSubmit={addSlot}>
          <div className="craft-form-group">
            <label htmlFor="slot-label" className="craft-label">
              Slot Label
            </label>
            <input
              id="slot-label"
              type="text"
              className="craft-input"
              placeholder="e.g. Afternoon Tea Break, Night Showcase"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
            />
          </div>

          <div className="craft-form-group">
            <label htmlFor="slot-time" className="craft-label">
              Target Posting Time
            </label>
            <input
              id="slot-time"
              type="time"
              className="craft-input"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="craft-btn-secondary">
            + Add to Daily Slots
          </button>
        </form>
      </div>
    </AppShell>
  );
}

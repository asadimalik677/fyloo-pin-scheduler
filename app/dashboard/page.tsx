"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "../../components/AppShell";

export const dynamic = "force-dynamic";

interface QueueItem {
  id: string;
  title: string;
  board_id: string;
  board_name?: string;
  scheduled_at: string;
  status: "queued" | "published" | "failed";
  image_url?: string;
  pin_id?: string;
  error?: string;
}

interface Board {
  id: string;
  name: string;
  pin_count?: number;
}

function DashboardContent() {

  const searchParams = useSearchParams();
  const justConnected = searchParams.get("connected") === "1";

  const [connected, setConnected] = useState<boolean | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [draftCount, setDraftCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      // 1. Fetch Boards & connection status
      const boardsRes = await fetch("/api/boards");
      if (boardsRes.ok) {
        const boardsData = await boardsRes.json();
        setBoards(boardsData.boards ?? []);
        setConnected(true);
      } else {
        setConnected(false);
      }

      // 2. Fetch Queue
      const queueRes = await fetch("/api/queue");
      if (queueRes.ok) {
        const queueData = await queueRes.json();
        setQueueItems(queueData.items ?? []);
      }

      // 3. Fetch Drafts
      const draftsRes = await fetch("/api/drafts");
      if (draftsRes.ok) {
        const draftsData = await draftsRes.json();
        setDraftCount(draftsData.drafts?.length ?? 0);
      }
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function triggerAutoPublish() {
    setPublishing(true);
    setPublishMessage("Checking and publishing due pins...");
    try {
      const res = await fetch("/api/publish-due", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setPublishMessage(
          `Auto-publishing complete: ${json.published} pin(s) published.`
        );
        loadData();
      } else {
        setPublishMessage(`Error: ${json.error || "Failed to trigger auto-publish"}`);
      }
    } catch (e) {
      setPublishMessage(`Error: ${e instanceof Error ? e.message : "Network error"}`);
    } finally {
      setPublishing(false);
    }
  }

  const queuedPins = queueItems.filter((i) => i.status === "queued");
  const publishedPins = queueItems.filter((i) => i.status === "published");

  // Upcoming pins: queued items sorted ascending by scheduled_at
  const upcomingPins = [...queuedPins].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  ).slice(0, 5);

  return (
    <AppShell
      active="dashboard"
      title="Studio Dashboard"
      subtitle="Overview of your Pinterest automation, upcoming schedule, and pin metrics."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={triggerAutoPublish}
            disabled={publishing}
            className="craft-btn-outline"
            style={{ fontSize: "0.88rem" }}
          >
            {publishing ? "Publishing..." : "⚡ Run Auto-Publish"}
          </button>
          <Link href="/compose" className="craft-btn-primary">
            + New Pin
          </Link>
        </div>
      }
    >
      {/* Connected Success Alert */}
      {justConnected && (
        <div
          style={{
            background: "#EEF5F0",
            border: "1.5px solid #C7E0CF",
            borderRadius: 14,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 12px rgba(46, 139, 87, 0.1)",
          }}
        >
          <div style={{ fontSize: "1.4rem" }}>🎉</div>
          <div>
            <div style={{ fontWeight: 700, color: "#245735" }}>
              Successfully connected to Pinterest!
            </div>
            <div style={{ fontSize: "0.88rem", color: "#4B6B55" }}>
              Your Pinterest boards are synced and ready for scheduling.
            </div>
          </div>
        </div>
      )}

      {/* Auto-publish notification banner */}
      {publishMessage && (
        <div
          style={{
            background: "#FBF4EA",
            border: "1px solid #E7D7C1",
            borderRadius: 12,
            padding: "12px 18px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.9rem",
            color: "#6A5343",
          }}
        >
          <span>{publishMessage}</span>
          <button
            type="button"
            onClick={() => setPublishMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8E7564" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Connection Status Card if disconnected */}
      {connected === false && (
        <div
          style={{
            background: "#FDF0F2",
            border: "1.5px solid #F3BAC2",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="craft-seal" style={{ width: 44, height: 44, fontSize: "1.3rem" }}>
              !
            </div>
            <div>
              <div style={{ fontWeight: 750, color: "#9D1C2F", fontSize: "1.05rem" }}>
                Pinterest Not Connected
              </div>
              <div style={{ fontSize: "0.88rem", color: "#7E1424" }}>
                Connect your Pinterest account to fetch boards, upload media, and auto-publish pins.
              </div>
            </div>
          </div>
          <a href="/api/auth/login" className="craft-btn-primary">
            Connect Pinterest Now →
          </a>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="craft-stats-grid">
        {/* Boards Count */}
        <Link href="/boards" style={{ textDecoration: "none" }}>
          <div className="craft-stat-box">
            <div className="craft-stat-head">
              <span className="craft-stat-label">Boards</span>
              <span style={{ fontSize: "1.2rem" }}>📌</span>
            </div>
            <div className="craft-stat-val">
              {loading ? "..." : boards.length}
            </div>
            <div className="craft-stat-desc">
              Active Pinterest boards
            </div>
          </div>
        </Link>

        {/* Queued Pins */}
        <Link href="/queue" style={{ textDecoration: "none" }}>
          <div className="craft-stat-box featured">
            <div className="craft-stat-head">
              <span className="craft-stat-label">Queued Pins</span>
              <span style={{ fontSize: "1.2rem" }}>⏳</span>
            </div>
            <div className="craft-stat-val" style={{ color: "#9D1C2F" }}>
              {loading ? "..." : queuedPins.length}
            </div>
            <div className="craft-stat-desc">
              Scheduled for future dates
            </div>
          </div>
        </Link>

        {/* Published Pins */}
        <Link href="/published" style={{ textDecoration: "none" }}>
          <div className="craft-stat-box">
            <div className="craft-stat-head">
              <span className="craft-stat-label">Published</span>
              <span style={{ fontSize: "1.2rem" }}>✓</span>
            </div>
            <div className="craft-stat-val" style={{ color: "#2E8B57" }}>
              {loading ? "..." : publishedPins.length}
            </div>
            <div className="craft-stat-desc">
              Delivered to Pinterest
            </div>
          </div>
        </Link>

        {/* Drafts Count */}
        <Link href="/drafts" style={{ textDecoration: "none" }}>
          <div className="craft-stat-box">
            <div className="craft-stat-head">
              <span className="craft-stat-label">Drafts</span>
              <span style={{ fontSize: "1.2rem" }}>📝</span>
            </div>
            <div className="craft-stat-val">
              {loading ? "..." : draftCount}
            </div>
            <div className="craft-stat-desc">
              Pins saved for later
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="craft-quick-actions">
        <span className="craft-quick-actions-label">Quick Actions:</span>
        <Link href="/compose" className="craft-btn-primary" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
          + New Pin
        </Link>
        <Link href="/bulk" className="craft-btn-secondary" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
          📦 Bulk Upload
        </Link>
        <Link href="/queue" className="craft-btn-outline" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
          📅 View Calendar
        </Link>
        <Link href="/settings/schedule" className="craft-btn-outline" style={{ padding: "8px 18px", fontSize: "0.88rem" }}>
          ⚙ Schedule Slots
        </Link>
      </div>

      {/* Next Upcoming Pins Section */}
      <div className="craft-card">
        <div className="craft-card-header">
          <div>
            <h3 className="craft-card-title">Next Upcoming Pins</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "#8E7564" }}>
              Pins next in line to be published according to your schedule.
            </p>
          </div>
          <Link href="/queue" className="craft-btn-outline craft-btn-sm">
            View All in Queue →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 32, textAlign: "center", color: "#8E7564" }}>
            Loading upcoming pins...
          </div>
        ) : upcomingPins.length === 0 ? (
          <div
            style={{
              padding: "48px 20px",
              textAlign: "center",
              background: "#FAF5EC",
              borderRadius: 14,
              border: "1px dashed #E7D7C1",
            }}
          >
            <div style={{ fontSize: "2.2rem", marginBottom: 10 }}>🌿</div>
            <h4 style={{ margin: "0 0 6px", fontSize: "1.1rem" }}>Your queue is currently quiet</h4>
            <p style={{ color: "#6A5343", fontSize: "0.9rem", maxWidth: 440, margin: "0 auto 20px" }}>
              No pins are queued for upcoming publishing. Create a new pin or bulk-upload product shots to fill your slots.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/compose" className="craft-btn-primary craft-btn-sm">
                Create a Pin
              </Link>
              <Link href="/bulk" className="craft-btn-secondary craft-btn-sm">
                Bulk Upload
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcomingPins.map((pin) => (
              <div key={pin.id} className="queue-pin-item">
                {pin.image_url ? (
                  <img src={pin.image_url} alt={pin.title} className="queue-pin-thumb" />
                ) : (
                  <div
                    className="queue-pin-thumb"
                    style={{ display: "grid", placeItems: "center", fontSize: "1.3rem", color: "#C27438" }}
                  >
                    📌
                  </div>
                )}
                <div className="queue-pin-info">
                  <div className="queue-pin-title">{pin.title}</div>
                  <div className="queue-pin-meta">
                    <span>
                      📅 {new Date(pin.scheduled_at).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {pin.board_name && (
                      <span>📁 {pin.board_name}</span>
                    )}
                    <span className="craft-pill craft-pill-queued">Queued</span>
                  </div>
                </div>
                <div className="queue-pin-actions">
                  <Link
                    href={`/queue`}
                    className="craft-btn-outline craft-btn-sm"
                  >
                    Manage in Queue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { AutomationDiagnostics } from "../../lib/automation";

export default function PublishingAutomationPage() {
  const [diag, setDiag] = useState<AutomationDiagnostics | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [cronOutput, setCronOutput] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function loadDiagnostics() {
    setLoading(true);
    try {
      const res = await fetch("/api/automation");
      const json = await res.json();
      if (res.ok) {
        setDiag(json.diagnostics);
      }
    } catch {}
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDiagnostics();
  }, []);

  async function handleTriggerCron() {
    setTriggeringCron(true);
    setCronOutput("Executing /api/publish-due background cron...");
    try {
      const res = await fetch("/api/publish-due", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setCronOutput(`✓ Completed: ${json.published} pin(s) published. Execution details: ${JSON.stringify(json.results)}`);
        loadDiagnostics();
      } else {
        setCronOutput(`Cron execution failed: ${json.error || "Unknown error"}`);
      }
    } catch (e) {
      setCronOutput(`Network error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setTriggeringCron(false);
    }
  }

  async function handleRetry(id: string) {
    setRetryingId(id);
    setStatusMsg("Retrying pin publish via Pinterest API...");
    try {
      const res = await fetch("/api/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusMsg(`✓ Pin successfully published to Pinterest! ID: ${json.pinId}`);
        loadDiagnostics();
      } else {
        setStatusMsg(`Retry failed: ${json.error || "Pinterest rejected pin"}`);
      }
    } catch (e) {
      setStatusMsg(`Error: ${e instanceof Error ? e.message : "Failed to retry"}`);
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <AppShell
      active="automation"
      title="Publishing Automation"
      subtitle="Authorized Pinterest connection health, automated publishing queue, and failed-post alert center."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={handleTriggerCron}
            disabled={triggeringCron}
            className="craft-btn-primary"
            style={{ fontSize: "0.88rem" }}
          >
            {triggeringCron ? "Running..." : "⚡ Trigger /api/publish-due"}
          </button>
        </div>
      }
    >
      {/* Alert Notice */}
      {statusMsg && (
        <div
          style={{
            background: statusMsg.startsWith("✓") ? "#EEF5F0" : "#FDF0F2",
            border: `1px solid ${statusMsg.startsWith("✓") ? "#C7E0CF" : "#F3BAC2"}`,
            color: statusMsg.startsWith("✓") ? "#245735" : "#9D1C2F",
            padding: "12px 18px",
            borderRadius: 12,
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{statusMsg}</span>
          <button type="button" onClick={() => setStatusMsg(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
            ✕
          </button>
        </div>
      )}

      {/* Cron Output Log Banner */}
      {cronOutput && (
        <div
          style={{
            background: "#FAF4EB",
            border: "1px solid #E7D7C1",
            borderRadius: 12,
            padding: "14px 18px",
            marginBottom: 24,
            fontSize: "0.88rem",
            color: "#6A5343",
            fontFamily: "monospace",
          }}
        >
          {cronOutput}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Checking Pinterest OAuth tokens and queue diagnostics...
        </div>
      ) : diag ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Top 3 Diagnostic Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {/* Pinterest Connection Status */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <span className="craft-stat-label">Authorized Connection</span>
                <span className={`craft-pill craft-pill-${diag.connected ? "published" : "failed"}`}>
                  {diag.connected ? "Active" : "Disconnected"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0" }}>
                <span className={`status-dot ${diag.connected ? "connected" : "disconnected"}`} style={{ width: 12, height: 12 }} />
                <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {diag.connected ? "Pinterest API v5 Connected" : "Connection Required"}
                </span>
              </div>
              <p style={{ margin: "0 0 14px", fontSize: "0.86rem", color: "#6A5343" }}>
                {diag.connected
                  ? "OAuth access token is verified with boards:read, boards:write, pins:read, pins:write scopes."
                  : "Connect your Pinterest account to enable automated publishing."}
              </p>
              <a href="/api/auth/login" className="craft-btn-outline craft-btn-sm" style={{ width: "fit-content" }}>
                {diag.connected ? "Reconnect / Refresh OAuth" : "Connect Pinterest Now →"}
              </a>
            </div>

            {/* Queue Engine Health */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <span className="craft-stat-label">Queue Health</span>
                <span className="craft-pill craft-pill-neutral">
                  {diag.databaseProvider === "supabase_cloud" ? "Supabase Cloud" : diag.databaseProvider === "vercel_kv" ? "Vercel KV" : "Store Layer"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 16, margin: "14px 0" }}>
                <div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#9D1C2F", fontFamily: "Georgia, serif" }}>
                    {diag.queueStats.queued}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8E7564", textTransform: "uppercase" }}>Queued</div>
                </div>
                <div style={{ borderLeft: "1px solid #E7D7C1", paddingLeft: 16 }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#2E8B57", fontFamily: "Georgia, serif" }}>
                    {diag.queueStats.published}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8E7564", textTransform: "uppercase" }}>Published</div>
                </div>
                <div style={{ borderLeft: "1px solid #E7D7C1", paddingLeft: 16 }}>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: diag.queueStats.failed > 0 ? "#9D1C2F" : "#8E7564", fontFamily: "Georgia, serif" }}>
                    {diag.queueStats.failed}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8E7564", textTransform: "uppercase" }}>Failed</div>
                </div>
              </div>
              <div style={{ fontSize: "0.82rem", color: "#6A5343" }}>
                Target database: <strong>Supabase free tier Postgres</strong> ready.
              </div>
            </div>

            {/* Cron Automation Details */}
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <span className="craft-stat-label">Cron Automation</span>
                <span className="craft-pill craft-pill-published">Vercel Cron</span>
              </div>
              <div style={{ margin: "10px 0" }}>
                <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#2D2118", marginBottom: 4 }}>
                  {diag.cronConfig.schedule}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#8E7564" }}>
                  Endpoint: <code>{diag.cronConfig.path}</code>
                </div>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "0.84rem", color: "#6A5343" }}>
                Vercel Hobby plan executes the daily cron automatically as configured in <code>vercel.json</code>.
              </p>
              <button
                type="button"
                onClick={handleTriggerCron}
                disabled={triggeringCron}
                className="craft-btn-secondary craft-btn-sm"
              >
                {triggeringCron ? "Testing..." : "Test Cron Endpoint Now"}
              </button>
            </div>
          </div>

          {/* Failed-Post Alert Center */}
          <div className="craft-card">
            <div className="craft-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>🚨</span>
                <h3 className="craft-card-title">Failed-Post Alert Center</h3>
              </div>
              <span className={`craft-pill craft-pill-${diag.failedItems.length > 0 ? "failed" : "published"}`}>
                {diag.failedItems.length} {diag.failedItems.length === 1 ? "Error" : "Errors"}
              </span>
            </div>

            {diag.failedItems.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", background: "#EEF5F0", borderRadius: 14, border: "1px solid #C7E0CF" }}>
                <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>✓</div>
                <h4 style={{ margin: "0 0 4px", color: "#245735" }}>All Systems Clear — Zero Publishing Errors</h4>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "#4B6B55" }}>
                  Every pin scheduled for delivery has published smoothly. Any API rejections or rate limits will be captured here with instant retry actions.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {diag.failedItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "#FDF0F2",
                      border: "1.5px solid #F3BAC2",
                      borderRadius: 14,
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ fontWeight: 750, color: "#9D1C2F", fontSize: "1rem", marginBottom: 4 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "#7E1424", marginBottom: 4 }}>
                        <strong>Reason:</strong> {item.error || "Pinterest API media processing timeout or board not found."}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#8E7564" }}>
                        Board: {item.board_name || item.board_id} • Scheduled: {new Date(item.scheduled_at).toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        type="button"
                        disabled={retryingId === item.id}
                        onClick={() => handleRetry(item.id)}
                        className="craft-btn-primary craft-btn-sm"
                      >
                        {retryingId === item.id ? "Retrying..." : "↻ Retry Publishing Now"}
                      </button>
                      <Link
                        href={`/compose?title=${encodeURIComponent(item.title)}&tags=${encodeURIComponent(item.tags.join(", "))}`}
                        className="craft-btn-outline craft-btn-sm"
                      >
                        Edit in Composer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}

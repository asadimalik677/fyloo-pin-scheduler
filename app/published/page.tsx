"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface PublishedItem {
  id: string;
  media_id: string;
  board_id: string;
  board_name?: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  scheduled_at: string;
  status: "published" | "queued" | "failed";
  pin_id?: string;
  created_at: string;
  image_url?: string;
}

export default function PublishedHistoryPage() {
  const [items, setItems] = useState<PublishedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/queue")
      .then((r) => r.json())
      .then((j) => {
        const allItems: PublishedItem[] = j.items ?? [];
        const pubOnly = allItems.filter((i) => i.status === "published");
        // Sort descending by scheduled/published date
        pubOnly.sort(
          (a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime()
        );
        setItems(pubOnly);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      (i.board_name && i.board_name.toLowerCase().includes(q)) ||
      (i.pin_id && i.pin_id.includes(q))
    );
  });

  return (
    <AppShell
      active="published"
      title="Published History"
      subtitle="Complete archive of pins successfully delivered to your Pinterest boards."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/compose" className="craft-btn-primary">
            + Create New Pin
          </Link>
        </div>
      }
    >
      {/* Top Filter & Count Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="craft-pill craft-pill-published">
            ✓ {items.length} {items.length === 1 ? "Pin Published" : "Pins Published"}
          </span>
        </div>

        <div style={{ maxWidth: 280, width: "100%" }}>
          <input
            type="search"
            placeholder="Search by title, board, ID..."
            className="craft-input"
            style={{ padding: "8px 12px", fontSize: "0.88rem" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Loading published pin records...
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            padding: "54px 20px",
            textAlign: "center",
            background: "#FFFDF9",
            borderRadius: 18,
            border: "1px dashed #E7D7C1",
          }}
        >
          <div style={{ fontSize: "2.6rem", marginBottom: 12 }}>🌿</div>
          <h3 style={{ margin: "0 0 8px" }}>
            {searchQuery ? "No matching published pins" : "No Pins Published Yet"}
          </h3>
          <p style={{ color: "#6A5343", fontSize: "0.92rem", maxWidth: 460, margin: "0 auto 24px" }}>
            {searchQuery
              ? "Try searching for a different keyword or clear the search bar."
              : "When pins in your queue reach their scheduled publication time and are executed by /api/publish-due or published directly from the Composer, their live Pinterest links and timestamps will appear here."}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/compose" className="craft-btn-primary craft-btn-sm">
              Publish a Pin Now
            </Link>
            <Link href="/queue" className="craft-btn-outline craft-btn-sm">
              Check Scheduled Queue
            </Link>
          </div>
        </div>
      ) : (
        <div className="craft-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", margin: 0 }}>
              <thead>
                <tr style={{ background: "#FBF4EA", borderBottom: "1px solid #E7D7C1" }}>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6A5343", fontWeight: 750 }}>
                    Pin
                  </th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6A5343", fontWeight: 750 }}>
                    Board
                  </th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6A5343", fontWeight: 750 }}>
                    Published Date & Time
                  </th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6A5343", fontWeight: 750 }}>
                    Pinterest Pin ID & Link
                  </th>
                  <th style={{ padding: "14px 18px", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#6A5343", fontWeight: 750, textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const pubDate = new Date(item.scheduled_at);
                  const pinUrl = item.pin_id
                    ? `https://www.pinterest.com/pin/${item.pin_id}`
                    : null;

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid #F0E6D8", transition: "background 0.15s ease" }}
                    >
                      {/* Pin Info */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 46,
                                height: 46,
                                borderRadius: 8,
                                background: "#FAF4EB",
                                display: "grid",
                                placeItems: "center",
                                fontSize: "1.2rem",
                                flexShrink: 0,
                              }}
                            >
                              📌
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: "0.94rem", color: "#2D2118", marginBottom: 3 }}>
                              {item.title}
                            </div>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: "0.78rem", color: "#8E7564", display: "inline-block" }}
                              >
                                Destination: {item.link.replace(/^https?:\/\//, "").slice(0, 32)}...
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Board */}
                      <td style={{ padding: "14px 18px", fontSize: "0.9rem", color: "#6A5343" }}>
                        {item.board_name || (
                          <span style={{ color: "#8E7564" }}>Board {item.board_id.slice(0, 8)}...</span>
                        )}
                      </td>

                      {/* Publish Date */}
                      <td style={{ padding: "14px 18px", fontSize: "0.88rem", color: "#2D2118", whiteSpace: "nowrap" }}>
                        <div>{pubDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
                        <div style={{ fontSize: "0.78rem", color: "#8E7564" }}>
                          {pubDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Pin ID & Pinterest Link */}
                      <td style={{ padding: "14px 18px", fontSize: "0.88rem" }}>
                        {pinUrl ? (
                          <a
                            href={pinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="craft-btn-outline craft-btn-sm"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#245735", borderColor: "#C7E0CF" }}
                          >
                            <span>Live Pin #{item.pin_id}</span>
                            <span>↗</span>
                          </a>
                        ) : (
                          <span style={{ color: "#8E7564", fontSize: "0.84rem" }}>
                            {item.pin_id || "Direct Publish"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <Link
                          href={`/compose?boardId=${item.board_id}&boardName=${encodeURIComponent(
                            item.board_name || ""
                          )}`}
                          className="craft-btn-secondary craft-btn-sm"
                          title="Re-pin / Clone into Composer"
                        >
                          Clone to Composer
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}

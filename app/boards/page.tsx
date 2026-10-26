"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";

interface Board {
  id: string;
  name: string;
  description?: string;
  pin_count?: number;
}

interface BoardPin {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  media?: {
    images?: {
      "400x300"?: { url: string };
      "600x"?: { url: string };
      "1200x"?: { url: string };
      "originals"?: { url: string };
    };
  };
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create board form state
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // Selected board for viewing pins
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [boardPins, setBoardPins] = useState<BoardPin[]>([]);
  const [loadingPins, setLoadingPins] = useState(false);

  async function loadBoards() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/boards");
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to load boards");
      }
      setBoards(json.boards ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load boards");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoards();
  }, []);

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setCreating(true);
    setCreateMsg("Creating board...");
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBoardName, description: newBoardDesc }),
      });
      const json = await res.json();
      if (!res.ok) {
        setCreateMsg(`Error: ${json.error || "Failed to create board"}`);
        return;
      }
      setCreateMsg(`✓ Board "${json.board.name}" created successfully!`);
      setNewBoardName("");
      setNewBoardDesc("");
      loadBoards();
    } catch (e) {
      setCreateMsg(`Error: ${e instanceof Error ? e.message : "Failed to create board"}`);
    } finally {
      setCreating(false);
    }
  }

  async function viewBoardPins(board: Board) {
    setSelectedBoard(board);
    setLoadingPins(true);
    setBoardPins([]);
    try {
      const res = await fetch(`/api/boards/${board.id}/pins`);
      if (res.ok) {
        const json = await res.json();
        setBoardPins(json.pins ?? []);
      }
    } catch (e) {
      console.warn("Could not load board pins:", e);
    } finally {
      setLoadingPins(false);
    }
  }

  return (
    <AppShell
      active="boards"
      title="Pinterest Boards"
      subtitle="Organize, inspect, and pin directly to your Pinterest collections."
      actions={
        <a href="#create-board" className="craft-btn-primary">
          + Create Board
        </a>
      }
    >
      {/* Error / Not connected banner */}
      {error && (
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
          <div>
            <div style={{ fontWeight: 700, color: "#9D1C2F" }}>Connection Notice</div>
            <div style={{ fontSize: "0.9rem", color: "#7E1424" }}>
              {error}. Please ensure your Pinterest account is connected.
            </div>
          </div>
          <a href="/api/auth/login" className="craft-btn-primary craft-btn-sm">
            Connect Pinterest →
          </a>
        </div>
      )}

      {/* Boards Grid Section */}
      {loading ? (
        <div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>
          Loading boards from Pinterest...
        </div>
      ) : boards.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            textAlign: "center",
            background: "#FFFDF9",
            borderRadius: 16,
            border: "1px dashed #E7D7C1",
            marginBottom: 36,
          }}
        >
          <div style={{ fontSize: "2.4rem", marginBottom: 12 }}>📁</div>
          <h3 style={{ margin: "0 0 8px" }}>No Pinterest Boards Found</h3>
          <p style={{ color: "#6A5343", fontSize: "0.95rem", maxWidth: 440, margin: "0 auto 20px" }}>
            You haven't created any boards yet, or your Pinterest account is empty. Use the form below to create your first board.
          </p>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map((b) => {
            const letter = b.name.charAt(0).toUpperCase();
            return (
              <div key={b.id} className="board-craft-card">
                {/* Visual Cover Banner with Monogram */}
                <div
                  className="board-card-banner"
                  style={{ cursor: "pointer" }}
                  onClick={() => viewBoardPins(b)}
                  title="Click to view pins in this board"
                >
                  <span className="board-monogram">{letter}</span>
                  <span className="board-pin-count-badge">
                    {b.pin_count !== undefined ? `${b.pin_count} pins` : "Board"}
                  </span>
                </div>

                {/* Board Info */}
                <div className="board-card-body">
                  <h3
                    className="board-card-name"
                    style={{ cursor: "pointer" }}
                    onClick={() => viewBoardPins(b)}
                  >
                    {b.name}
                  </h3>
                  <p className="board-card-desc">
                    {b.description || "No description provided for this collection."}
                  </p>

                  {/* Actions */}
                  <div className="board-card-actions">
                    <Link
                      href={`/compose?boardId=${b.id}&boardName=${encodeURIComponent(b.name)}`}
                      className="craft-btn-primary craft-btn-sm"
                      style={{ flex: 1, textAlign: "center" }}
                    >
                      Pin to this board
                    </Link>
                    <button
                      type="button"
                      onClick={() => viewBoardPins(b)}
                      className="craft-btn-outline craft-btn-sm"
                      title="Inspect pins on this board"
                    >
                      View Pins
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Drawer for Viewing Board Pins */}
      {selectedBoard && (
        <div
          className="craft-modal-backdrop"
          onClick={() => setSelectedBoard(null)}
        >
          <div
            className="craft-modal-card"
            style={{ maxWidth: 700 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #E7D7C1",
                paddingBottom: 14,
                marginBottom: 18,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.35rem" }}>
                  Pins in "{selectedBoard.name}"
                </h3>
                <span style={{ fontSize: "0.82rem", color: "#8E7564" }}>
                  {selectedBoard.pin_count !== undefined ? `${selectedBoard.pin_count} pins listed` : "Board collection"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Link
                  href={`/compose?boardId=${selectedBoard.id}&boardName=${encodeURIComponent(selectedBoard.name)}`}
                  className="craft-btn-primary craft-btn-sm"
                >
                  + Pin Here
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedBoard(null)}
                  className="craft-btn-outline craft-btn-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {loadingPins ? (
              <div style={{ padding: 40, textAlign: "center", color: "#8E7564" }}>
                Loading pins from Pinterest...
              </div>
            ) : boardPins.length === 0 ? (
              <div
                style={{
                  padding: 36,
                  textAlign: "center",
                  background: "#FAF5EC",
                  borderRadius: 14,
                  border: "1px dashed #E7D7C1",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📌</div>
                <h4 style={{ margin: "0 0 6px" }}>No pins loaded yet</h4>
                <p style={{ color: "#6A5343", fontSize: "0.88rem", maxWidth: 380, margin: "0 auto 16px" }}>
                  This board either has no pins yet or Pinterest standard access limits reading third-party pins.
                </p>
                <Link
                  href={`/compose?boardId=${selectedBoard.id}&boardName=${encodeURIComponent(selectedBoard.name)}`}
                  className="craft-btn-primary craft-btn-sm"
                >
                  Create the first pin for this board →
                </Link>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: 16,
                  maxHeight: 460,
                  overflowY: "auto",
                  padding: 4,
                }}
              >
                {boardPins.map((pin) => {
                  const imgUrl =
                    pin.media?.images?.["400x300"]?.url ||
                    pin.media?.images?.["600x"]?.url ||
                    pin.media?.images?.originals?.url;
                  return (
                    <div
                      key={pin.id}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E7D7C1",
                        borderRadius: 12,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={pin.title || "Pin"}
                          style={{ width: "100%", height: 140, objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: 120,
                            background: "#FAF4EB",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "1.5rem",
                          }}
                        >
                          📌
                        </div>
                      )}
                      <div style={{ padding: 10, flex: 1, display: "flex", flexDirection: "column" }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            marginBottom: 4,
                            lineHeight: 1.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pin.title || "Untitled Pin"}
                        </div>
                        {pin.link && (
                          <a
                            href={pin.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: "0.75rem",
                              color: "#8E7564",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              marginTop: "auto",
                            }}
                          >
                            ↗ {pin.link.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Board Form Card */}
      <div id="create-board" className="craft-card" style={{ maxWidth: 640 }}>
        <div className="craft-card-header">
          <div>
            <h3 className="craft-card-title">Create a New Board</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.86rem", color: "#8E7564" }}>
              Add a new collection to your Pinterest profile instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateBoard}>
          <div className="craft-form-group">
            <label htmlFor="board-name" className="craft-label">
              Board Name <span style={{ color: "#9D1C2F" }}>*</span>
            </label>
            <input
              id="board-name"
              type="text"
              className="craft-input"
              placeholder="e.g. Handmade Ceramic Mugs"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              required
            />
          </div>

          <div className="craft-form-group">
            <label htmlFor="board-desc" className="craft-label">
              Description (Optional)
            </label>
            <textarea
              id="board-desc"
              className="craft-textarea"
              placeholder="Describe what kind of crafts, products, or inspiration will live on this board..."
              value={newBoardDesc}
              onChange={(e) => setNewBoardDesc(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              type="submit"
              disabled={creating || !newBoardName.trim()}
              className="craft-btn-primary"
            >
              {creating ? "Creating Board..." : "Create Board"}
            </button>
            {createMsg && (
              <span
                style={{
                  fontSize: "0.88rem",
                  color: createMsg.startsWith("✓") ? "#245735" : "#9D1C2F",
                  fontWeight: 600,
                }}
              >
                {createMsg}
              </span>
            )}
          </div>
        </form>
      </div>
    </AppShell>
  );
}

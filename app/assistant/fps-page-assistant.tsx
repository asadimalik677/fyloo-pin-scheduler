"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { AssistantContext } from "../../lib/assistant";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export default function AssistantPage() {
  const [context, setContext] = useState<AssistantContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "🌿 Hello! I am your Fyloo Studio Assistant. I have live access to your Pinterest boards, queued pins, drafts, and keyword research. Ask me anything about what to schedule next, how to optimize your descriptions, or how to grow your shop reach!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/assistant")
      .then((r) => r.json())
      .then((j) => setContext(j.context ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(qToSend: string = inputQuestion) {
    const q = qToSend.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion("");
    setLoading(true);

    try {
      const userApiKey = (() => {
        try {
          return localStorage.getItem("fyloo_gemini_key") || "";
        } catch {
          return "";
        }
      })();
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, userApiKey }),
      });
      const json = await res.json();
      if (res.ok) {
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          sender: "assistant",
          text: json.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        if (json.context) setContext(json.context);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "assistant",
            text: json.error || "Assistant failed. Please try again.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "I encountered an error retrieving your workspace data. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const suggestedPrompts = [
    "What should I pin next for my shop?",
    "How is my queue looking right now?",
    "Give me 3 high-converting pin titles for ceramics",
    "How can I increase outbound clicks to my website?",
  ];

  return (
    <AppShell
      active="assistant"
      title="Studio AI Assistant"
      subtitle="Context-aware guidance answered directly from your saved research, boards, and queued pins."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/compose" className="craft-btn-primary craft-btn-sm">
            + Open Composer
          </Link>
        </div>
      }
    >
      {/* Contextual Reference Pills Bar */}
      {context && (
        <div
          style={{
            background: "#FFFDF9",
            border: "1px solid #E7D7C1",
            borderRadius: 14,
            padding: "12px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            boxShadow: "0 2px 8px rgba(78, 44, 22, 0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", color: "#6A5343", fontWeight: 650 }}>
            <span>🧠 Active Workspace Context:</span>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="craft-pill craft-pill-neutral">
              📌 {context.boardsCount} Boards Synced
            </span>
            <span className="craft-pill craft-pill-queued">
              ⏳ {context.queuedCount} Pins in Queue
            </span>
            <span className="craft-pill craft-pill-neutral">
              🔍 {context.savedKeywords.length} Keywords Tracked
            </span>
            <span className="craft-pill craft-pill-published">
              ✓ {context.publishedCount} Published
            </span>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div
        className="craft-card"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "640px",
          padding: 0,
          overflow: "hidden",
        }}
      >
        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            background: "#FAF4EB",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: m.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "80%",
                  background: m.sender === "user" ? "#9D1C2F" : "#FFFFFF",
                  color: m.sender === "user" ? "#FFFFFF" : "#2D2118",
                  border: m.sender === "user" ? "1px solid #7E1424" : "1.5px solid #E7D7C1",
                  borderRadius: 18,
                  padding: "16px 20px",
                  boxShadow: "0 4px 14px rgba(78, 44, 22, 0.05)",
                  lineHeight: 1.55,
                  fontSize: "0.94rem",
                  whiteSpace: "pre-line",
                }}
              >
                {m.text}
              </div>
              <span style={{ fontSize: "0.72rem", color: "#8E7564", marginTop: 4, padding: "0 6px" }}>
                {m.sender === "user" ? "You" : "Fyloo Assistant"} • {m.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8E7564", fontSize: "0.88rem" }}>
              <div className="craft-seal-mini" style={{ width: 24, height: 24, fontSize: "0.85rem" }}>F</div>
              <span>Analyzing workspace context & formulating answer...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div
          style={{
            padding: "12px 20px",
            background: "#FFFDF9",
            borderTop: "1px solid #E7D7C1",
            display: "flex",
            gap: 8,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              style={{
                background: "#FAF4EB",
                border: "1px solid #E7D7C1",
                borderRadius: 9999,
                padding: "5px 14px",
                fontSize: "0.8rem",
                color: "#6A5343",
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div style={{ padding: "16px 20px", background: "#FFFFFF", borderTop: "1px solid #E7D7C1" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{ display: "flex", gap: 10 }}
          >
            <input
              type="text"
              className="craft-input"
              style={{ flex: 1, fontSize: "0.95rem" }}
              placeholder="Ask anything about your pins, schedule, keywords, or strategy..."
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="craft-btn-primary"
              style={{ padding: "10px 24px" }}
            >
              Send →
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

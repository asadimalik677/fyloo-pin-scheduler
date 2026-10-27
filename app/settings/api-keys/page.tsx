"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../../components/AppShell";

const STORAGE_KEY = "fyloo_gemini_key";

export default function ApiKeysSettingsPage() {
  const [keyInput, setKeyInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSaved(true);
        setKeyInput(stored);
      }
    } catch {}
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const value = keyInput.trim();
    if (!value) {
      setMessage("Paste a key first.");
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, value);
      setSaved(true);
      setMessage("Key saved in this browser. AI features will now use your key.");
    } catch {
      setMessage("Could not save the key in this browser.");
    }
  }

  function handleClear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setKeyInput("");
    setSaved(false);
    setMessage("Key removed. AI features will fall back to the shared server key, if one is set.");
  }

  return (
    <AppShell
      active="api-keys"
      title="API Keys"
      subtitle="Use your own Gemini API key for all AI features. Your key stays in your browser and is sent with AI requests only."
    >
      <div className="craft-card" style={{ maxWidth: 640 }}>
        <div className="craft-card-header">
          <h3 style={{ margin: 0 }}>Gemini API Key</h3>
          <span
            className={`craft-pill ${saved ? "craft-pill-published" : "craft-pill-queued"}`}
          >
            {saved ? "Key saved" : "No key saved"}
          </span>
        </div>

        <p style={{ fontSize: "0.9rem", color: "#6A5343", lineHeight: 1.6 }}>
          AI Pin Creator, AI Assistant, and SEO Auditor suggestions run on
          Google Gemini. Get a free key from Google AI Studio, paste it here,
          and every AI feature will use it. Your key is stored only in this
          browser, never on the server. If no key is saved here, the tool uses
          the shared server key when the site owner has set one.
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Paste your Gemini API key"
            className="craft-input"
            style={{ width: "100%" }}
            autoComplete="off"
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="submit" className="craft-btn-primary">
              Save key
            </button>
            <button type="button" className="craft-btn-secondary" onClick={handleClear}>
              Remove key
            </button>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              className="craft-btn-secondary"
            >
              Get a free key
            </a>
          </div>
        </form>

        {message && (
          <p style={{ marginTop: 14, fontSize: "0.88rem", color: "#6A5343" }}>{message}</p>
        )}

        <p style={{ marginTop: 16, fontSize: "0.85rem", color: "#8E7564" }}>
          Tip: keep your key private. Anyone with the key can use your Gemini quota.
          Back to <Link href="/ai-creator">AI Pin Creator</Link>.
        </p>
      </div>
    </AppShell>
  );
}

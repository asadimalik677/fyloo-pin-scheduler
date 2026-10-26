"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/user-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        router.push(redirectTarget);
        router.refresh();
      } else {
        setErrorMsg(json.error || "Login failed. Please check your credentials.");
      }
    } catch (e) {
      setErrorMsg(`Network error: ${e instanceof Error ? e.message : "Failed to log in"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        background: "#FFFDF9",
        border: "1.5px solid #E7D7C1",
        borderRadius: 24,
        padding: "44px 36px",
        maxWidth: 440,
        width: "100%",
        boxShadow: "0 16px 40px rgba(78, 44, 22, 0.08)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div className="craft-seal" style={{ width: 54, height: 54, fontSize: "1.8rem" }}>
            F
          </div>
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "1.85rem", margin: "0 0 6px", color: "#2D2118" }}>
          Log In to Fyloo Studio
        </h1>
        <p style={{ margin: 0, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#C27438", fontWeight: 800 }}>
          Supabase Free Tier Auth
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            background: "#FDF0F2",
            border: "1px solid #F3BAC2",
            color: "#9D1C2F",
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: "0.88rem",
            marginBottom: 20,
          }}
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="craft-form-group">
          <label className="craft-label">Email Address</label>
          <input
            type="email"
            className="craft-input"
            placeholder="maker@fyloo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="craft-form-group">
          <label className="craft-label">Password</label>
          <input
            type="password"
            className="craft-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="craft-btn-primary"
          style={{ width: "100%", padding: "13px 20px", fontSize: "1rem", marginTop: 8 }}
        >
          {loading ? "Authenticating..." : "Log In to Dashboard →"}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.9rem", color: "#6A5343" }}>
        Don't have an account?{" "}
        <Link href="/signup" style={{ fontWeight: 700, color: "#9D1C2F" }}>
          Sign up for free
        </Link>
      </div>

      <div
        style={{
          marginTop: 24,
          paddingTop: 18,
          borderTop: "1px solid #F0E6D8",
          fontSize: "0.78rem",
          color: "#8E7564",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        🔒 Single-user maker security powered by <strong>Supabase Auth Free Tier</strong>.
        Pinterest OAuth connects separately inside your dashboard.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicHeader />
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "48px 20px",
          background: "radial-gradient(circle at 50% 20%, #FAF2E6 0%, #F6ECE0 100%)",
        }}
      >
        <Suspense fallback={<div style={{ padding: 48, textAlign: "center", color: "#8E7564" }}>Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

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

  // Forgot password mode state
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

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

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setErrorMsg(null);
    setForgotSuccess(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setForgotSuccess(json.message || "Reset link sent! Please check your email.");
      } else {
        setErrorMsg(json.error || "Could not process password reset.");
      }
    } catch (e) {
      setErrorMsg("Failed to request password reset.");
    } finally {
      setForgotLoading(false);
    }
  }

  function handlePrefillDemo() {
    setEmail("demo@fyloo.com");
    setPassword("fyloo123");
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: 14,
        padding: "36px 32px",
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <div className="craft-seal" style={{ width: 44, height: 44, fontSize: "1.2rem" }}>
            F
          </div>
        </div>
        <h1 style={{ fontSize: "1.5rem", margin: "0 0 4px", color: "#0F172A", fontWeight: 700 }}>
          {forgotMode ? "Reset your password" : "Sign in to Fyloo Studio"}
        </h1>
        <p style={{ margin: 0, fontSize: "0.86rem", color: "#64748B" }}>
          {forgotMode
            ? "Enter your email to receive recovery instructions"
            : "Modern automated Pinterest scheduling studio"}
        </p>
      </div>

      {errorMsg && (
        <div
          style={{
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: "0.84rem",
            marginBottom: 16,
          }}
        >
          {errorMsg}
        </div>
      )}

      {forgotSuccess && (
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            padding: "12px 14px",
            borderRadius: 8,
            fontSize: "0.84rem",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>✓ Reset Request Received</div>
          <div>{forgotSuccess}</div>
          <div style={{ marginTop: 8 }}>
            <Link
              href={`/reset-password?email=${encodeURIComponent(forgotEmail)}`}
              style={{ color: "#166534", fontWeight: 700, textDecoration: "underline" }}
            >
              Go to Set New Password page →
            </Link>
          </div>
        </div>
      )}

      {!forgotMode ? (
        <>
          {/* 1. Continue with Google Button */}
          <a
            href="/api/auth/google"
            className="craft-btn-outline"
            style={{
              width: "100%",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              fontSize: "0.92rem",
              marginBottom: 16,
              color: "#0F172A",
              border: "1px solid #CBD5E1",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </a>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "14px 0 16px",
              color: "#94A3B8",
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
            <span>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
          </div>

          <form onSubmit={handleLogin}>
            <div className="craft-form-group">
              <label className="craft-label">Email address</label>
              <input
                type="email"
                className="craft-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="craft-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label className="craft-label" style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setForgotEmail(email);
                    setErrorMsg(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "0.78rem",
                    color: "#2563EB",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Forgot password?
                </button>
              </div>
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
              style={{ width: "100%", padding: "10px 18px", fontSize: "0.94rem", marginTop: 4 }}
            >
              {loading ? "Authenticating..." : "Sign in to Dashboard →"}
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div style={{ marginTop: 14, textAlign: "center" }}>
            <button
              type="button"
              onClick={handlePrefillDemo}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.78rem",
                color: "#64748B",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Prefill demo credentials (demo@fyloo.com)
            </button>
          </div>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: "0.86rem", color: "#64748B" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ fontWeight: 600, color: "#2563EB" }}>
              Sign up for free
            </Link>
          </div>
        </>
      ) : (
        /* Forgot Password Form */
        <form onSubmit={handleForgotPassword}>
          <div className="craft-form-group">
            <label className="craft-label">Your account email</label>
            <input
              type="email"
              className="craft-input"
              placeholder="you@domain.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={forgotLoading}
            className="craft-btn-primary"
            style={{ width: "100%", padding: "10px 18px", fontSize: "0.94rem", marginTop: 4 }}
          >
            {forgotLoading ? "Sending reset email..." : "Send Reset Link"}
          </button>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setErrorMsg(null);
                setForgotSuccess(null);
              }}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.84rem",
                color: "#64748B",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ← Back to sign in
            </button>
          </div>
        </form>
      )}

      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: "1px solid #F1F5F9",
          fontSize: "0.76rem",
          color: "#94A3B8",
          textAlign: "center",
          lineHeight: 1.45,
        }}
      >
        🔒 Supabase Auth free tier. Official Pinterest account connects inside the Studio.
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
      <PublicHeader />
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "48px 16px",
        }}
      >
        <Suspense fallback={<div style={{ padding: 48, textAlign: "center", color: "#94A3B8" }}>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

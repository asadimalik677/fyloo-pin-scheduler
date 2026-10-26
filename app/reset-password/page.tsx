"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";

export const dynamic = "force-dynamic";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setSuccessMsg("Password reset successfully! Redirecting to your dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1200);
      } else {
        setErrorMsg(json.error || "Failed to update password. Please try again.");
      }
    } catch (e) {
      setErrorMsg(`Network error: ${e instanceof Error ? e.message : "Failed to reset password"}`);
    } finally {
      setLoading(false);
    }
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
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <div className="craft-seal" style={{ width: 44, height: 44, fontSize: "1.2rem" }}>
            F
          </div>
        </div>
        <h1 style={{ fontSize: "1.45rem", margin: "0 0 4px", color: "#0F172A", fontWeight: 700 }}>
          Set New Password
        </h1>
        <p style={{ margin: 0, fontSize: "0.86rem", color: "#64748B" }}>
          Choose a secure password for your Fyloo account
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

      {successMsg && (
        <div
          style={{
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            color: "#166534",
            padding: "10px 14px",
            borderRadius: 8,
            fontSize: "0.84rem",
            marginBottom: 16,
          }}
        >
          {successMsg}
        </div>
      )}

      <form onSubmit={handleReset}>
        <div className="craft-form-group">
          <label className="craft-label">Account Email</label>
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
          <label className="craft-label">New Password</label>
          <input
            type="password"
            className="craft-input"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="craft-form-group">
          <label className="craft-label">Confirm New Password</label>
          <input
            type="password"
            className="craft-input"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="craft-btn-primary"
          style={{ width: "100%", padding: "10px 18px", fontSize: "0.94rem", marginTop: 4 }}
        >
          {loading ? "Updating..." : "Update Password & Go to Dashboard →"}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center", fontSize: "0.86rem", color: "#64748B" }}>
        Remember your password?{" "}
        <Link href="/login" style={{ fontWeight: 600, color: "#2563EB" }}>
          Back to log in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
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
          <ResetPasswordForm />
        </Suspense>
      </main>
      <PublicFooter />
    </div>
  );
}

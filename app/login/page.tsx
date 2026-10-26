import Link from "next/link";
import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import { isConnected } from "../../lib/token";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const connected = await isConnected();

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
        <div
          style={{
            background: "#FFFDF9",
            border: "1.5px solid #E7D7C1",
            borderRadius: 24,
            padding: "44px 36px",
            maxWidth: 460,
            width: "100%",
            boxShadow: "0 16px 40px rgba(78, 44, 22, 0.08)",
            textAlign: "center",
          }}
        >
          {/* Logo-style Wordmark & Craft Seal */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <div className="craft-seal" style={{ width: 60, height: 60, fontSize: "2rem" }}>
              F
            </div>
          </div>

          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "1.9rem",
              marginBottom: 6,
              color: "#2D2118",
            }}
          >
            Fyloo Pin Scheduler
          </h1>

          <p
            style={{
              fontSize: "0.82rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#C27438",
              fontWeight: 800,
              marginBottom: 18,
            }}
          >
            Maker & Artisan Studio
          </p>

          <p
            style={{
              color: "#6A5343",
              fontSize: "0.98rem",
              lineHeight: 1.5,
              marginBottom: 28,
            }}
          >
            Seamlessly connect your Pinterest business account to publish and schedule pins on autopilot.
          </p>

          {/* Current Status Pill if connected */}
          {connected ? (
            <div
              style={{
                background: "#EEF5F0",
                border: "1px solid #C7E0CF",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 24,
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#245735", fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>
                <span className="status-dot connected" />
                <span>Pinterest Already Connected</span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "#4B6B55", margin: "0 0 12px" }}>
                Your Fyloo Pinterest token is currently active and ready to schedule.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link
                  href="/dashboard"
                  className="craft-btn-primary"
                  style={{ flex: 1, padding: "9px 14px", fontSize: "0.88rem" }}
                >
                  Enter Dashboard →
                </Link>
                <a
                  href="/api/auth/login"
                  className="craft-btn-outline"
                  style={{ padding: "9px 14px", fontSize: "0.88rem" }}
                >
                  Reconnect
                </a>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 28 }}>
              {/* One big button 'Continue with Pinterest' */}
              <a
                href="/api/auth/login"
                className="craft-btn-primary"
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  fontSize: "1.08rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(157, 28, 47, 0.3)",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.364-.053.225-.179.271-.413.165-1.543-.719-2.508-2.977-2.508-4.793 0-3.902 2.836-7.487 8.18-7.487 4.296 0 7.635 3.062 7.635 7.154 0 4.268-2.69 7.705-6.425 7.705-1.255 0-2.435-.652-2.84-1.422l-.774 2.949c-.28 1.077-1.038 2.427-1.547 3.255C9.697 23.854 10.829 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
                </svg>
                Continue with Pinterest
              </a>
            </div>
          )}

          {/* Single-user tool note */}
          <div
            style={{
              paddingTop: 20,
              borderTop: "1px solid #F0E6D8",
              fontSize: "0.82rem",
              color: "#8E7564",
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: "0 0 6px", fontWeight: 600 }}>
              🌿 Shop Notice
            </p>
            <p style={{ margin: 0 }}>
              This is a single-user automated tool dedicated to the <strong>Fyloo</strong> shop.
              Sign-in uses official Pinterest OAuth v5 to safely authenticate boards and pin posting.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

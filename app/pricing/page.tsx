import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import PricingTable from "../../components/PricingTable";

export const metadata = {
  title: "Pricing Plans — Fyloo Pin Scheduler",
  description: "Simple, transparent pricing tiers for creators and growing online shops.",
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
      <PublicHeader />

      <main style={{ flex: 1 }}>
        <section className="pricing-hero">
          <div className="landing-eyebrow">SIMPLE & TRANSPARENT PRICING</div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: 12, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Predictable plans for growing your Pinterest reach
          </h1>
          <p style={{ color: "#64748B", fontSize: "1.05rem", maxWidth: 640, margin: "0 auto", lineHeight: 1.5 }}>
            Choose the ideal plan for your shop. Every plan includes official Pinterest API v5 integration, cloud queueing, and automated background dispatch.
          </p>
        </section>

        <PricingTable />

        {/* Notice regarding sample pricing */}
        <section style={{ maxWidth: 840, margin: "0 auto 60px", padding: "0 20px" }}>
          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ fontSize: "1.6rem" }}>ℹ️</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 2px", fontSize: "0.96rem", color: "#0F172A" }}>
                Sample Pricing Tiers
              </h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", lineHeight: 1.5 }}>
                The pricing figures shown are editable placeholders for demonstration. Currently deployed on free-tier cloud infrastructure with zero mandatory monthly charges.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

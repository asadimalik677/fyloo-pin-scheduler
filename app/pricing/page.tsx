import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";
import PricingTable from "../../components/PricingTable";

export const metadata = {
  title: "Pricing Plans — Fyloo Pin Scheduler",
  description: "Transparent sample pricing tiers for solo makers and growing artisan brands.",
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <PublicHeader />

      <main style={{ flex: 1 }}>
        <section className="pricing-hero">
          <div className="landing-eyebrow">Fair, Simple Investment</div>
          <h1 style={{ fontSize: "2.6rem", marginBottom: 16 }}>
            Plans Built for Your Creative Journey
          </h1>
          <p style={{ color: "#6A5343", fontSize: "1.15rem", maxWidth: 650, margin: "0 auto", lineHeight: 1.5 }}>
            Choose the plan that fits your posting rhythm. All plans include official Pinterest API v5 integration and automatic scheduling.
          </p>
        </section>

        <PricingTable />

        {/* Reassurance craft callout */}
        <section style={{ maxWidth: 840, margin: "0 auto 60px", padding: "0 24px" }}>
          <div
            style={{
              background: "#FFFDF9",
              border: "1px dashed #E7D7C1",
              borderRadius: 16,
              padding: "24px 28px",
              display: "flex",
              alignItems: "center",
              gap: 20,
              boxShadow: "0 4px 16px rgba(78, 44, 22, 0.04)",
            }}
          >
            <div style={{ fontSize: "2rem" }}>💡</div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>
                Notice Regarding Sample Pricing
              </h4>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "#6A5343", lineHeight: 1.5 }}>
                The prices shown above are editable placeholders for illustration. The Fyloo Pin Scheduler is currently deployed on your own infrastructure with zero recurring subscription fees.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

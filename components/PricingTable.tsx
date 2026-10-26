"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingTable() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "starter",
      name: "Starter",
      audience: "Ideal for emerging makers and solo shop owners getting started on Pinterest.",
      priceMonthly: "$12",
      priceYearly: "$10",
      isPopular: false,
      ctaText: "Choose Starter",
      features: [
        "60 pins scheduled per month",
        "Up to 5 synced Pinterest boards",
        "Composer with live pin preview",
        "Visual queue grouped by day",
        "Daily automated cron publishing",
        "Community & setup guides",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      audience: "Crafted for active creators & boutique brands posting daily content.",
      priceMonthly: "$24",
      priceYearly: "$19",
      isPopular: true,
      ctaText: "Get Started with Pro",
      features: [
        "Unlimited pins scheduled per month",
        "Unlimited Pinterest boards",
        "Bulk upload & multi-pin scheduler",
        "Interactive calendar & timeline views",
        "Custom daily posting time slots",
        "Hands-free auto-publishing",
        "Drafts workshop & published history",
        "Priority creator support",
      ],
    },
    {
      id: "business",
      name: "Business",
      audience: "Designed for high-volume catalogs, multiple collections & seasonal launches.",
      priceMonthly: "$48",
      priceYearly: "$39",
      isPopular: false,
      ctaText: "Select Business",
      features: [
        "Everything in Pro included",
        "Rapid batch processing & media prep",
        "Cross-board seasonal pin replication",
        "Real-time auto-publish health monitor",
        "Extended durable queue storage",
        "Dedicated maker concierge support",
      ],
    },
  ];

  return (
    <div>
      {/* Monthly / Yearly Toggle */}
      <div className="pricing-toggle-wrap">
        <button
          type="button"
          className={`pricing-toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly Billing
        </button>
        <button
          type="button"
          className={`pricing-toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly Billing <span style={{ fontSize: "0.75rem", background: "#EEF5F0", color: "#245735", padding: "2px 6px", borderRadius: 9999, marginLeft: 4 }}>Save 20%</span>
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="pricing-cards-grid">
        {plans.map((plan) => {
          const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
          return (
            <div
              key={plan.id}
              className={`pricing-card ${plan.isPopular ? "is-popular" : ""}`}
            >
              {plan.isPopular && (
                <div className="pricing-popular-ribbon">Most Popular</div>
              )}

              <h3 className="pricing-plan-title">{plan.name}</h3>
              <p className="pricing-plan-desc">{plan.audience}</p>

              <div className="pricing-price-wrap">
                <span className="pricing-price-val">{price}</span>
                <span className="pricing-price-unit">/ month</span>
              </div>

              <div className="pricing-sample-tag">
                Sample pricing • Editable placeholder
              </div>

              <ul className="pricing-features-list">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="pricing-feature-item">
                    <span className="pricing-check-icon">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={plan.isPopular ? "craft-btn-primary" : "craft-btn-outline"}
                style={{ textAlign: "center", width: "100%", padding: "12px 20px" }}
              >
                {plan.ctaText}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import PublicHeader from "../../components/PublicHeader";
import PublicFooter from "../../components/PublicFooter";

export const metadata = {
  title: "Privacy Policy - Fyloo Pin Scheduler",
  description: "How Fyloo Pin Scheduler handles your Pinterest, scheduling, and account data.",
};

const sections = [
  {
    heading: "1. What Fyloo Pin Scheduler is",
    text: "Fyloo Pin Scheduler is a Pinterest scheduling tool. It helps you create pins, organize boards, plan a posting schedule, and publish pins at the times you choose. This policy explains, in plain language, what information the tool handles and what it does not do with that information.",
  },
  {
    heading: "2. Data the tool handles",
    text: "The tool handles the account details you provide to sign in, the Pinterest connection you authorize, and the content you create in the tool. That content includes boards you select, pins you compose, drafts you save, and the queue of pins you schedule, including their titles, descriptions, links, images, and scheduled times.",
  },
  {
    heading: "3. Pinterest account connection",
    text: "You connect a Pinterest account through the official Pinterest OAuth flow. You choose what access to grant, and Pinterest issues the connection for that purpose. The tool uses that connection only to read the boards and account details needed for scheduling and to publish the pins you have queued. You can revoke the connection at any time in your Pinterest account settings, and revoking it stops further publishing from this tool.",
  },
  {
    heading: "4. Your optional Gemini API key",
    text: "If you choose to use AI features with your own Gemini API key, that key is optional. When you supply it, it is stored only in your own browser, in local storage, and it is not stored on our servers. You can remove it at any time by clearing it in the tool or clearing your browser storage, and the tool will no longer use it.",
  },
  {
    heading: "5. What we do not do",
    text: "We never sell your data. We never share your data with third parties except for the Pinterest and Gemini APIs needed to run the tool. Pinterest receives only the pin and scheduling information needed to publish your pins, and Gemini receives only the prompts and content needed for the AI feature you request. We do not use your pins, boards, or queue to advertise to you or to anyone else.",
  },
  {
    heading: "6. Cookies and local storage",
    text: "The tool uses cookies and browser local storage to keep you signed in, to remember your preferences and session, and to save drafts, queue items, and your optional Gemini API key on your own device. It does not use these tools to track you across other websites. You can clear cookies and local storage in your browser settings, although clearing them may sign you out or remove locally saved drafts and your stored API key.",
  },
  {
    heading: "7. Data deletion on request",
    text: "You can ask us to delete your account data at any time. When you make a request, we will delete the account, board, pin, draft, and queue data we hold for you, disconnect your Pinterest connection, and confirm once deletion is complete. Data stored only in your own browser is not held by us, so please also clear your browser storage if you want that local copy removed.",
  },
  {
    heading: "8. Changes and contact",
    text: "If this policy changes, the updated version will be posted on this page. If you have questions about this policy or want to request deletion of your data, contact us at privacy@fyloo-pin-scheduler.vercel.app.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
      <PublicHeader />
      <main style={{ flex: 1 }}>
        <section className="pricing-hero">
          <div className="landing-eyebrow">PRIVACY POLICY</div>
          <h1 style={{ fontSize: "2.4rem", marginBottom: 12, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "#64748B", fontSize: "1.05rem", maxWidth: 640, margin: "0 auto", lineHeight: 1.5 }}>
            Last updated: October 28, 2026. Plain-language rules for how Fyloo Pin Scheduler handles your data.
          </p>
        </section>
        <section style={{ maxWidth: 840, margin: "0 auto 60px", padding: "0 20px" }}>
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 24px", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}>
            {sections.map((section) => (
              <div key={section.heading} style={{ marginBottom: 24 }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem", color: "#0F172A" }}>{section.heading}</h2>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#475569", lineHeight: 1.6 }}>{section.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}

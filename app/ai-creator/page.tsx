"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "../../components/AppShell";
import { AIPinGenerationResult, GraphicTemplate, PIN_GRAPHIC_TEMPLATES } from "../../lib/ai-creator";

export default function AIPinCreatorPage() {
  const [productName, setProductName] = useState("Handmade Ceramic Matcha Mug");
  const [niche, setNiche] = useState("Ceramics & Pottery");
  const [tone, setTone] = useState("Artisan Warm & Mindful");
  const [keyword, setKeyword] = useState("ceramic matcha mug");
  const [shopLink, setShopLink] = useState("https://fyloo.com/products/matcha-mug");

  // Output state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIPinGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTitleIdx, setSelectedTitleIdx] = useState(0);
  const [selectedDescIdx, setSelectedDescIdx] = useState(0);

  // AI Pin Image state
  const [pinImage, setPinImage] = useState<string | null>(null);
  const [imageModel, setImageModel] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Pin Graphic Design state
  const [selectedTemplate, setSelectedTemplate] = useState<GraphicTemplate>(PIN_GRAPHIC_TEMPLATES[0]);
  const [graphicHeadline, setGraphicHeadline] = useState("Slow Crafted Ceramics");
  const [graphicSubline, setGraphicSubline] = useState("Wheel-thrown in small batches for everyday rituals");
  const [graphicPrice, setGraphicPrice] = useState("Handmade in Studio");

  async function handleGenerate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userApiKey = (() => {
        try {
          return localStorage.getItem("fyloo_gemini_key") || "";
        } catch {
          return "";
        }
      })();
      const res = await fetch("/api/ai-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, niche, tone, keyword, shopLink, userApiKey }),
      });
      const json = await res.json();
      if (res.ok) {
        setResult(json.result);
        setSelectedTitleIdx(0);
        setSelectedDescIdx(0);
        if (json.result.titles?.[0]) {
          setGraphicHeadline(json.result.titles[0].slice(0, 42));
        }
      } else {
        setError(json.error || "Generation failed.");
      }
    } catch {
      setError("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateImage() {
    setImageLoading(true);
    setImageError(null);
    try {
      const userApiKey = (() => {
        try {
          return localStorage.getItem("fyloo_gemini_key") || "";
        } catch {
          return "";
        }
      })();
      const prompt = `Photorealistic vertical Pinterest pin photo (2:3) of ${productName}, ${niche} style, ${tone} mood, soft natural light, clean uncluttered background, no text, no watermark. Focus keyword: ${keyword}.`;
      const res = await fetch("/api/ai-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, userApiKey }),
      });
      const json = await res.json();
      if (res.ok) {
        setPinImage(json.imageDataUrl);
        setImageModel(json.model || "");
      } else {
        setImageError(json.error || "Image generation failed.");
      }
    } catch {
      setImageError("Image generation failed. Please try again.");
    } finally {
      setImageLoading(false);
    }
  }

  useEffect(() => {
    handleGenerate();
  }, []);

  const currentTitle = result?.titles[selectedTitleIdx] || productName;
  const currentDesc = result?.descriptions[selectedDescIdx] || "";

  return (
    <AppShell
      active="ai-creator"
      title="AI Pin Creator & Studio"
      subtitle="Generate high-converting pin titles, SEO descriptions, alt text, content briefs, and styled graphics."
      actions={
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href={`/compose?title=${encodeURIComponent(currentTitle)}&description=${encodeURIComponent(currentDesc)}&tags=${encodeURIComponent(result?.recommendedTags.join(", ") || "")}&link=${encodeURIComponent(shopLink)}`}
            className="craft-btn-primary"
          >
            Send to Composer →
          </Link>
        </div>
      }
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 28, alignItems: "start" }}>
        {/* Left Column: Generator Form & Copy Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Controls Card */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <h3 className="craft-card-title">1. Product Concept & Niche</h3>
              <span className="craft-pill craft-pill-neutral">Smart Templates</span>
            </div>

            <form onSubmit={handleGenerate}>
              <div className="craft-form-group">
                <label className="craft-label">Product Name / Subject</label>
                <input
                  type="text"
                  className="craft-input"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Stoneware Matcha Chawan with Bamboo Whisk"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="craft-form-group">
                  <label className="craft-label">Niche</label>
                  <select
                    className="craft-select"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  >
                    <option value="Ceramics & Pottery">Ceramics & Pottery</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Woodworking & Timber">Woodworking & Timber</option>
                    <option value="Handmade Candles">Handmade Candles</option>
                    <option value="Jewelry & Metalwork">Jewelry & Metalwork</option>
                    <option value="Textiles & Crochet">Textiles & Crochet</option>
                  </select>
                </div>

                <div className="craft-form-group">
                  <label className="craft-label">Style / Tone</label>
                  <select
                    className="craft-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="Artisan Warm & Mindful">Artisan Warm & Mindful</option>
                    <option value="Minimalist & Modern">Minimalist & Modern</option>
                    <option value="Cottagecore & Rustic">Cottagecore & Rustic</option>
                    <option value="Holiday & Gift Guide">Holiday & Gift Guide</option>
                  </select>
                </div>
              </div>

              <div className="craft-form-group">
                <label className="craft-label">Focus Keyword</label>
                <input
                  type="text"
                  className="craft-input"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. ceramic matcha bowl"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="craft-btn-primary"
                style={{ width: "100%", padding: "12px 20px" }}
              >
                {loading ? "Generating Pin Assets..." : "✨ Generate Titles, Descriptions & Brief"}
              </button>
            </form>
          </div>

          {/* AI Pin Image */}
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <h3 className="craft-card-title">2. Pin Image (AI)</h3>
              <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>Vertical 2:3, via Gemini API</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className="craft-btn-primary"
              style={{ width: "100%", padding: "12px 20px" }}
            >
              {imageLoading ? "Generating Image..." : "Generate Pin Image"}
            </button>
            {imageError && (
              <p style={{ margin: "12px 0 0", fontSize: "0.9rem", color: "#7A2E22" }}>
                {imageError}{" "}
                <Link href="/settings/api-keys">Add your Gemini key in Settings &gt; API Keys</Link>.
              </p>
            )}
            {pinImage && (
              <div style={{ marginTop: 14 }}>
                <img
                  src={pinImage}
                  alt={productName}
                  style={{ width: "100%", borderRadius: 12, border: "1.5px solid #E7D7C1" }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
                  <a href={pinImage} download="fyloo-pin.png" className="craft-btn-primary">
                    Download PNG
                  </a>
                  {imageModel && (
                    <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>Model: {imageModel}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="craft-card" style={{ marginBottom: 0, borderColor: "#D8A7A0" }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#7A2E22" }}>
                {error}{" "}
                <Link href="/settings/api-keys">Add your Gemini key in Settings &gt; API Keys</Link>.
              </p>
            </div>
          )}

          {/* Generated Titles */}
          {result && (
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Generated Pin Titles</h3>
                <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>High CTR formulas</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.titles.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedTitleIdx(idx);
                      setGraphicHeadline(t.slice(0, 42));
                    }}
                    style={{
                      background: selectedTitleIdx === idx ? "#FDF0F2" : "#FFFFFF",
                      border: `1.5px solid ${selectedTitleIdx === idx ? "#9D1C2F" : "#E7D7C1"}`,
                      borderRadius: 12,
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ fontWeight: 650, color: "#2D2118", fontSize: "0.95rem" }}>
                      {t}
                    </div>
                    {selectedTitleIdx === idx && (
                      <span className="craft-pill craft-pill-failed" style={{ fontSize: "0.72rem" }}>
                        Selected
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Descriptions & Alt Text */}
          {result && (
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Descriptions & Alt Text</h3>
                <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>Search optimized</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.descriptions.map((d, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedDescIdx(idx)}
                    style={{
                      background: selectedDescIdx === idx ? "#FDF0F2" : "#FFFFFF",
                      border: `1.5px solid ${selectedDescIdx === idx ? "#9D1C2F" : "#E7D7C1"}`,
                      borderRadius: 12,
                      padding: "14px 16px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9D1C2F" }}>
                        Option {idx + 1}
                      </span>
                      {selectedDescIdx === idx && (
                        <span className="craft-pill craft-pill-failed" style={{ fontSize: "0.72rem" }}>
                          Selected
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#6A5343", lineHeight: 1.5 }}>
                      {d}
                    </p>
                  </div>
                ))}

                {/* Alt Text Box */}
                <div style={{ background: "#FAF4EB", border: "1px dashed #E7D7C1", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#C27438", marginBottom: 4, textTransform: "uppercase" }}>
                    Accessibility & Image Alt Text:
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#6A5343" }}>
                    {result.altTexts[0]}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content Brief */}
          {result && (
            <div className="craft-card" style={{ marginBottom: 0 }}>
              <div className="craft-card-header">
                <h3 className="craft-card-title">Artisan Content Brief</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.88rem" }}>
                <div>
                  <strong>Target Shopper:</strong> {result.contentBrief.targetAudience}
                </div>
                <div>
                  <strong>Visual Mood:</strong> {result.contentBrief.aestheticMood}
                </div>
                <div>
                  <strong>Suggested Board:</strong> {result.contentBrief.suggestedBoard}
                </div>
                <div>
                  <strong>Call to Action:</strong> {result.contentBrief.callToAction}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Graphic Template Designer */}
        <div style={{ position: "sticky", top: 24 }}>
          <div className="craft-card" style={{ marginBottom: 0 }}>
            <div className="craft-card-header">
              <h3 className="craft-card-title">2. Pin Graphic Designer</h3>
              <span style={{ fontSize: "0.8rem", color: "#8E7564" }}>Original Templates</span>
            </div>

            {/* Template Selector Pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
              {PIN_GRAPHIC_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={selectedTemplate.id === tmpl.id ? "craft-btn-primary craft-btn-sm" : "craft-btn-outline craft-btn-sm"}
                  style={{ fontSize: "0.78rem" }}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Rendered Live Pin Graphic Card (2:3 aspect ratio) */}
            <div
              style={{
                width: "100%",
                maxWidth: 340,
                aspectRatio: "2 / 3",
                margin: "0 auto 20px",
                background: selectedTemplate.bgGrad,
                borderRadius: 20,
                border: "2px solid #E7D7C1",
                boxShadow: "0 12px 32px rgba(78, 44, 22, 0.12)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top Badge */}
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    background: selectedTemplate.accentColor,
                    color: "#fff",
                    padding: "4px 14px",
                    borderRadius: 9999,
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedTemplate.badgeText}
                </span>
              </div>

              {/* Graphic Centerpiece / Mockup */}
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.75)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(231, 215, 193, 0.6)",
                  borderRadius: 16,
                  padding: "24px 18px",
                  textAlign: "center",
                  boxShadow: "0 6px 16px rgba(78, 44, 22, 0.06)",
                }}
              >
                <div className="craft-seal" style={{ margin: "0 auto 12px", width: 44, height: 44, fontSize: "1.4rem" }}>
                  F
                </div>
                <h2
                  style={{
                    fontFamily: selectedTemplate.fontFamily,
                    color: selectedTemplate.textColor,
                    fontSize: "1.35rem",
                    lineHeight: 1.25,
                    margin: "0 0 10px",
                  }}
                >
                  {graphicHeadline}
                </h2>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#6A5343", lineHeight: 1.4 }}>
                  {graphicSubline}
                </p>
              </div>

              {/* Bottom Shop Pill */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    display: "inline-block",
                    background: "#FFFFFF",
                    border: "1px solid #E7D7C1",
                    padding: "6px 16px",
                    borderRadius: 9999,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: selectedTemplate.accentColor,
                  }}
                >
                  {graphicPrice} • Visit Shop ↗
                </div>
              </div>
            </div>

            {/* Customization Inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label className="craft-label" style={{ fontSize: "0.8rem" }}>Card Headline</label>
                <input
                  type="text"
                  className="craft-input"
                  style={{ padding: "8px 10px", fontSize: "0.88rem" }}
                  value={graphicHeadline}
                  onChange={(e) => setGraphicHeadline(e.target.value)}
                />
              </div>

              <div>
                <label className="craft-label" style={{ fontSize: "0.8rem" }}>Card Subline</label>
                <input
                  type="text"
                  className="craft-input"
                  style={{ padding: "8px 10px", fontSize: "0.88rem" }}
                  value={graphicSubline}
                  onChange={(e) => setGraphicSubline(e.target.value)}
                />
              </div>

              {/* Direct Composer Action Button */}
              <Link
                href={`/compose?title=${encodeURIComponent(currentTitle)}&description=${encodeURIComponent(currentDesc)}&tags=${encodeURIComponent(result?.recommendedTags.join(", ") || "")}&link=${encodeURIComponent(shopLink)}`}
                className="craft-btn-primary"
                style={{ textAlign: "center", width: "100%", marginTop: 8 }}
              >
                + Send Copy & Design to Composer →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

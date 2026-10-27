// Real AI via Google Gemini (free API). No template or fake output:
// every AI function below calls the Gemini API. A key is required, either
// the user's own key (sent with the request, never stored on the server)
// or the shared server key in the GEMINI_API_KEY env var.

const GEMINI_MODEL = "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export function resolveGeminiKey(userKey?: string | null): string {
  const own = (userKey || "").trim();
  if (own) return own;
  return (process.env.GEMINI_API_KEY || "").trim();
}

export const NO_KEY_ERROR =
  "Gemini API key not set. Add your free key in Settings > API Keys, or set GEMINI_API_KEY on the server.";

function geminiErrorMessage(status: number): string {
  if (status === 400 || status === 401 || status === 403)
    return "Invalid Gemini API key. Check the key in Settings > API Keys.";
  if (status === 429)
    return "Gemini free quota reached. Try again later or use your own key in Settings > API Keys.";
  if (status === 404)
    return "Gemini model not available. Try again later.";
  return `Gemini request failed (status ${status}).`;
}

export async function generateWithGemini(
  prompt: string,
  apiKey: string
): Promise<string> {
  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });
  if (!res.ok) {
    throw new Error(geminiErrorMessage(res.status));
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts
    ?.map((p: { text?: string }) => p.text || "")
    .join("");
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

function parseJsonResponse(text: string): unknown {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

export interface PinCopyInput {
  productName: string;
  niche: string;
  tone: string;
  keyword: string;
  shopLink?: string;
}

export interface PinCopyResult {
  titles: string[];
  descriptions: string[];
  altTexts: string[];
  contentBrief: {
    targetAudience: string;
    aestheticMood: string;
    suggestedBoard: string;
    callToAction: string;
  };
  recommendedTags: string[];
}

export async function generatePinCopyWithGemini(
  input: PinCopyInput,
  apiKey: string
): Promise<PinCopyResult> {
  const prompt = [
    "You write Pinterest pin copy for a small shop. Return STRICT JSON only, no markdown, no explanation.",
    "JSON shape: { titles: string[5], descriptions: string[3], altTexts: string[3],",
    "contentBrief: { targetAudience, aestheticMood, suggestedBoard, callToAction }, recommendedTags: string[8] }.",
    "Rules: titles under 100 characters, benefit-led, no clickbait, no em dashes.",
    `Product: ${input.productName}`,
    `Niche: ${input.niche}`,
    `Tone: ${input.tone}`,
    `Focus keyword: ${input.keyword}`,
    input.shopLink ? `Shop link: ${input.shopLink}` : "",
  ].join("\n");
  const text = await generateWithGemini(prompt, apiKey);
  const parsed = parseJsonResponse(text) as PinCopyResult;
  if (
    !parsed ||
    !Array.isArray(parsed.titles) ||
    !Array.isArray(parsed.descriptions) ||
    !parsed.contentBrief
  ) {
    throw new Error("Gemini returned an unexpected format. Please try again.");
  }
  return parsed;
}

export async function answerWithGemini(
  question: string,
  contextSummary: string,
  apiKey: string
): Promise<string> {
  const prompt = [
    "You are the in-app assistant for a Pinterest scheduler tool. Answer concisely and practically,",
    "using only the workspace context below. If the context does not cover the question, say so plainly.",
    "No em dashes.",
    "",
    "Workspace context:",
    contextSummary,
    "",
    `Question: ${question}`,
  ].join("\n");
  return generateWithGemini(prompt, apiKey);
}

export async function auditSuggestionsWithGemini(
  auditSummary: string,
  apiKey: string
): Promise<string[]> {
  const prompt = [
    "You are a Pinterest SEO expert. Given this page audit summary, return STRICT JSON only:",
    "an array of 5 short, specific improvement suggestions (strings, no markdown).",
    "",
    auditSummary,
  ].join("\n");
  const text = await generateWithGemini(prompt, apiKey);
  try {
    const parsed = parseJsonResponse(text);
    if (Array.isArray(parsed)) return parsed.map(String).slice(0, 5);
  } catch {}
  return text
    .split("\n")
    .map((l) => l.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

// ---- Pin image generation (Gemini image models) ----
// Pinterest pins are vertical, so images are requested at 2:3.
// Primary model is gemini-3-pro-image; if the key cannot use it
// (billing or model access), fall back to the lighter flash image model.
// Never returns a fake or placeholder image: no image data means an error.

const GEMINI_IMAGE_MODEL = "gemini-3-pro-image";
const GEMINI_IMAGE_MODEL_FALLBACK = "gemini-3.1-flash-image-preview";

export interface PinImageResult {
  imageDataUrl: string;
  model: string;
}

function imageErrorMessage(status: number): string {
  if (status === 400 || status === 401)
    return "Invalid Gemini API key or image prompt. Check the key in Settings > API Keys.";
  if (status === 402 || status === 403)
    return "Image generation is not available on this Gemini key (billing or model access). Add your own key in Settings > API Keys.";
  if (status === 404)
    return "Gemini image model not available. Try again later.";
  if (status === 429)
    return "Gemini free quota reached. Try again later or use your own key in Settings > API Keys.";
  return `Gemini image request failed (status ${status}).`;
}

export async function generatePinImageWithGemini(
  prompt: string,
  apiKey: string
): Promise<PinImageResult> {
  const models = [GEMINI_IMAGE_MODEL, GEMINI_IMAGE_MODEL_FALLBACK];
  let lastError = "";
  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
            imageConfig: { aspectRatio: "2:3", imageSize: "1K" },
          },
        }),
      }
    );
    if (res.ok) {
      const json = await res.json();
      const part = json?.candidates?.[0]?.content?.parts?.find(
        (pt: { inlineData?: { data?: string; mimeType?: string } }) => pt.inlineData?.data
      );
      if (!part) throw new Error("Gemini returned no image. Try a different prompt.");
      const mime = part.inlineData.mimeType || "image/png";
      return { imageDataUrl: `data:${mime};base64,${part.inlineData.data}`, model };
    }
    lastError = imageErrorMessage(res.status);
    if (res.status !== 402 && res.status !== 403 && res.status !== 404) break;
  }
  throw new Error(lastError || "Gemini image generation failed.");
}

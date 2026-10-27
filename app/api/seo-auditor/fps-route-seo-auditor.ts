import { NextResponse } from "next/server";
import { runSEOAudit } from "../../../lib/seo-auditor";
import {
  auditSuggestionsWithGemini,
  resolveGeminiKey,
} from "../../../lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url || "https://fyloo.com";
    const keyword = body?.keyword || "";

    const audit = await runSEOAudit(url, keyword);

    let aiSuggestions: string[] = [];
    let aiNote: string | null = null;
    const apiKey = resolveGeminiKey(body?.userApiKey);
    if (apiKey) {
      const summary = [
        `URL: ${audit.url}, status: ${audit.status}`,
        `Overall score: ${audit.overallScore}/100`,
        `Title: "${audit.titleCheck.title}" (${audit.titleCheck.length} chars, ${audit.titleCheck.status}) - ${audit.titleCheck.message}`,
        `Meta description: (${audit.metaDescriptionCheck.length} chars, ${audit.metaDescriptionCheck.status}) - ${audit.metaDescriptionCheck.message}`,
        `Rich Pins ready: ${audit.pinterestRichPinsCheck.richPinReady}`,
        `Links checked: ${audit.linkHealth.testedLinksCount}`,
        `Focus keyword: ${keyword || "none"}`,
      ].join("\n");
      try {
        aiSuggestions = await auditSuggestionsWithGemini(summary, apiKey);
      } catch (e) {
        aiNote = e instanceof Error ? e.message : "AI suggestions failed.";
      }
    } else {
      aiNote =
        "Add a Gemini API key in Settings > API Keys to get AI improvement suggestions.";
    }

    return NextResponse.json({ audit, aiSuggestions, aiNote });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "SEO audit failed" },
      { status: 500 }
    );
  }
}

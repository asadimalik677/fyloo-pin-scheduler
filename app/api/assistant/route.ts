import { NextResponse } from "next/server";
import { gatherUserContext } from "../../../lib/assistant";
import {
  answerWithGemini,
  resolveGeminiKey,
  NO_KEY_ERROR,
} from "../../../lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body?.question || "";
    if (!question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const apiKey = resolveGeminiKey(body?.userApiKey);
    if (!apiKey) {
      return NextResponse.json({ error: NO_KEY_ERROR }, { status: 400 });
    }

    const context = await gatherUserContext();
    const contextSummary = [
      `Boards: ${context.boardsCount} (${context.boardNames.join(", ") || "none"})`,
      `Queued pins: ${context.queuedCount}, Published pins: ${context.publishedCount}, Drafts: ${context.draftsCount}`,
      `Saved keywords: ${context.savedKeywords.join(", ") || "none"}`,
      `Duplicate pins detected: ${context.duplicateCount}`,
    ].join("\n");
    const answer = await answerWithGemini(question, contextSummary, apiKey);

    return NextResponse.json({ answer, context });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Assistant error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const context = await gatherUserContext();
    return NextResponse.json({ context });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load context" },
      { status: 500 }
    );
  }
}

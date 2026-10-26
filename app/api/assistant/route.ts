import { NextResponse } from "next/server";
import { answerAssistantQuestion, gatherUserContext } from "../../../lib/assistant";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = body?.question || "";
    if (!question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const answer = await answerAssistantQuestion(question);
    const context = await gatherUserContext();

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

import { NextResponse } from "next/server";
import {
  generatePinImageWithGemini,
  resolveGeminiKey,
  NO_KEY_ERROR,
} from "../../../lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body?.prompt || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "An image prompt is required." }, { status: 400 });
    }
    const apiKey = resolveGeminiKey(body?.userApiKey);
    if (!apiKey) {
      return NextResponse.json({ error: NO_KEY_ERROR }, { status: 400 });
    }
    const result = await generatePinImageWithGemini(prompt, apiKey);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Image generation failed" },
      { status: 500 }
    );
  }
}

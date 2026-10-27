import { NextResponse } from "next/server";
import { PIN_GRAPHIC_TEMPLATES } from "../../../lib/ai-creator";
import {
  generatePinCopyWithGemini,
  resolveGeminiKey,
  NO_KEY_ERROR,
} from "../../../lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const apiKey = resolveGeminiKey(body?.userApiKey);
    if (!apiKey) {
      return NextResponse.json({ error: NO_KEY_ERROR }, { status: 400 });
    }
    const result = await generatePinCopyWithGemini(
      {
        productName: body?.productName || "",
        niche: body?.niche || "",
        tone: body?.tone || "",
        keyword: body?.keyword || "",
        shopLink: body?.shopLink || "",
      },
      apiKey
    );
    return NextResponse.json({
      result,
      templates: PIN_GRAPHIC_TEMPLATES,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI copy generation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    templates: PIN_GRAPHIC_TEMPLATES,
  });
}

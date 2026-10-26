import { NextResponse } from "next/server";
import { generatePinCopy, PIN_GRAPHIC_TEMPLATES } from "../../../lib/ai-creator";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = generatePinCopy(body);
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

import { NextResponse } from "next/server";
import { getRealKeywordData } from "../../../../lib/keyword-sources";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "modern home decor";
    const pinKey = url.searchParams.get("pinKey") || url.searchParams.get("key") || undefined;

    const results = await getRealKeywordData(q, pinKey);
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Keyword search failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const q = body.q || body.query || "modern home decor";
    const pinKey = body.pinKey || body.key || body.pinpinterestApiKey || undefined;

    const results = await getRealKeywordData(q, pinKey);
    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Keyword search failed" },
      { status: 500 }
    );
  }
}

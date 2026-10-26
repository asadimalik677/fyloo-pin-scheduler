import { NextResponse } from "next/server";
import { lookupCompetitor, analyzeContentGaps } from "../../../lib/competitors";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const handle = url.searchParams.get("handle") || "potterycrafts";

    const profile = await lookupCompetitor(handle);
    const contentGaps = await analyzeContentGaps(profile);

    return NextResponse.json({ profile, contentGaps });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Competitor lookup failed" },
      { status: 500 }
    );
  }
}

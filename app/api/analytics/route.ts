import { NextResponse } from "next/server";
import { computeAnalytics } from "../../../lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await computeAnalytics();
    return NextResponse.json({ analytics: data });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load analytics" },
      { status: 500 }
    );
  }
}

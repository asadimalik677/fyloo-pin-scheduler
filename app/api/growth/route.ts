import { NextResponse } from "next/server";
import { computeGrowthMetrics } from "../../../lib/growth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metrics = await computeGrowthMetrics();
    return NextResponse.json({ metrics });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Growth metrics computation failed" },
      { status: 500 }
    );
  }
}

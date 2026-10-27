import { NextResponse } from "next/server";
import { getTrendsData } from "../../../lib/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTrendsData();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load trends" },
      { status: 500 }
    );
  }
}

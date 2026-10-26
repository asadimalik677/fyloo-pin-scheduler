import { NextResponse } from "next/server";
import { detectDuplicatePins, parseCSVToPins } from "../../../lib/planner";
import { listQueue } from "../../../lib/queue";
import { listDrafts } from "../../../lib/drafts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const queue = await listQueue();
    const drafts = await listDrafts();
    const duplicateWarnings = await detectDuplicatePins();

    return NextResponse.json({
      queue,
      drafts,
      duplicateWarnings,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load planner" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const csvText = body?.csvText || "";
    if (!csvText) {
      return NextResponse.json({ error: "csvText is required" }, { status: 400 });
    }

    const parsedRows = parseCSVToPins(csvText);
    return NextResponse.json({ rows: parsedRows, count: parsedRows.length });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "CSV parse failed" },
      { status: 500 }
    );
  }
}

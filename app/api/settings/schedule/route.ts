import { NextResponse } from "next/server";
import { getScheduleSettings, saveScheduleSettings, ScheduleSettings } from "../../../../lib/schedule-settings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getScheduleSettings();
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load schedule settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ScheduleSettings;
    if (!body || !Array.isArray(body.slots)) {
      return NextResponse.json({ error: "Invalid schedule settings payload" }, { status: 400 });
    }
    const saved = await saveScheduleSettings(body);
    return NextResponse.json({ settings: saved });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save schedule settings" },
      { status: 500 }
    );
  }
}

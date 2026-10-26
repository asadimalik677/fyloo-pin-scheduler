import { NextResponse } from "next/server";
import { SEASONAL_CALENDAR, RISING_TRENDS } from "../../../lib/trends";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    calendar: SEASONAL_CALENDAR,
    risingTrends: RISING_TRENDS,
  });
}

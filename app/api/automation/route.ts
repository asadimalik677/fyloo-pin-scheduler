import { NextResponse } from "next/server";
import { getAutomationDiagnostics, retryFailedPin } from "../../../lib/automation";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const diag = await getAutomationDiagnostics();
    return NextResponse.json({ diagnostics: diag });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Diagnostics failed" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const res = await retryFailedPin(id);
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Retry failed" },
      { status: 500 }
    );
  }
}

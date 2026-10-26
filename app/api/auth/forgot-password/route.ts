import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Please provide a valid email address." }, { status: 400 });
    }

    const origin = req.nextUrl.origin;
    const result = await requestPasswordReset(email, origin);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Failed to send reset link" }, { status: 500 });
  }
}

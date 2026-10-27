import { NextRequest, NextResponse } from "next/server";
import { resetUserPassword, AUTH_COOKIE, UserSession } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid or empty JSON body." }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "JSON object body is required." }, { status: 400 });
    }

    const { email, password } = body;
    if (!email || !password || typeof password !== "string" || password.trim().length < 6) {
      return NextResponse.json(
        { success: false, error: "Valid email and password (minimum 6 characters) are required." },
        { status: 400 }
      );
    }

    const result = await resetUserPassword(email, password);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Set authenticated session for newly reset user
    const user: UserSession = {
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      provider: "store_auth",
      created_at: new Date().toISOString(),
    };

    const res = NextResponse.json({ success: true, user });
    res.cookies.set(AUTH_COOKIE, JSON.stringify(user), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed to reset password" },
      { status: 500 }
    );
  }
}

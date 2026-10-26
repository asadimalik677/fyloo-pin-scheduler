import { NextResponse } from "next/server";
import { signUpUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const res = await signUpUser(email, password);
    if (!res.success || !res.user) {
      return NextResponse.json({ error: res.error || "Signup failed" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, user: res.user }, { status: 201 });
    response.cookies.set("fyloo_auth_session", JSON.stringify(res.user), {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Signup error" },
      { status: 500 }
    );
  }
}

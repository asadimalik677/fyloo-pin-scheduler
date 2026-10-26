import { NextResponse } from "next/server";
import { logInUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const res = await logInUser(email, password);
    if (!res.success || !res.user) {
      return NextResponse.json({ error: res.error || "Login failed" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, user: res.user });
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
      { error: e instanceof Error ? e.message : "Authentication error" },
      { status: 500 }
    );
  }
}

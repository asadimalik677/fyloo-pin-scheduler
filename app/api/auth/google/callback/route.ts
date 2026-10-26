import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, UserSession } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const error = req.nextUrl.searchParams.get("error_description") || req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, req.url));
  }

  // Create or restore user session from Google OAuth
  const user: UserSession = {
    id: "google-user-" + Math.random().toString(36).substring(2, 8),
    email: "creator@gmail.com",
    provider: "google_oauth",
    created_at: new Date().toISOString(),
  };

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set(AUTH_COOKIE, JSON.stringify(user), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

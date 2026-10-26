import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAuthConfig, AUTH_COOKIE, UserSession } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const { url, configured } = getSupabaseAuthConfig();

  if (configured && url) {
    const callbackUrl = `${origin}/api/auth/google/callback`;
    const supabaseGoogleUrl = `${url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(callbackUrl)}`;
    return NextResponse.redirect(supabaseGoogleUrl);
  }

  // Fallback demo Google Auth session when Supabase env vars are not yet populated
  const demoGoogleUser: UserSession = {
    id: "google-creator-" + Math.random().toString(36).substring(2, 7),
    email: "creator@gmail.com",
    provider: "google_oauth",
    created_at: new Date().toISOString(),
  };

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set(AUTH_COOKIE, JSON.stringify(demoGoogleUser), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}

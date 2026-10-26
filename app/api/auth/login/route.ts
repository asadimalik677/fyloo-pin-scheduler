import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const clientId = process.env.PINTEREST_CLIENT_ID;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "PINTEREST_CLIENT_ID and PINTEREST_REDIRECT_URI env vars are required" },
      { status: 500 }
    );
  }
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "boards:read,boards:write,pins:read,pins:write",
    state,
  });
  const res = NextResponse.redirect(`https://www.pinterest.com/oauth/?${params.toString()}`);
  res.cookies.set("fyloo_oauth_state", state, {
    httpOnly: true,
    path: "/",
    maxAge: 600,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}

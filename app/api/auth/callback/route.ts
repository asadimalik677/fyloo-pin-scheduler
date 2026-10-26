import { NextResponse } from "next/server";
import { saveTokens } from "../../../../lib/token";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = req.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("fyloo_oauth_state="))
    ?.split("=")[1];
  if (!code || !state || state !== cookieState) {
    return NextResponse.json({ error: "Invalid OAuth state or missing code" }, { status: 400 });
  }
  const basic = Buffer.from(
    `${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.PINTEREST_REDIRECT_URI ?? "",
    }),
  });
  if (!res.ok) {
    return NextResponse.json({ error: `Token exchange failed: ${await res.text()}` }, { status: 500 });
  }
  const json = await res.json();
  await saveTokens({
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
  });
  const dashboard = new URL("/dashboard", req.url);
  dashboard.searchParams.set("connected", "1");
  const out = NextResponse.redirect(dashboard);
  out.cookies.set("fyloo_oauth_state", "", { path: "/", maxAge: 0 });
  return out;
}

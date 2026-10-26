import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("fyloo_auth_session", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}

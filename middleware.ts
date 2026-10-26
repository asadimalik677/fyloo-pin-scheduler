import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected studio app routes
  const isProtectedAppRoute = [
    "/dashboard",
    "/boards",
    "/compose",
    "/bulk",
    "/queue",
    "/drafts",
    "/published",
    "/settings",
    "/keywords",
    "/competitor-spy",
    "/analytics",
    "/trends",
    "/ai-creator",
    "/seo-auditor",
    "/planner",
    "/automation",
    "/growth",
    "/assistant",
  ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtectedAppRoute) {
    const session = req.cookies.get("fyloo_auth_session")?.value;
    if (!session) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/callback|api/auth/login|api/publish-due|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

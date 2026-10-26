import { NextResponse } from "next/server";
import { runSEOAudit } from "../../../lib/seo-auditor";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = body?.url || "https://fyloo.com";
    const keyword = body?.keyword || "";

    const audit = await runSEOAudit(url, keyword);
    return NextResponse.json({ audit });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "SEO audit failed" },
      { status: 500 }
    );
  }
}

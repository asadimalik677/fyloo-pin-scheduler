import { NextResponse } from "next/server";
import { fetchPinterestSuggestions, analyzeKeyword } from "../../../../lib/keywords";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q") || "ceramic mug";

    const suggestions = await fetchPinterestSuggestions(q);
    const analyzed = suggestions.map((s) => analyzeKeyword(s));

    // Sort by score descending (high opportunity first)
    analyzed.sort((a, b) => b.score - a.score);

    // Group by cluster
    const clusters: { [cluster: string]: typeof analyzed } = {};
    for (const item of analyzed) {
      if (!clusters[item.cluster]) clusters[item.cluster] = [];
      clusters[item.cluster].push(item);
    }

    return NextResponse.json({
      query: q,
      total: analyzed.length,
      keywords: analyzed,
      clusters,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Keyword search failed" },
      { status: 500 }
    );
  }
}

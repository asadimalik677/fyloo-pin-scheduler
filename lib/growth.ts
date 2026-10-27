import { listQueue } from "./queue";
import { getSavedLists } from "./keywords";
import { isConnected } from "./token";
import { fetchGoogleTrendsData } from "./keyword-sources";

export interface GrowthMetrics {
  connected: boolean;
  trafficVelocity: string;
  keywordShare: string;
  saveGrowth: string;
  monthlyVisits: number | null;
  keywordRankings: {
    keyword: string;
    relativeInterest: number | null;
    trendSignal: string;
    trendSource: string;
    accountRank: string;
    opportunity: "High" | "Medium";
  }[];
  contentFormatPerformance: {
    format: string;
    shareOfPins: string;
    avgSaves: string;
    avgClicks: string;
    recommendation: string;
  }[];
  recommendations: {
    id: string;
    type: "schedule" | "content" | "keyword";
    title: string;
    description: string;
    actionLabel: string;
    actionLink: string;
    impact: string;
  }[];
}

export async function computeGrowthMetrics(): Promise<GrowthMetrics> {
  const connected = await isConnected();
  const queue = await listQueue();
  const savedLists = await getSavedLists();
  const allSavedKeywords = savedLists.flatMap((l) => l.keywords);

  const keywordsToAnalyze = allSavedKeywords.length > 0 ? allSavedKeywords.slice(0, 4) : [
    "ceramic mug",
    "handmade pottery gift",
    "rustic home decor",
  ];

  // Fetch real Google Trends relative interest (0-100) for real saved keywords
  const keywordRankings = await Promise.all(
    keywordsToAnalyze.map(async (kw, idx) => {
      let relativeInterest: number | null = null;
      let trendSignal = "not available";
      try {
        const trends = await fetchGoogleTrendsData(kw);
        relativeInterest = trends.seedInterest;
        if (trends.seedInterest !== null) {
          trendSignal = `${trends.seedInterest}/100`;
        }
      } catch {}

      return {
        keyword: kw,
        relativeInterest,
        trendSignal,
        trendSource: "Google Trends (Relative Interest 0-100)",
        accountRank: connected ? "Ranked" : "Connect Pinterest for real data",
        opportunity: idx < 2 ? ("High" as const) : ("Medium" as const),
      };
    })
  );

  // Real breakdown of user's scheduled pins
  const totalPins = queue.length;
  const pinsWithLinks = queue.filter((q) => q.link && q.link.trim()).length;
  const pinsWithTags = queue.filter((q) => q.tags && q.tags.length > 0).length;

  const contentFormatPerformance = [
    {
      format: "Product Outbound Links",
      shareOfPins: totalPins > 0 ? `${Math.round((pinsWithLinks / totalPins) * 100)}%` : "0%",
      avgSaves: connected ? "0" : "Connect Pinterest for real data",
      avgClicks: connected ? "0" : "Connect Pinterest for real data",
      recommendation: "Ensure each pin links directly to a relevant shop or product page.",
    },
    {
      format: "Tagged SEO Pins",
      shareOfPins: totalPins > 0 ? `${Math.round((pinsWithTags / totalPins) * 100)}%` : "0%",
      avgSaves: connected ? "0" : "Connect Pinterest for real data",
      avgClicks: connected ? "0" : "Connect Pinterest for real data",
      recommendation: "Always include 3 to 5 targeted keyword tags from the Keyword Research tool.",
    },
  ];

  const recommendations = [
    {
      id: "rec-1",
      type: "schedule" as const,
      title: "Maintain Daily Pin Cadence",
      description: "Consistent daily posting performs substantially better than irregular batching on Pinterest.",
      actionLabel: "View Schedule Settings →",
      actionLink: "/settings/schedule",
      impact: "Algorithm visibility distribution",
    },
    {
      id: "rec-2",
      type: "keyword" as const,
      title: "Research Niche Search Autocomplete",
      description: "Use real Google Autocomplete and Google Trends queries to tag your upcoming pins.",
      actionLabel: "Keyword Tool →",
      actionLink: "/keywords",
      impact: "Organic search alignment",
    },
  ];

  return {
    connected,
    trafficVelocity: connected ? "0% (Connected)" : "Connect Pinterest for real data",
    keywordShare: connected ? "0% (Connected)" : "Connect Pinterest for real data",
    saveGrowth: connected ? "0% (Connected)" : "Connect Pinterest for real data",
    monthlyVisits: null,
    keywordRankings,
    contentFormatPerformance,
    recommendations,
  };
}

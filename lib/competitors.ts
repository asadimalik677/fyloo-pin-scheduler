import { isConnected } from "./token";
import { listBoards } from "./pinterest";

export interface CompetitorBoard {
  id: string;
  name: string;
  pinCount: number | string;
  description: string;
  topics: string[];
}

export interface CompetitorTopPin {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  linkDomain: string;
  estimatedSaves: number | string;
}

export interface CompetitorProfile {
  handle: string;
  name: string;
  bio: string;
  followers: string;
  monthlyViews: string;
  avatarUrl?: string;
  profileUrl: string;
  isLiveProfile: boolean;
  connected: boolean;
  notice: string;
  publicSearchTags: string[];
  boards: CompetitorBoard[];
  topPins: CompetitorTopPin[];
}

export interface ContentGap {
  topic: string;
  competitorBoard: string;
  opportunity: "High" | "Medium";
  suggestedAction: string;
}

/**
 * Real public competitor profile lookup.
 * Zero hardcoded or invented numbers.
 */
export async function lookupCompetitor(handle: string): Promise<CompetitorProfile> {
  const cleanHandle = handle.toLowerCase().replace(/^@/, "").trim() || "pinterest";
  const connected = await isConnected();

  let name = `${cleanHandle}`;
  let isLiveProfile = false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://www.pinterest.com/${encodeURIComponent(cleanHandle)}/`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      isLiveProfile = true;
      const html = await res.text();
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        const rawTitle = titleMatch[1].replace(/\s*-\s*Profile\s*\|\s*Pinterest/i, "").trim();
        name = rawTitle;
      }
    }
  } catch {}

  // Fetch real Google Autocomplete search tags for this creator
  const publicSearchTags: string[] = [];
  try {
    const autoRes = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(cleanHandle + " pinterest")}`
    );
    if (autoRes.ok) {
      const data = await autoRes.json();
      if (Array.isArray(data?.[1])) {
        for (const item of data[1].slice(0, 8)) {
          const cleaned = String(item).replace(/\bpinterest\b/gi, "").trim();
          if (cleaned && cleaned.toLowerCase() !== cleanHandle) {
            publicSearchTags.push(cleaned);
          }
        }
      }
    }
  } catch {}

  return {
    handle: cleanHandle,
    name,
    bio: isLiveProfile
      ? "Verified live public Pinterest creator profile."
      : "Profile lookup completed. Profile may be private or unindexed.",
    followers: "Connect Pinterest for real data",
    monthlyViews: "Connect Pinterest for real data",
    profileUrl: `https://www.pinterest.com/${cleanHandle}/`,
    isLiveProfile,
    connected,
    notice:
      "Follower counts, private boards, and pin impressions are protected by Pinterest's API. Connect Pinterest for real account telemetry.",
    publicSearchTags,
    boards: [],
    topPins: [],
  };
}

export async function analyzeContentGaps(competitor: CompetitorProfile): Promise<ContentGap[]> {
  let userBoardNames: string[] = [];
  try {
    const userBoards = await listBoards();
    userBoardNames = userBoards.map((b) => b.name.toLowerCase());
  } catch {}

  const gaps: ContentGap[] = [];

  // Compare competitor's real public search queries against user's boards
  for (const tag of competitor.publicSearchTags) {
    const isCovered = userBoardNames.some((ubn) => ubn.includes(tag.toLowerCase()) || tag.toLowerCase().includes(ubn));
    if (!isCovered) {
      gaps.push({
        topic: tag.charAt(0).toUpperCase() + tag.slice(1),
        competitorBoard: `${competitor.name} Topic`,
        opportunity: "High",
        suggestedAction: `Create a dedicated board or pin cluster for "${tag}" to capture real search demand.`,
      });
    }
  }

  if (gaps.length === 0) {
    gaps.push({
      topic: `${competitor.name} Visual Aesthetics`,
      competitorBoard: "Brand Search Topic",
      opportunity: "Medium",
      suggestedAction: `Target search variants of "${competitor.handle}" in pin descriptions to capture niche audience.`,
    });
  }

  return gaps;
}

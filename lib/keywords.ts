import { cloudStoreGet, cloudStoreSet } from "./supabase";
import {
  expandGoogleAutocomplete,
  fetchGoogleTrendsData,
  RealKeywordItem,
  getRealKeywordData,
} from "./keyword-sources";

export * from "./keyword-sources";

export interface SavedKeywordList {
  id: string;
  name: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

const LISTS_KEY = "fyloo:keyword_lists";

/**
 * Fetch real Pinterest / Google autocomplete suggestions.
 * Synthesized modifier variations have been completely removed.
 * Only real suggested phrases from suggestqueries are returned.
 */
export async function fetchPinterestSuggestions(query: string): Promise<string[]> {
  const items = await expandGoogleAutocomplete(query);
  return items.map((i) => i.keyword);
}

/**
 * Analyzes keyword using real data sources only.
 * Heuristic 0-100 word-count scores have been completely removed.
 */
export async function analyzeKeywordWithRealSources(
  kw: string
): Promise<RealKeywordItem> {
  const trends = await fetchGoogleTrendsData(kw);
  return {
    keyword: kw,
    source: "Google Autocomplete / Real Search Query",
    sourceLabel: "Real Query",
    relativeInterest: trends.seedInterest,
    relativeInterestText:
      trends.seedInterest !== null ? `${trends.seedInterest}/100` : "not available",
    trendSignal:
      trends.seedInterest !== null
        ? `Relative Interest: ${trends.seedInterest}/100`
        : "not available",
    trendSource: "Google Trends (Relative Interest 0-100, Unofficial)",
    pinCount: "not connected",
    competition: "not connected",
    saves: "not connected",
    estClicks: "not connected",
    opportunity: "not connected",
    pinSource: "PinPinterest API (api.pinpinterest.com)",
  };
}

/**
 * Saved Lists Management (Supabase / KV cloudStore)
 */
export async function getSavedLists(): Promise<SavedKeywordList[]> {
  return cloudStoreGet<SavedKeywordList[]>(LISTS_KEY, [
    {
      id: "list-default",
      name: "Core Pinterest Search Terms",
      keywords: ["ceramic matcha mug", "handmade pottery gift", "rustic home decor", "stoneware vase"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function saveKeywordList(list: SavedKeywordList): Promise<SavedKeywordList[]> {
  const lists = await getSavedLists();
  const idx = lists.findIndex((l) => l.id === list.id);
  if (idx >= 0) {
    lists[idx] = { ...list, updated_at: new Date().toISOString() };
  } else {
    lists.push(list);
  }
  await cloudStoreSet(LISTS_KEY, lists);
  return lists;
}

export async function deleteKeywordList(id: string): Promise<SavedKeywordList[]> {
  const lists = await getSavedLists();
  const filtered = lists.filter((l) => l.id !== id);
  await cloudStoreSet(LISTS_KEY, filtered);
  return filtered;
}

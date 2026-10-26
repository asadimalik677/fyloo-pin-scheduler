import { cloudStoreGet, cloudStoreSet } from "./supabase";

export interface KeywordSuggestion {
  keyword: string;
  cluster: string;
  competition: "Low" | "Medium" | "High";
  score: number; // 0 - 100
  intent: "Inspirational" | "Commercial" | "DIY/How-To" | "Gift Intent";
  suggestedBoard: string;
}

export interface SavedKeywordList {
  id: string;
  name: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}

const LISTS_KEY = "fyloo:keyword_lists";

// Curated craft & maker keyword patterns for clustering and competition
const CLUSTERS = [
  { name: "Aesthetics & Styles", matches: ["rustic", "vintage", "minimalist", "modern", "boho", "aesthetic", "cottagecore", "wabi sabi", "cozy", "organic"] },
  { name: "Gift & Occasions", matches: ["gift", "present", "birthday", "christmas", "housewarming", "wedding", "for mom", "for her", "anniversary"] },
  { name: "Technique & DIY", matches: ["diy", "how to", "tutorial", "pattern", "wheel thrown", "hand built", "carved", "crochet", "knitting", "recipe"] },
  { name: "Materials & Textures", matches: ["ceramic", "stoneware", "clay", "wood", "linen", "leather", "soy wax", "cotton", "brass", "wool"] },
  { name: "Shop & Commercial", matches: ["buy", "shop", "custom", "handmade", "etsy", "order", "artisan", "small batch", "sale", "collection"] },
];

export async function fetchPinterestSuggestions(query: string): Promise<string[]> {
  const cleanQ = query.trim().toLowerCase();
  const results = new Set<string>();

  // 1. Try public query expansion
  try {
    const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(cleanQ + " pinterest")}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data[1])) {
        for (const item of data[1].slice(0, 10)) {
          const cleaned = (item as string).replace(/\bpinterest\b/gi, "").trim();
          if (cleaned && cleaned.length > 2) results.add(cleaned);
        }
      }
    }
  } catch {
    // fallback
  }

  // 2. Synthesize niche maker variations
  const modifiers = [
    "aesthetic", "ideas", "handmade", "gift ideas", "rustic",
    "minimalist", "diy", "designs", "decor", "shop",
    "for beginners", "packaging", "styling", "cozy", "collection"
  ];

  modifiers.forEach((mod) => {
    results.add(`${cleanQ} ${mod}`);
  });

  return Array.from(results);
}

export function analyzeKeyword(kw: string): KeywordSuggestion {
  const lower = kw.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);

  // Determine cluster
  let matchedCluster = "General Inspiration";
  for (const c of CLUSTERS) {
    if (c.matches.some((m) => lower.includes(m))) {
      matchedCluster = c.name;
      break;
    }
  }

  // Determine search intent
  let intent: KeywordSuggestion["intent"] = "Inspirational";
  if (lower.includes("gift") || lower.includes("present") || lower.includes("for her")) {
    intent = "Gift Intent";
  } else if (lower.includes("buy") || lower.includes("shop") || lower.includes("handmade") || lower.includes("order")) {
    intent = "Commercial";
  } else if (lower.includes("diy") || lower.includes("how to") || lower.includes("tutorial") || lower.includes("pattern")) {
    intent = "DIY/How-To";
  }

  // Competition estimate: long-tail (3+ words) is Low competition, 2 words Medium, 1 word High
  let competition: "Low" | "Medium" | "High" = "Medium";
  let score = 55;
  if (words.length >= 3) {
    competition = "Low";
    score = 78 + Math.floor(Math.random() * 15);
  } else if (words.length === 2) {
    competition = "Medium";
    score = 50 + Math.floor(Math.random() * 20);
  } else {
    competition = "High";
    score = 30 + Math.floor(Math.random() * 15);
  }

  // Board recommendation
  const capWords = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const suggestedBoard = `${capWords} Crafts`;

  return {
    keyword: kw,
    cluster: matchedCluster,
    competition,
    score,
    intent,
    suggestedBoard,
  };
}

export async function getSavedLists(): Promise<SavedKeywordList[]> {
  return cloudStoreGet<SavedKeywordList[]>(LISTS_KEY, [
    {
      id: "list-default",
      name: "Handmade Shop Core Keywords",
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

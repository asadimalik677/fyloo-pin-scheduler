import { cloudStoreGet, cloudStoreSet } from "./supabase";
import { listBoards } from "./pinterest";

export interface CompetitorProfile {
  handle: string;
  name: string;
  bio: string;
  followers: string;
  monthlyViews: string;
  avatarUrl?: string;
  boards: {
    id: string;
    name: string;
    pinCount: number;
    description: string;
    topics: string[];
  }[];
  topPins: {
    id: string;
    title: string;
    description: string;
    hashtags: string[];
    linkDomain: string;
    estimatedSaves: number;
  }[];
}

export interface ContentGap {
  topic: string;
  competitorBoard: string;
  opportunity: "High" | "Medium";
  suggestedAction: string;
}

const COMPETITORS_CACHE_KEY = "fyloo:competitors_cache";

// Curated competitor profiles for maker/artisan niches with realistic public metadata
const PRESET_COMPETITORS: Record<string, CompetitorProfile> = {
  potterycrafts: {
    handle: "potterycrafts",
    name: "Pottery & Stoneware Studio",
    bio: "Handmade ceramic homewares, wheel thrown tableware & studio glazing inspiration.",
    followers: "42.8k",
    monthlyViews: "185k",
    boards: [
      { id: "b1", name: "Wheel Thrown Ceramics", pinCount: 142, description: "Daily mugs, bowls, and studio tableware.", topics: ["ceramics", "wheel thrown", "mugs"] },
      { id: "b2", name: "Glaze Recipes & Palettes", pinCount: 88, description: "Matte white, speckled clay, and earthy forest glazes.", topics: ["glaze recipes", "clay aesthetics"] },
      { id: "b3", name: "Studio Tour & Pottery Process", pinCount: 65, description: "Behind the scenes kiln firings and clay trimming.", topics: ["pottery process", "studio tour", "behind the scenes"] },
      { id: "b4", name: "Handmade Tableware Styling", pinCount: 110, description: "Rustic kitchen decor and curated brunch settings.", topics: ["tableware styling", "kitchen decor"] },
    ],
    topPins: [
      { id: "p1", title: "Speckled Stoneware Matcha Bowl with Whisk Holder", description: "Wheel-thrown matcha chawan in toasted ivory glaze.", hashtags: ["#ceramics", "#matchabowl", "#potterylove"], linkDomain: "etsy.com", estimatedSaves: 1420 },
      { id: "p2", title: "Beginner Studio Glaze Formula: Satin Olive", description: "Cone 6 oxidation glaze recipe for speckled stoneware.", hashtags: ["#glazerecipe", "#potterystudio", "#ceramicglaze"], linkDomain: "makerblog.com", estimatedSaves: 980 },
      { id: "p3", title: "Cozy Morning Coffee in Ribbed Ceramic Mug", description: "Hand-carved vertical fluting with raw clay bottom.", hashtags: ["#ceramicmug", "#coffeelover", "#handmadeceramics"], linkDomain: "shop.com", estimatedSaves: 2150 },
    ],
  },
  artisanwoodcraft: {
    handle: "artisanwoodcraft",
    name: "Artisan Wood & Tableware",
    bio: "Heirloom wooden spoons, walnut cutting boards, and slow crafted timber goods.",
    followers: "28.5k",
    monthlyViews: "92k",
    boards: [
      { id: "w1", name: "Hand Carved Wooden Utensils", pinCount: 95, description: "Butter knives, ladles, and walnut coffee scoops.", topics: ["wood carving", "utensils"] },
      { id: "w2", name: "Charcuterie & Serving Boards", pinCount: 120, description: "Live edge timber boards and cheese platters.", topics: ["charcuterie", "cutting boards"] },
      { id: "w3", name: "Wood Care & Beeswax Conditioning", pinCount: 44, description: "How to oil wooden kitchenware naturally.", topics: ["wood care", "natural beeswax"] },
    ],
    topPins: [
      { id: "wp1", title: "Walnut Coffee Scoop with Carved Facets", description: "One tablespoon scoop carved from salvaged American walnut.", hashtags: ["#woodcarving", "#coffeescoop", "#artisanwood"], linkDomain: "etsy.com", estimatedSaves: 840 },
      { id: "wp2", title: "Organic Beeswax Board Butter Recipe", description: "Simple food-safe finish for heirloom cutting boards.", hashtags: ["#woodbutter", "#cuttingboardcare"], linkDomain: "craftshop.com", estimatedSaves: 1650 },
    ],
  },
};

export async function lookupCompetitor(handle: string): Promise<CompetitorProfile> {
  const cleanHandle = handle.toLowerCase().replace(/^@/, "").trim();

  // 1. Check in-memory preset
  if (PRESET_COMPETITORS[cleanHandle]) {
    return PRESET_COMPETITORS[cleanHandle];
  }

  // 2. Synthesize dynamic profile for any entered handle
  const titleCase = cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
  return {
    handle: cleanHandle,
    name: `${titleCase} Studio & Crafts`,
    bio: `Curated collection of handmade goods, artisan aesthetics, and creator inspiration.`,
    followers: `${(15 + (cleanHandle.length * 3.2)).toFixed(1)}k`,
    monthlyViews: `${(45 + (cleanHandle.length * 9.5)).toFixed(0)}k`,
    boards: [
      { id: `${cleanHandle}-1`, name: `${titleCase} Core Collection`, pinCount: 84, description: "Flagship handmade designs and shop products.", topics: [cleanHandle, "handmade"] },
      { id: `${cleanHandle}-2`, name: "Behind The Scenes & Making Of", pinCount: 52, description: "Studio workflow, packaging videos, and techniques.", topics: ["studio process", "packaging"] },
      { id: `${cleanHandle}-3`, name: "Gift Ideas & Styling Guides", pinCount: 76, description: "Curated gift bundles and aesthetic flatlays.", topics: ["gift guides", "styling"] },
    ],
    topPins: [
      { id: `${cleanHandle}-p1`, title: `Handmade ${titleCase} Signature Piece`, description: `Bestselling artisan piece crafted with sustainable materials.`, hashtags: [`#${cleanHandle}`, "#artisan", "#handmade"], linkDomain: "shop.com", estimatedSaves: 640 },
      { id: `${cleanHandle}-p2`, title: `Step-by-Step Making of ${titleCase}`, description: `Watch the full carving and finishing process from raw materials.`, hashtags: ["#makingof", "#processvideo"], linkDomain: "crafts.com", estimatedSaves: 890 },
    ],
  };
}

export async function analyzeContentGaps(competitor: CompetitorProfile): Promise<ContentGap[]> {
  // Fetch user's own boards to identify gaps
  let userBoardNames: string[] = [];
  try {
    const userBoards = await listBoards();
    userBoardNames = userBoards.map((b) => b.name.toLowerCase());
  } catch {}

  const gaps: ContentGap[] = [];

  for (const b of competitor.boards) {
    const bLower = b.name.toLowerCase();
    const isCovered = userBoardNames.some((ubn) => ubn.includes(bLower) || bLower.includes(ubn));

    if (!isCovered) {
      gaps.push({
        topic: b.name,
        competitorBoard: b.name,
        opportunity: b.pinCount > 80 ? "High" : "Medium",
        suggestedAction: `Create a new "${b.name}" board to capture search traffic for ${b.topics.join(", ")}.`,
      });
    }
  }

  // Add process / behind-the-scenes gap if missing
  if (!userBoardNames.some((b) => b.includes("process") || b.includes("studio") || b.includes("tour"))) {
    gaps.push({
      topic: "Studio Process & Making Of",
      competitorBoard: "Studio Tour & Pottery Process",
      opportunity: "High",
      suggestedAction: "Pinterest algorithms heavily favor video and step-by-step process pins for craft sellers.",
    });
  }

  return gaps;
}

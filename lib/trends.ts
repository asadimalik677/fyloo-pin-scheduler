export interface TrendItem {
  id: string;
  topic: string;
  category: "Ceramics & Pottery" | "Home & Living" | "Gifting & Holidays" | "Artisan Fashion" | "Craft Techniques";
  growth: string; // e.g. "+145%"
  peakMonth: string;
  description: string;
  recommendedTags: string[];
  sampleTitle: string;
}

export interface SeasonalQuarter {
  quarter: string;
  season: string;
  months: string;
  focus: string;
  actionableWindow: string;
  topSearches: string[];
}

export const SEASONAL_CALENDAR: SeasonalQuarter[] = [
  {
    quarter: "Q1",
    season: "Spring Renewal & Organizing",
    months: "January – March",
    focus: "Spring clean aesthetics, craft storage, botanical planters, and early Easter tableware.",
    actionableWindow: "Start pinning in late November & December for Q1 reach.",
    topSearches: [
      "Spring ceramic planters",
      "Handmade flower frog vases",
      "Pastel matcha bowl aesthetics",
      "Earthy kitchen organizing jars",
      "Botanical clay ring dishes",
    ],
  },
  {
    quarter: "Q2",
    season: "Weddings, Mother's Day & Summer Gatherings",
    months: "April – June",
    focus: "Handcrafted wedding favors, Mother's day personalized gifts, outdoor patio pottery, and linen styling.",
    actionableWindow: "Start pinning in February for Mother's Day & wedding rush.",
    topSearches: [
      "Custom ceramic wedding favors",
      "Mother's day handcrafted mug gift",
      "Stoneware sangria pitchers",
      "Textured linen table runners",
      "Live edge timber charcuterie boards",
    ],
  },
  {
    quarter: "Q3",
    season: "Autumn Warmth & Cozy Maker Aesthetic",
    months: "July – September",
    focus: "Toasted pumpkin spices, ribbed coffee mugs, chunky knit accents, and woodland harvest decor.",
    actionableWindow: "Start pinning in early July — Pinterest autumn searches peak in August!",
    topSearches: [
      "Autumn morning coffee mug",
      "Pumpkin shaped ceramic bowls",
      "Earthy stoneware incense burners",
      "Cozy fall desk setup handmade",
      "Halloween artisan clay ghosts",
    ],
  },
  {
    quarter: "Q4",
    season: "Holiday Gifting & Winter Solstice",
    months: "October – December",
    focus: "The highest traffic period for maker shops! Handmade Christmas ornaments, gift sets, and festive dinnerware.",
    actionableWindow: "Start pinning holiday gift guides in September.",
    topSearches: [
      "Handmade ceramic tree ornaments",
      "Ceramic mug gift set with tea",
      "Artisan stocking stuffers under $30",
      "Winter solstice candle holders",
      "Handcrafted pottery gift guide",
    ],
  },
];

export const RISING_TRENDS: TrendItem[] = [
  {
    id: "tr-1",
    topic: "Wabi-Sabi Asymmetrical Ceramics",
    category: "Ceramics & Pottery",
    growth: "+220%",
    peakMonth: "September",
    description: "Shoppers are seeking intentionally imperfect, hand-pinched, organic silhouettes with unglazed clay footings.",
    recommendedTags: ["wabisabi", "handbuiltpottery", "organicceramics", "earthyhome"],
    sampleTitle: "Hand-Pinched Wabi Sabi Matcha Chawan with Raw Clay Foot",
  },
  {
    id: "tr-2",
    topic: "Fluted & Ribbed Stoneware Mugs",
    category: "Ceramics & Pottery",
    growth: "+175%",
    peakMonth: "October",
    description: "Vertical ribbed textures and tactile thumb indentations are dominating aesthetic coffee feeds.",
    recommendedTags: ["flutedmug", "coffeemugaesthetic", "stonewarepottery", "ceramicmug"],
    sampleTitle: "Wheel-Thrown Fluted Ceramic Coffee Mug in Toasted Cream",
  },
  {
    id: "tr-3",
    topic: "Handmade Botanical Wax Melt Burners",
    category: "Home & Living",
    growth: "+140%",
    peakMonth: "November",
    description: "Two-piece ceramic burners pairing artisanal pottery with clean soy wax melts.",
    recommendedTags: ["waxmeltburner", "ceramicburner", "soymelts", "cozyhome"],
    sampleTitle: "Minimalist Stoneware Wax Melt & Essential Oil Burner",
  },
  {
    id: "tr-4",
    topic: "Artisan Coffee Pour-Over Stations",
    category: "Ceramics & Pottery",
    growth: "+115%",
    peakMonth: "December",
    description: "Slow coffee culture: ceramic drippers paired with matching carafes for ritual brewing.",
    recommendedTags: ["pourovercoffee", "ceramicdripper", "slowcoffee", "artisanhome"],
    sampleTitle: "Handcrafted Ceramic Pour Over Coffee Dripper & Mug Set",
  },
  {
    id: "tr-5",
    topic: "Handmade Ceramic Match Strikers",
    category: "Gifting & Holidays",
    growth: "+190%",
    peakMonth: "November",
    description: "Small tabletop clay pots with abrasive textured bases for strike-anywhere matches.",
    recommendedTags: ["matchstriker", "ceramicdecor", "stockingstuffer", "handmadecandle"],
    sampleTitle: "Ribbed Stoneware Match Striker Pot with Matchstick Holder",
  },
  {
    id: "tr-6",
    topic: "Heirloom Carved Wooden Utensils",
    category: "Craft Techniques",
    growth: "+95%",
    peakMonth: "October",
    description: "Spoon carving and faceted timber cutlery finished with organic walnut oil.",
    recommendedTags: ["spooncarving", "woodencutlery", "artisanwood", "slowcraft"],
    sampleTitle: "Hand-Carved Walnut Tasting Spoon with Faceted Handle",
  },
];

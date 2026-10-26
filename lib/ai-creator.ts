export interface AIPinGenerationInput {
  productName: string;
  niche: string;
  tone: string;
  keyword: string;
  shopLink?: string;
}

export interface AIPinGenerationResult {
  titles: string[];
  descriptions: string[];
  altTexts: string[];
  contentBrief: {
    targetAudience: string;
    aestheticMood: string;
    suggestedBoard: string;
    callToAction: string;
  };
  recommendedTags: string[];
}

export interface GraphicTemplate {
  id: string;
  name: string;
  bgGrad: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  badgeText: string;
}

export const PIN_GRAPHIC_TEMPLATES: GraphicTemplate[] = [
  {
    id: "artisan-cream",
    name: "Artisan Parchment",
    bgGrad: "linear-gradient(180deg, #FFFDF9 0%, #FAF2E6 100%)",
    textColor: "#2D2118",
    accentColor: "#9D1C2F",
    fontFamily: "Georgia, serif",
    badgeText: "HANDMADE CERAMICS",
  },
  {
    id: "warm-terracotta",
    name: "Earthy Terracotta",
    bgGrad: "linear-gradient(135deg, #FAF4EB 0%, #F5E5D5 100%)",
    textColor: "#2D2118",
    accentColor: "#C27438",
    fontFamily: "Georgia, serif",
    badgeText: "STUDIO COLLECTION",
  },
  {
    id: "botanical-sage",
    name: "Botanical Sage",
    bgGrad: "linear-gradient(180deg, #F4F8F5 0%, #E8F0EA 100%)",
    textColor: "#1F3826",
    accentColor: "#2E8B57",
    fontFamily: "Georgia, serif",
    badgeText: "SUSTAINABLE CRAFT",
  },
  {
    id: "gift-edition",
    name: "Gift Guide Edition",
    bgGrad: "linear-gradient(180deg, #FFFDF9 0%, #FDF0F2 100%)",
    textColor: "#2D2118",
    accentColor: "#9D1C2F",
    fontFamily: "Georgia, serif",
    badgeText: "ARTISAN GIFT GUIDE",
  },
];

export function generatePinCopy(input: AIPinGenerationInput): AIPinGenerationResult {
  const prod = input.productName.trim() || "Handmade Stoneware Mug";
  const kw = input.keyword.trim() || prod.toLowerCase();
  const niche = input.niche || "Ceramics & Pottery";

  // Synthesize titles
  const titles = [
    `Handmade ${prod} — Slow Crafted ${niche} Inspiration`,
    `The Perfect ${prod} for Cozy Mornings & Mindful Living`,
    `Artisan ${prod} | Sustainable Small-Batch ${kw}`,
  ];

  // Synthesize descriptions with hashtags
  const descriptions = [
    `Handcrafted with organic textures and timeless artisan details. This ${prod.toLowerCase()} brings warmth and natural beauty to your everyday rituals. Wheel thrown in small batches and finished with food-safe earthy glazes. Visit the link to explore the collection. #${kw.replace(/\s+/g, "")} #handmade${niche.replace(/[^a-z]/gi, "").toLowerCase()} #slowcraft #artisanhome #etsyshop`,
    `Looking for the ultimate ${prod.toLowerCase()}? Each piece is slowly shaped by hand, featuring tactile ridges and a smooth comfortable grip. Made for slow coffee mornings and thoughtful gifting. Tap the link to view shop details and styling inspiration. #${kw.replace(/\s+/g, "")} #handmadegifts #cozyhome #ceramiclove`,
  ];

  // Alt text
  const altTexts = [
    `A close-up photograph of a handmade ${prod.toLowerCase()} displayed on a rustic wooden table with soft natural window morning lighting.`,
    `Tactile artisan ${prod.toLowerCase()} showing handcrafted glaze variations and textured clay footing against warm linen.`,
  ];

  // Content brief
  const contentBrief = {
    targetAudience: "Home decor enthusiasts, coffee lovers, and mindful shoppers who cherish handmade uniqueness over mass-produced goods.",
    aestheticMood: "Warm, textured, earthy, sunlit, authentic craft studio vibes.",
    suggestedBoard: `${prod.split(" ")[0]} & ${niche.split("&")[0].trim()} Collection`,
    callToAction: "Tap link to shop small batch releases or save to your home aesthetic board.",
  };

  const recommendedTags = [
    kw.toLowerCase(),
    niche.toLowerCase(),
    "handmade",
    "artisan",
    "maker movement",
    "cozy aesthetic",
  ];

  return {
    titles,
    descriptions,
    altTexts,
    contentBrief,
    recommendedTags,
  };
}

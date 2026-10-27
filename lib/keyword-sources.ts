/**
 * Real Free Keyword Data Sources for Pinterest SEO
 * 
 * 1. Google Autocomplete expansion via suggestqueries.google.com (a-z, question words, prepositions), deduplicated.
 * 2. Datamuse API (api.datamuse.com, no key) for related / semantic terms.
 * 3. Google Trends unofficial endpoints for relative interest (0-100) and rising related queries.
 * 4. Optional PinPinterest API (api.pinpinterest.com) when user provides free key.
 * 
 * Zero fake numbers. Zero heuristic scores. All metrics explicitly labeled with their source.
 */

export interface RealKeywordItem {
  keyword: string;
  source: string; // e.g. "Google Autocomplete (A-Z)", "Datamuse API", "Google Trends"
  sourceLabel: string;
  relativeInterest: number | null; // 0-100 or null if unavailable
  relativeInterestText: string; // e.g. "23/100" or "not available"
  trendSignal: string; // e.g. "+250% rising", "Breakout", "Stable", or "not available"
  trendSource: string; // "Google Trends (Relative Interest 0-100, Unofficial)"
  // PinPinterest fields (api.pinpinterest.com)
  pinCount: string; // formatted count, "not connected", or "not available"
  competition: string; // competition rating, "not connected", or "not available"
  saves: string; // formatted count, "not connected", or "not available"
  estClicks: string; // formatted count, "not connected", or "not available"
  opportunity: string; // score/label, "not connected", or "not available"
  pinSource: string; // "PinPinterest API (api.pinpinterest.com)"
}

export interface KeywordSearchResults {
  seed: string;
  total: number;
  keywords: RealKeywordItem[];
  googleTrendsSeedInterest: number | null;
  googleTrendsStatus: "available" | "not available";
  pinPinterestStatus: "connected" | "not connected" | "error";
  sourcesUsed: string[];
}

/**
 * Fetch suggestions from Google Autocomplete with timeout
 */
async function fetchGoogleAutocomplete(query: string): Promise<string[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return (data[1] as string[]).map((s) => s.trim()).filter((s) => s.length > 0);
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Run Google Autocomplete expansions across:
 * - Direct seed
 * - Letters a through z
 * - Question words
 * - Prepositions
 */
export async function expandGoogleAutocomplete(seed: string): Promise<Array<{ keyword: string; source: string }>> {
  const cleanSeed = seed.trim().toLowerCase();
  if (!cleanSeed) return [];

  const expansions: Array<{ query: string; source: string }> = [
    { query: cleanSeed, source: "Google Autocomplete (Direct)" },
    { query: `${cleanSeed} `, source: "Google Autocomplete (Direct)" },
    { query: `${cleanSeed} pinterest`, source: "Google Autocomplete (Direct)" },
  ];

  // A-Z expansions
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
  for (const letter of alphabet) {
    expansions.push({
      query: `${cleanSeed} ${letter}`,
      source: "Google Autocomplete (A-Z)",
    });
  }

  // Question words
  const questions = ["how to", "what is", "best", "why", "where to buy", "can you", "diy"];
  for (const q of questions) {
    expansions.push({
      query: `${q} ${cleanSeed}`,
      source: "Google Autocomplete (Questions)",
    });
  }

  // Prepositions & common intents
  const prepositions = ["for", "with", "without", "in", "to", "aesthetic", "ideas", "patterns", "designs"];
  for (const p of prepositions) {
    expansions.push({
      query: `${cleanSeed} ${p}`,
      source: "Google Autocomplete (Prepositions)",
    });
  }

  // Fetch concurrently in controlled batches of 8 to prevent network flooding
  const resultsMap = new Map<string, string>();
  const batchSize = 8;
  for (let i = 0; i < expansions.length; i += batchSize) {
    const chunk = expansions.slice(i, i + batchSize);
    const chunkResults = await Promise.allSettled(
      chunk.map(async (item) => {
        const list = await fetchGoogleAutocomplete(item.query);
        return { list, source: item.source };
      })
    );

    for (const r of chunkResults) {
      if (r.status === "fulfilled") {
        for (const kw of r.value.list) {
          // Normalize and remove duplicate "pinterest" if attached
          const cleaned = kw.replace(/\bpinterest\b/gi, "").replace(/\s+/g, " ").trim();
          if (cleaned.length > 2 && cleaned.toLowerCase() !== cleanSeed && !resultsMap.has(cleaned.toLowerCase())) {
            resultsMap.set(cleaned.toLowerCase(), r.value.source);
          }
        }
      }
    }
  }

  return Array.from(resultsMap.entries()).map(([k, s]) => ({
    keyword: k,
    source: s,
  }));
}

/**
 * Fetch semantic / related words from Datamuse API (api.datamuse.com, no key needed)
 */
export async function fetchDatamuseKeywords(seed: string): Promise<Array<{ keyword: string; source: string }>> {
  const cleanSeed = seed.trim().toLowerCase();
  if (!cleanSeed) return [];

  const results: Array<{ keyword: string; source: string }> = [];
  const words = cleanSeed.split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1] || cleanSeed;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    // Call ml (means like) and rel_trg (trigger words) concurrently
    const [mlRes, trgRes] = await Promise.allSettled([
      fetch(`https://api.datamuse.com/words?ml=${encodeURIComponent(cleanSeed)}&max=20`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
      fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(lastWord)}&max=15`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      }),
    ]);
    clearTimeout(timeout);

    const seen = new Set<string>();

    if (mlRes.status === "fulfilled" && mlRes.value.ok) {
      const mlData = await mlRes.value.json();
      if (Array.isArray(mlData)) {
        for (const item of mlData) {
          if (item?.word && typeof item.word === "string") {
            const w = item.word.trim();
            if (w.length > 2 && !w.includes(" ") && !seen.has(w.toLowerCase())) {
              seen.add(w.toLowerCase());
              results.push({
                keyword: `${cleanSeed} ${w}`,
                source: "Datamuse API (Semantic Association)",
              });
            }
          }
        }
      }
    }

    if (trgRes.status === "fulfilled" && trgRes.value.ok) {
      const trgData = await trgRes.value.json();
      if (Array.isArray(trgData)) {
        for (const item of trgData) {
          if (item?.word && typeof item.word === "string") {
            const w = item.word.trim();
            if (w.length > 2 && !seen.has(w.toLowerCase())) {
              seen.add(w.toLowerCase());
              results.push({
                keyword: `${cleanSeed} ${w}`,
                source: "Datamuse API (Context Triggers)",
              });
            }
          }
        }
      }
    }
  } catch {
    // If Datamuse fails, return empty array without inventing numbers
  }

  return results;
}

/**
 * Fetch Google Trends relative interest (0-100) and rising related queries
 * via Google Trends unofficial endpoints.
 * Returns null if blocked or unavailable.
 */
export async function fetchGoogleTrendsData(seed: string): Promise<{
  seedInterest: number | null;
  risingQueries: Array<{ query: string; value: string }>;
  status: "available" | "not available";
}> {
  const cleanSeed = seed.trim().toLowerCase();
  if (!cleanSeed) {
    return { seedInterest: null, risingQueries: [], status: "not available" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    // 1. Fetch explore page to obtain cookie
    const r1 = await fetch(`https://trends.google.com/trends/explore?q=${encodeURIComponent(cleanSeed)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
    });
    const cookie = r1.headers.get("set-cookie") || "";

    // 2. Call explore endpoint for widgets
    const reqPayload = encodeURIComponent(
      JSON.stringify({
        comparisonItem: [{ keyword: cleanSeed, geo: "US", time: "today 12-m" }],
        category: 0,
        property: "",
      })
    );

    const r2 = await fetch(`https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${reqPayload}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        cookie,
      },
      signal: controller.signal,
    });

    if (!r2.ok) {
      clearTimeout(timeout);
      return { seedInterest: null, risingQueries: [], status: "not available" };
    }

    const rawText = await r2.text();
    const jsonStart = rawText.indexOf("{");
    if (jsonStart === -1) {
      clearTimeout(timeout);
      return { seedInterest: null, risingQueries: [], status: "not available" };
    }

    const data = JSON.parse(rawText.substring(jsonStart));
    const widgets = Array.isArray(data.widgets) ? data.widgets : [];

    let seedInterest: number | null = null;
    const risingQueries: Array<{ query: string; value: string }> = [];

    // Parse TIMESERIES for relative interest (0-100)
    const timeseriesWidget = widgets.find((w: any) => w.id === "TIMESERIES");
    if (timeseriesWidget?.request && timeseriesWidget?.token) {
      try {
        const tsUrl = `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=${encodeURIComponent(
          JSON.stringify(timeseriesWidget.request)
        )}&token=${timeseriesWidget.token}`;
        const r3 = await fetch(tsUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cookie,
          },
          signal: controller.signal,
        });
        if (r3.ok) {
          const rawTs = await r3.text();
          const tsJsonStart = rawTs.indexOf("{");
          if (tsJsonStart !== -1) {
            const tsData = JSON.parse(rawTs.substring(tsJsonStart));
            const points = tsData.default?.timelineData;
            if (Array.isArray(points) && points.length > 0) {
              const latest = points[points.length - 1];
              if (Array.isArray(latest.value) && typeof latest.value[0] === "number") {
                seedInterest = latest.value[0];
              }
            }
          }
        }
      } catch {}
    }

    // Parse RELATED_QUERIES for rising queries
    const relatedWidget = widgets.find((w: any) => w.id === "RELATED_QUERIES");
    if (relatedWidget?.request && relatedWidget?.token) {
      try {
        const relUrl = `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=0&req=${encodeURIComponent(
          JSON.stringify(relatedWidget.request)
        )}&token=${relatedWidget.token}`;
        const r4 = await fetch(relUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            cookie,
          },
          signal: controller.signal,
        });
        if (r4.ok) {
          const rawRel = await r4.text();
          const relJsonStart = rawRel.indexOf("{");
          if (relJsonStart !== -1) {
            const relData = JSON.parse(rawRel.substring(relJsonStart));
            const rising = relData.default?.rankedList?.[1]?.rankedKeyword;
            if (Array.isArray(rising)) {
              for (const r of rising.slice(0, 10)) {
                if (r?.query) {
                  risingQueries.push({
                    query: String(r.query),
                    value: String(r.formattedValue || "Rising"),
                  });
                }
              }
            }
          }
        }
      } catch {}
    }

    clearTimeout(timeout);
    return {
      seedInterest,
      risingQueries,
      status: seedInterest !== null || risingQueries.length > 0 ? "available" : "not available",
    };
  } catch {
    return { seedInterest: null, risingQueries: [], status: "not available" };
  }
}

/**
 * Optional PinPinterest API (api.pinpinterest.com) integration.
 * Called ONLY when user provides their own free API key.
 * Shows "not connected" when key is missing.
 * Shows "not available" when call fails or keyword not found. Never invented numbers.
 */
export async function queryPinPinterestAPI(
  keyword: string,
  apiKey?: string
): Promise<{
  pinCount: string;
  competition: string;
  saves: string;
  estClicks: string;
  opportunity: string;
  status: "connected" | "not connected" | "error";
}> {
  const cleanKey = apiKey?.trim();
  if (!cleanKey) {
    return {
      pinCount: "not connected",
      competition: "not connected",
      saves: "not connected",
      estClicks: "not connected",
      opportunity: "not connected",
      status: "not connected",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.pinpinterest.com/v1/keywords?q=${encodeURIComponent(keyword)}&apiKey=${encodeURIComponent(cleanKey)}`,
      {
        headers: {
          Authorization: `Bearer ${cleanKey}`,
          "x-api-key": cleanKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        pinCount: `not available (HTTP ${res.status})`,
        competition: "not available",
        saves: "not available",
        estClicks: "not available",
        opportunity: "not available",
        status: "error",
      };
    }

    const data = await res.json();
    return {
      pinCount: data.pinCount != null ? String(data.pinCount) : "not available",
      competition: data.competition != null ? String(data.competition) : "not available",
      saves: data.saves != null ? String(data.saves) : "not available",
      estClicks: data.estClicks != null ? String(data.estClicks) : "not available",
      opportunity: data.opportunity != null ? String(data.opportunity) : "not available",
      status: "connected",
    };
  } catch (e) {
    return {
      pinCount: "not available (network timeout)",
      competition: "not available",
      saves: "not available",
      estClicks: "not available",
      opportunity: "not available",
      status: "error",
    };
  }
}

/**
 * Main coordinator function to gather all real keyword data
 */
export async function getRealKeywordData(
  seed: string,
  pinpinterestApiKey?: string
): Promise<KeywordSearchResults> {
  const cleanSeed = seed.trim() || "modern decor";

  // Run free real data sources in parallel:
  // 1. Google Autocomplete expansion (a-z, questions, prepositions)
  // 2. Datamuse API (semantic / trigger words)
  // 3. Google Trends (relative interest & rising queries)
  const [autocompleteItems, datamuseItems, trendsData] = await Promise.all([
    expandGoogleAutocomplete(cleanSeed),
    fetchDatamuseKeywords(cleanSeed),
    fetchGoogleTrendsData(cleanSeed),
  ]);

  const allItems: RealKeywordItem[] = [];
  const seenKeywords = new Set<string>();

  // Add seed keyword first
  seenKeywords.add(cleanSeed.toLowerCase());
  allItems.push({
    keyword: cleanSeed,
    source: "Seed Keyword (Direct)",
    sourceLabel: "Seed",
    relativeInterest: trendsData.seedInterest,
    relativeInterestText:
      trendsData.seedInterest !== null ? `${trendsData.seedInterest}/100` : "not available",
    trendSignal:
      trendsData.seedInterest !== null
        ? `Relative Interest: ${trendsData.seedInterest}/100`
        : "not available",
    trendSource: "Google Trends (Relative Interest 0-100, Unofficial)",
    pinCount: "not connected",
    competition: "not connected",
    saves: "not connected",
    estClicks: "not connected",
    opportunity: "not connected",
    pinSource: "PinPinterest API (api.pinpinterest.com)",
  });

  // Add Google Trends Rising Queries
  for (const rq of trendsData.risingQueries) {
    const kLower = rq.query.toLowerCase();
    if (!seenKeywords.has(kLower)) {
      seenKeywords.add(kLower);
      allItems.push({
        keyword: rq.query,
        source: "Google Trends (Rising Query)",
        sourceLabel: "Google Trends",
        relativeInterest: null,
        relativeInterestText: "not available",
        trendSignal: `${rq.value} relative growth`,
        trendSource: "Google Trends (Relative Interest 0-100, Unofficial)",
        pinCount: "not connected",
        competition: "not connected",
        saves: "not connected",
        estClicks: "not connected",
        opportunity: "not connected",
        pinSource: "PinPinterest API (api.pinpinterest.com)",
      });
    }
  }

  // Add Google Autocomplete Items
  for (const item of autocompleteItems) {
    const kLower = item.keyword.toLowerCase();
    if (!seenKeywords.has(kLower)) {
      seenKeywords.add(kLower);
      allItems.push({
        keyword: item.keyword,
        source: item.source,
        sourceLabel: "Google Autocomplete",
        relativeInterest: null,
        relativeInterestText: "not available",
        trendSignal: "not available",
        trendSource: "Google Trends (Relative Interest 0-100, Unofficial)",
        pinCount: "not connected",
        competition: "not connected",
        saves: "not connected",
        estClicks: "not connected",
        opportunity: "not connected",
        pinSource: "PinPinterest API (api.pinpinterest.com)",
      });
    }
  }

  // Add Datamuse Items
  for (const item of datamuseItems) {
    const kLower = item.keyword.toLowerCase();
    if (!seenKeywords.has(kLower)) {
      seenKeywords.add(kLower);
      allItems.push({
        keyword: item.keyword,
        source: item.source,
        sourceLabel: "Datamuse API",
        relativeInterest: null,
        relativeInterestText: "not available",
        trendSignal: "not available",
        trendSource: "Google Trends (Relative Interest 0-100, Unofficial)",
        pinCount: "not connected",
        competition: "not connected",
        saves: "not connected",
        estClicks: "not connected",
        opportunity: "not connected",
        pinSource: "PinPinterest API (api.pinpinterest.com)",
      });
    }
  }

  // 4. If PinPinterest key is provided, query top keywords (up to 15 to stay within reasonable execution time)
  let pinStatus: "connected" | "not connected" | "error" = "not connected";
  if (pinpinterestApiKey?.trim()) {
    pinStatus = "connected";
    const sampleKeywords = allItems.slice(0, 12);
    const pinResults = await Promise.allSettled(
      sampleKeywords.map((k) => queryPinPinterestAPI(k.keyword, pinpinterestApiKey))
    );

    pinResults.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        allItems[idx].pinCount = res.value.pinCount;
        allItems[idx].competition = res.value.competition;
        allItems[idx].saves = res.value.saves;
        allItems[idx].estClicks = res.value.estClicks;
        allItems[idx].opportunity = res.value.opportunity;
        if (res.value.status === "error") {
          pinStatus = "error";
        }
      }
    });
  }

  return {
    seed: cleanSeed,
    total: allItems.length,
    keywords: allItems,
    googleTrendsSeedInterest: trendsData.seedInterest,
    googleTrendsStatus: trendsData.status,
    pinPinterestStatus: pinStatus,
    sourcesUsed: [
      "Google Autocomplete Expansion (suggestqueries.google.com)",
      "Datamuse Semantic Association (api.datamuse.com)",
      "Google Trends Unofficial Endpoints (trends.google.com)",
      pinpinterestApiKey?.trim()
        ? "PinPinterest API (api.pinpinterest.com - Connected)"
        : "PinPinterest API (api.pinpinterest.com - Disconnected)",
    ],
  };
}

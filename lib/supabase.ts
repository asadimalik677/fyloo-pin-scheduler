import { storeGet, storeSet, kvConfigured } from "./store";

// Supabase Free Cloud Tier configuration (via Vercel environment variables)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

/**
 * Cloud database abstraction:
 * If Supabase environment variables are provided in Vercel, queries Supabase REST API.
 * Otherwise, falls back seamlessly to the Vercel KV / durable store layer.
 * Zero server required on user laptop.
 */
export async function cloudStoreGet<T>(key: string, defaultValue: T): Promise<T> {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/app_store?key=eq.${encodeURIComponent(key)}&select=value`, {
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        cache: "no-store",
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0 && rows[0].value) {
          return JSON.parse(rows[0].value) as T;
        }
      }
    } catch (e) {
      console.warn("Supabase fetch fallback to store:", e);
    }
  }

  // Durable store fallback
  const raw = await storeGet(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export async function cloudStoreSet<T>(key: string, value: T): Promise<void> {
  const jsonStr = JSON.stringify(value);

  if (isSupabaseConfigured()) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/app_store`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY!,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({ key, value: jsonStr, updated_at: new Date().toISOString() }),
      });
    } catch (e) {
      console.warn("Supabase upsert fallback to store:", e);
    }
  }

  // Always sync with durable store layer
  await storeSet(key, jsonStr);
}

export function getDatabaseProvider(): "supabase_cloud" | "vercel_kv" | "local_store" {
  if (isSupabaseConfigured()) return "supabase_cloud";
  if (kvConfigured()) return "vercel_kv";
  return "local_store";
}

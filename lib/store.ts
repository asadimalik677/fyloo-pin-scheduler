import fs from "fs";
import path from "path";

// Durable store: Vercel KV (Upstash Redis REST) when env vars are present,
// otherwise a local JSON file under data/ (dev only, NOT durable on Vercel
// serverless functions). See README for KV setup.
const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function dataFile(key: string): string {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, key.replace(/[^a-z0-9_-]/gi, "_") + ".json");
}

async function kvGet(key: string): Promise<string | null> {
  const res = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`KV GET failed: ${res.status}`);
  const json = await res.json();
  return json.result ?? null;
}

async function kvSet(key: string, value: string): Promise<void> {
  const res = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  if (!res.ok) throw new Error(`KV SET failed: ${res.status}`);
}

export async function storeGet(key: string): Promise<string | null> {
  if (KV_URL && KV_TOKEN) return kvGet(key);
  const file = dataFile(key);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}

export async function storeSet(key: string, value: string): Promise<void> {
  if (KV_URL && KV_TOKEN) return kvSet(key, value);
  fs.writeFileSync(dataFile(key), value, "utf8");
}

export function kvConfigured(): boolean {
  return Boolean(KV_URL && KV_TOKEN);
}

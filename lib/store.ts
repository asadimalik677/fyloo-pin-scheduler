import fs from "fs";
import path from "path";

// Durable store: Vercel KV (Upstash Redis REST) when env vars are present,
// otherwise a local JSON file under data/ (dev only, NOT durable on Vercel
// serverless functions). See README for KV setup.
const KV_URL = process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function dataFile(key: string): string {
  // On Vercel serverless the filesystem is read-only except /tmp, and
  // creating directories during a read throws a server-side exception.
  // Never mkdir on read paths; writes handle their own fallback.
  const dir = process.env.VERCEL ? "/tmp/fyloo-pin-scheduler-data" : path.join(process.cwd(), "data");
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
  const file = dataFile(key);
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  } catch {
    // Read-only filesystem (Vercel without KV): local writes are best-effort.
  }
  fs.writeFileSync(file, value, "utf8");
}

export function kvConfigured(): boolean {
  return Boolean(KV_URL && KV_TOKEN);
}

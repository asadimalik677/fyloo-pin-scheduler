import { storeGet, storeSet } from "./store";

export interface PinterestTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

const KEY = "fyloo:token";

export async function getTokens(): Promise<PinterestTokens | null> {
  if (process.env.PINTEREST_ACCESS_TOKEN) {
    return { access_token: process.env.PINTEREST_ACCESS_TOKEN };
  }
  const raw = await storeGet(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PinterestTokens;
  } catch {
    return null;
  }
}

export async function saveTokens(tokens: PinterestTokens): Promise<void> {
  await storeSet(KEY, JSON.stringify(tokens));
}

export async function isConnected(): Promise<boolean> {
  return (await getTokens()) !== null;
}

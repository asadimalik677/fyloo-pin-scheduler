import { getTokens, saveTokens, PinterestTokens } from "./token";

const API = "https://api.pinterest.com/v5";
const TOKEN_URL = "https://api.pinterest.com/v5/oauth/token";

export class PinterestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function refreshTokens(refreshToken: string): Promise<PinterestTokens> {
  const basic = Buffer.from(
    `${process.env.PINTEREST_CLIENT_ID}:${process.env.PINTEREST_CLIENT_SECRET}`
  ).toString("base64");
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) {
    throw new PinterestError(res.status, `Token refresh failed: ${await res.text()}`);
  }
  const json = await res.json();
  const tokens: PinterestTokens = {
    access_token: json.access_token,
    refresh_token: json.refresh_token ?? refreshToken,
    expires_at: json.expires_in ? Date.now() + json.expires_in * 1000 : undefined,
  };
  await saveTokens(tokens);
  return tokens;
}

export async function getAccessToken(): Promise<string> {
  const tokens = await getTokens();
  if (!tokens) throw new PinterestError(401, "Pinterest not connected. Visit / to connect.");
  if (
    tokens.expires_at &&
    tokens.expires_at < Date.now() + 60_000 &&
    tokens.refresh_token &&
    !process.env.PINTEREST_ACCESS_TOKEN
  ) {
    const fresh = await refreshTokens(tokens.refresh_token);
    return fresh.access_token;
  }
  return tokens.access_token;
}

async function api(path: string, init: RequestInit = {}): Promise<any> {
  const token = await getAccessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new PinterestError(res.status, `Pinterest API ${path} failed: ${await res.text()}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  pin_count?: number;
}

export async function listBoards(): Promise<Board[]> {
  const json = await api("/boards?page_size=100");
  return json.items ?? [];
}

export async function createBoard(name: string, description?: string): Promise<Board> {
  return api("/boards", {
    method: "POST",
    body: JSON.stringify({ name, description: description || undefined }),
  });
}

export interface RegisteredMedia {
  media_id: string;
  upload_url: string;
  upload_parameters: Record<string, string>;
}

// Step 1 of the media upload flow: register the media asset.
export async function registerMedia(): Promise<RegisteredMedia> {
  return api("/media", {
    method: "POST",
    body: JSON.stringify({ media_type: "image" }),
  });
}

// Step 2: upload the image bytes to the returned upload URL.
export async function uploadMedia(
  media: RegisteredMedia,
  bytes: Buffer,
  filename: string,
  contentType: string
): Promise<void> {
  const form = new FormData();
  for (const [key, value] of Object.entries(media.upload_parameters)) {
    form.append(key, value);
  }
  form.append("file", new Blob([bytes], { type: contentType }), filename);
  const res = await fetch(media.upload_url, { method: "POST", body: form });
  if (!res.ok) {
    throw new PinterestError(res.status, `Media upload failed: ${await res.text()}`);
  }
}

// Step 3: wait until Pinterest finishes processing the upload.
export async function waitForMedia(mediaId: string): Promise<void> {
  for (let i = 0; i < 20; i++) {
    const json = await api(`/media/${mediaId}`);
    if (json.status === "succeeded") return;
    if (json.status === "failed") throw new PinterestError(400, "Media processing failed");
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new PinterestError(408, "Timed out waiting for media processing");
}

export interface CreatePinInput {
  board_id: string;
  media_id: string;
  title: string;
  description?: string;
  link?: string;
}

// Step 4: create the pin from the uploaded media.
export async function createPinFromMedia(input: CreatePinInput): Promise<any> {
  return api("/pins", {
    method: "POST",
    body: JSON.stringify({
      board_id: input.board_id,
      title: input.title,
      description: input.description || undefined,
      link: input.link || undefined,
      media_source: { source_type: "image", media_id: input.media_id },
    }),
  });
}

// Full flow: register, upload, wait, create. Returns the created pin.
export async function createPinFromImage(
  bytes: Buffer,
  filename: string,
  contentType: string,
  input: Omit<CreatePinInput, "media_id">
): Promise<any> {
  const media = await registerMedia();
  await uploadMedia(media, bytes, filename, contentType);
  await waitForMedia(media.media_id);
  return createPinFromMedia({ ...input, media_id: media.media_id });
}

// Queue flow: register + upload now, store media_id for later pin creation.
export async function prepareMediaForQueue(
  bytes: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const media = await registerMedia();
  await uploadMedia(media, bytes, filename, contentType);
  await waitForMedia(media.media_id);
  return media.media_id;
}

// Tags: Pinterest API v5 has no tag field on pin creation, so tags are
// appended as hashtags at the end of the description (documented in README).
export function withTags(description: string, tags: string[]): string {
  const clean = tags.map((t) => t.trim()).filter(Boolean);
  if (clean.length === 0) return description;
  const hashes = clean.map((t) => `#${t.replace(/^#/, "").replace(/\s+/g, "")}`).join(" ");
  return description ? `${description} ${hashes}` : hashes;
}

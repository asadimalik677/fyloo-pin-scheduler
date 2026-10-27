import { cloudStoreGet, cloudStoreSet } from "./supabase";

export interface DraftItem {
  id: string;
  board_id?: string;
  board_name?: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image_data?: string;
  image_name?: string;
  created_at: string;
  updated_at: string;
}

const KEY = "fyloo:drafts";

export async function listDrafts(): Promise<DraftItem[]> {
  return cloudStoreGet<DraftItem[]>(KEY, []);
}

export async function saveDrafts(items: DraftItem[]): Promise<void> {
  await cloudStoreSet(KEY, items);
}

export async function saveDraft(item: DraftItem): Promise<DraftItem> {
  const drafts = await listDrafts();
  const existingIdx = drafts.findIndex((d) => d.id === item.id);
  if (existingIdx >= 0) {
    drafts[existingIdx] = { ...drafts[existingIdx], ...item, updated_at: new Date().toISOString() };
  } else {
    drafts.unshift(item);
  }
  await saveDrafts(drafts);
  return item;
}

export async function deleteDraft(id: string): Promise<boolean> {
  const drafts = await listDrafts();
  const initialLen = drafts.length;
  const filtered = drafts.filter((d) => d.id !== id);
  if (filtered.length !== initialLen) {
    await saveDrafts(filtered);
    return true;
  }
  return false;
}

export async function getDraft(id: string): Promise<DraftItem | null> {
  const drafts = await listDrafts();
  return drafts.find((d) => d.id === id) ?? null;
}

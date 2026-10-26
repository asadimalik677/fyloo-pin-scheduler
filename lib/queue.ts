import { storeGet, storeSet, kvConfigured } from "./store";

export interface QueueItem {
  id: string;
  media_id: string;
  board_id: string;
  board_name?: string;
  title: string;
  description: string;
  tags: string[];
  link?: string;
  scheduled_at: string; // ISO string
  status: "queued" | "published" | "failed";
  error?: string;
  pin_id?: string;
  created_at: string;
  image_url?: string;
}

const KEY = "fyloo:queue";

export async function listQueue(): Promise<QueueItem[]> {
  const raw = await storeGet(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueueItem[];
  } catch {
    return [];
  }
}

export async function saveQueue(items: QueueItem[]): Promise<void> {
  await storeSet(KEY, JSON.stringify(items));
}

export async function addQueueItem(item: QueueItem): Promise<QueueItem> {
  const items = await listQueue();
  items.push(item);
  await saveQueue(items);
  return item;
}

export async function deleteQueueItem(id: string): Promise<boolean> {
  const items = await listQueue();
  const initialLength = items.length;
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length !== initialLength) {
    await saveQueue(filtered);
    return true;
  }
  return false;
}

export async function updateQueueItem(
  id: string,
  updates: Partial<Omit<QueueItem, "id" | "media_id" | "created_at">>
): Promise<QueueItem | null> {
  const items = await listQueue();
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates };
  await saveQueue(items);
  return items[idx];
}

export async function bulkAddQueueItems(newItems: QueueItem[]): Promise<QueueItem[]> {
  const items = await listQueue();
  items.push(...newItems);
  await saveQueue(items);
  return newItems;
}

export function queueDurable(): boolean {
  return kvConfigured();
}


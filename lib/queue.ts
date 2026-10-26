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

export function queueDurable(): boolean {
  return kvConfigured();
}

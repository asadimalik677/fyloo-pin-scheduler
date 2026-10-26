import { getTokens, isConnected } from "./token";
import { listQueue, updateQueueItem, QueueItem, queueDurable } from "./queue";
import { createPinFromMedia, withTags } from "./pinterest";
import { getDatabaseProvider } from "./supabase";

export interface AutomationDiagnostics {
  connected: boolean;
  tokenExpiresAt?: number;
  hasRefreshToken: boolean;
  databaseProvider: "supabase_cloud" | "vercel_kv" | "local_store";
  queueStats: {
    total: number;
    queued: number;
    published: number;
    failed: number;
  };
  failedItems: QueueItem[];
  cronConfig: {
    path: string;
    schedule: string;
    hasCronSecret: boolean;
  };
}

export async function getAutomationDiagnostics(): Promise<AutomationDiagnostics> {
  const tokens = await getTokens();
  const connected = await isConnected();
  const queue = await listQueue();

  const queued = queue.filter((i) => i.status === "queued");
  const published = queue.filter((i) => i.status === "published");
  const failed = queue.filter((i) => i.status === "failed");

  return {
    connected,
    tokenExpiresAt: tokens?.expires_at,
    hasRefreshToken: Boolean(tokens?.refresh_token),
    databaseProvider: getDatabaseProvider(),
    queueStats: {
      total: queue.length,
      queued: queued.length,
      published: published.length,
      failed: failed.length,
    },
    failedItems: failed,
    cronConfig: {
      path: "/api/publish-due",
      schedule: "Daily at 00:00 UTC (Vercel Cron)",
      hasCronSecret: Boolean(process.env.CRON_SECRET),
    },
  };
}

export async function retryFailedPin(id: string): Promise<{ success: boolean; pinId?: string; error?: string }> {
  const queue = await listQueue();
  const item = queue.find((i) => i.id === id);
  if (!item) return { success: false, error: "Queue item not found" };

  try {
    const pin = await createPinFromMedia({
      board_id: item.board_id,
      media_id: item.media_id,
      title: item.title,
      description: withTags(item.description, item.tags),
      link: item.link,
    });

    await updateQueueItem(item.id, {
      status: "published",
      pin_id: pin.id,
      error: undefined,
    });

    return { success: true, pinId: pin.id };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "Retry failed";
    await updateQueueItem(item.id, {
      status: "failed",
      error: errMsg,
    });
    return { success: false, error: errMsg };
  }
}

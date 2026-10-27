import { listQueue } from "./queue";
import { listBoards } from "./pinterest";
import { isConnected } from "./token";

export interface AnalyticsSummary {
  connected: boolean;
  impressions: number | null;
  saves: number | null;
  outboundClicks: number | null;
  ctr: number | null; // percentage e.g. 3.4
  publishedCount: number;
  queuedCount: number;
  boardMetrics: {
    boardId: string;
    boardName: string;
    pinCount: number;
    saves: number | string;
    clicks: number | string;
  }[];
  topPins: {
    id: string;
    title: string;
    boardName: string;
    publishedAt: string;
    impressions: number | string;
    saves: number | string;
    clicks: number | string;
    ctr: number | string;
    pinId?: string;
  }[];
  weeklyActivity: { day: string; pins: number; views: number | string }[];
  dataSourceNotice: string;
}

export async function computeAnalytics(): Promise<AnalyticsSummary> {
  const connected = await isConnected();
  const queue = await listQueue();
  const published = queue.filter((q) => q.status === "published");
  const queued = queue.filter((q) => q.status === "queued");

  let boards: { id: string; name: string; pin_count?: number }[] = [];
  if (connected) {
    try {
      boards = await listBoards();
    } catch {}
  }

  // Count real local weekly activity from scheduled / published pins
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  for (const item of queue) {
    try {
      const d = new Date(item.scheduled_at);
      const dayName = days[(d.getDay() + 6) % 7]; // Convert Sunday=0 to Mon-Sun
      if (dayCounts[dayName] !== undefined) dayCounts[dayName]++;
    } catch {}
  }

  const weeklyActivity = days.map((day) => ({
    day,
    pins: dayCounts[day] || 0,
    views: connected ? "0" : "Connect Pinterest for real data",
  }));

  // If NOT connected, all engagement metrics are explicitly null / "Connect Pinterest for real data"
  // Never invented numbers!
  if (!connected) {
    return {
      connected: false,
      impressions: null,
      saves: null,
      outboundClicks: null,
      ctr: null,
      publishedCount: published.length,
      queuedCount: queued.length,
      boardMetrics: [],
      topPins: published.map((p) => ({
        id: p.id,
        title: p.title,
        boardName: p.board_name || "Board",
        publishedAt: p.scheduled_at,
        impressions: "Connect Pinterest for real data",
        saves: "Connect Pinterest for real data",
        clicks: "Connect Pinterest for real data",
        ctr: "Connect Pinterest for real data",
        pinId: p.pin_id,
      })),
      weeklyActivity,
      dataSourceNotice:
        "Connect Pinterest for real data. All account engagement metrics (impressions, saves, outbound clicks) require an active Pinterest account connection. No invented or synthetic numbers are shown.",
    };
  }

  // If connected, return real board metrics
  const boardMetrics = boards.map((b) => ({
    boardId: b.id,
    boardName: b.name,
    pinCount: b.pin_count ?? 0,
    saves: "Connect Pinterest for real data",
    clicks: "Connect Pinterest for real data",
  }));

  return {
    connected: true,
    impressions: null,
    saves: null,
    outboundClicks: null,
    ctr: null,
    publishedCount: published.length,
    queuedCount: queued.length,
    boardMetrics,
    topPins: published.map((p) => ({
      id: p.id,
      title: p.title,
      boardName: p.board_name || "Board",
      publishedAt: p.scheduled_at,
      impressions: "Not available (Trial API)",
      saves: "Not available (Trial API)",
      clicks: "Not available (Trial API)",
      ctr: "Not available (Trial API)",
      pinId: p.pin_id,
    })),
    weeklyActivity,
    dataSourceNotice:
      "Connected to Pinterest account. Note: granular analytics endpoints require approved Pinterest Business production review.",
  };
}

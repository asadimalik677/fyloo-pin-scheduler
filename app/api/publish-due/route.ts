import { NextResponse } from "next/server";
import { createPinFromMedia, withTags } from "../../../lib/pinterest";
import { listQueue, saveQueue } from "../../../lib/queue";

export const dynamic = "force-dynamic";

// Publishes every queued pin whose scheduled time has arrived.
// Called by Vercel Cron (daily on Hobby) or an external cron. If CRON_SECRET
// is set, the caller must send Authorization: Bearer <secret>.
async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    if (!isVercelCron && auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const items = await listQueue();
  const now = new Date();
  let published = 0;
  const results: { id: string; title: string; status: string; pin_id?: string; error?: string }[] = [];
  for (const item of items) {
    if (item.status !== "queued") continue;
    if (new Date(item.scheduled_at) > now) continue;
    try {
      const pin = await createPinFromMedia({
        board_id: item.board_id,
        media_id: item.media_id,
        title: item.title,
        description: withTags(item.description, item.tags),
        link: item.link,
      });
      item.status = "published";
      item.pin_id = pin.id;
      published++;
      results.push({ id: item.id, title: item.title, status: "published", pin_id: pin.id });
    } catch (e) {
      item.status = "failed";
      item.error = e instanceof Error ? e.message : "Unknown error";
      results.push({ id: item.id, title: item.title, status: "failed", error: item.error });
    }
  }
  await saveQueue(items);
  return NextResponse.json({ published, results });
}

export async function GET(req: Request) {
  return run(req);
}

export async function POST(req: Request) {
  return run(req);
}

import { NextResponse } from "next/server";
import { bulkAddQueueItems, QueueItem, queueDurable } from "../../../../lib/queue";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body?.items as Partial<QueueItem>[];
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items array is required" }, { status: 400 });
    }

    const validatedItems: QueueItem[] = items.map((it) => ({
      id: it.id || crypto.randomUUID(),
      media_id: it.media_id || "",
      board_id: it.board_id || "",
      board_name: it.board_name,
      title: it.title || "Untitled Pin",
      description: it.description || "",
      tags: Array.isArray(it.tags) ? it.tags : [],
      link: it.link,
      scheduled_at: it.scheduled_at ? new Date(it.scheduled_at).toISOString() : new Date().toISOString(),
      status: (it.status as any) || "queued",
      created_at: it.created_at || new Date().toISOString(),
      image_url: it.image_url,
    }));

    const added = await bulkAddQueueItems(validatedItems);
    return NextResponse.json({ items: added, durable: queueDurable() }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to bulk add items" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prepareMediaForQueue, PinterestError } from "../../../lib/pinterest";
import { listQueue, addQueueItem, queueDurable } from "../../../lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listQueue();
  return NextResponse.json({ items, durable: queueDurable() });
}

// Add a scheduled pin. Multipart form: image (file), board_id, title,
// description, link, tags (comma separated), scheduled_at (ISO string).
// The image is uploaded to Pinterest immediately and its media_id is stored;
// the pin itself is created later by /api/publish-due.
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image") as File | null;
    const boardId = form.get("board_id") as string | null;
    const title = form.get("title") as string | null;
    const scheduledAt = form.get("scheduled_at") as string | null;
    if (!file || !boardId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: "image, board_id, title and scheduled_at are required" },
        { status: 400 }
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const mediaId = await prepareMediaForQueue(bytes, file.name, file.type || "image/jpeg");
    const item = await addQueueItem({
      id: crypto.randomUUID(),
      media_id: mediaId,
      board_id: boardId,
      title,
      description: (form.get("description") as string | null) ?? "",
      tags: ((form.get("tags") as string | null) ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      link: (form.get("link") as string | null) ?? undefined,
      scheduled_at: new Date(scheduledAt).toISOString(),
      status: "queued",
      created_at: new Date().toISOString(),
    });
    return NextResponse.json({ item, durable: queueDurable() }, { status: 201 });
  } catch (e) {
    const err = e as PinterestError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

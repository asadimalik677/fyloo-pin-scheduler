import { NextResponse } from "next/server";
import { prepareMediaForQueue, PinterestError } from "../../../lib/pinterest";
import {
  listQueue,
  addQueueItem,
  deleteQueueItem,
  updateQueueItem,
  queueDurable,
} from "../../../lib/queue";

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
    const boardName = (form.get("board_name") as string | null) ?? undefined;
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

    // Optional base64 thumbnail if file is within reasonable size for KV storage
    let imageUrl: string | undefined = undefined;
    if (bytes.length < 350_000) {
      imageUrl = `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
    }

    const item = await addQueueItem({
      id: crypto.randomUUID(),
      media_id: mediaId,
      board_id: boardId,
      board_name: boardName,
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
      image_url: imageUrl,
    });
    return NextResponse.json({ item, durable: queueDurable() }, { status: 201 });
  } catch (e) {
    const err = e as PinterestError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

// Delete a queued item
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // ignore body parse error if no body
      }
    }
    if (!id) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }
    const deleted = await deleteQueueItem(id);
    if (!deleted) {
      return NextResponse.json({ error: "Queue item not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete item" },
      { status: 500 }
    );
  }
}

// Update / Reschedule a queue item
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const updated = await updateQueueItem(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "Queue item not found" }, { status: 404 });
    }
    return NextResponse.json({ item: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to update item" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { listDrafts, saveDraft, deleteDraft, DraftItem } from "../../../lib/drafts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const drafts = await listDrafts();
    return NextResponse.json({ drafts });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load drafts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let data: Partial<DraftItem> = {};

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const id = (form.get("id") as string) || crypto.randomUUID();
      const boardId = (form.get("board_id") as string) || undefined;
      const boardName = (form.get("board_name") as string) || undefined;
      const title = (form.get("title") as string) || "Untitled Draft";
      const description = (form.get("description") as string) || "";
      const tags = ((form.get("tags") as string) || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const link = (form.get("link") as string) || undefined;
      const file = form.get("image") as File | null;
      let imageData: string | undefined = undefined;
      let imageName: string | undefined = undefined;

      if (file && file.size > 0) {
        const bytes = Buffer.from(await file.arrayBuffer());
        imageData = `data:${file.type || "image/jpeg"};base64,${bytes.toString("base64")}`;
        imageName = file.name;
      } else {
        imageData = (form.get("image_data") as string) || undefined;
        imageName = (form.get("image_name") as string) || undefined;
      }

      data = {
        id,
        board_id: boardId,
        board_name: boardName,
        title,
        description,
        tags,
        link,
        image_data: imageData,
        image_name: imageName,
      };
    } else {
      data = await req.json();
    }

    const draft: DraftItem = {
      id: data.id || crypto.randomUUID(),
      board_id: data.board_id,
      board_name: data.board_name,
      title: data.title || "Untitled Draft",
      description: data.description || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      link: data.link,
      image_data: data.image_data,
      image_name: data.image_name,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveDraft(draft);
    return NextResponse.json({ draft: saved }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get("id");
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {
        // ignore JSON parse error
      }
    }
    if (!id) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }
    const deleted = await deleteDraft(id);
    if (!deleted) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete draft" },
      { status: 500 }
    );
  }
}

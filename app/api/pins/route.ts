import { NextResponse } from "next/server";
import { createPinFromImage, withTags, PinterestError } from "../../../lib/pinterest";

export const dynamic = "force-dynamic";

// Create a pin NOW. Multipart form: image (file), board_id, title,
// description, link, tags (comma separated).
export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Unsupported Media Type. This endpoint requires multipart/form-data with an image file." },
      { status: 415 }
    );
  }

  try {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return NextResponse.json(
        { error: "Failed to parse multipart form data." },
        { status: 400 }
      );
    }

    const file = form.get("image") as File | null;
    const boardId = form.get("board_id") as string | null;
    const title = form.get("title") as string | null;
    if (!file || !boardId || !title) {
      return NextResponse.json({ error: "image, board_id and title are required" }, { status: 400 });
    }
    const description = (form.get("description") as string | null) ?? "";
    const tags = ((form.get("tags") as string | null) ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const link = (form.get("link") as string | null) ?? undefined;
    const bytes = Buffer.from(await file.arrayBuffer());
    const pin = await createPinFromImage(bytes, file.name, file.type || "image/jpeg", {
      board_id: boardId,
      title,
      description: withTags(description, tags),
      link,
    });
    return NextResponse.json({ pin }, { status: 201 });
  } catch (e) {
    const err = e as PinterestError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

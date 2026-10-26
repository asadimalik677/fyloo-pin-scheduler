import { NextResponse } from "next/server";
import { getSavedLists, saveKeywordList, deleteKeywordList } from "../../../../lib/keywords";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lists = await getSavedLists();
    return NextResponse.json({ lists });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load lists" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "List name is required" }, { status: 400 });
    }
    const list = {
      id: body.id || `list-${crypto.randomUUID().slice(0, 8)}`,
      name: body.name,
      keywords: Array.isArray(body.keywords) ? body.keywords : [],
      created_at: body.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const lists = await saveKeywordList(list);
    return NextResponse.json({ list, lists }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to save list" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const lists = await deleteKeywordList(id);
    return NextResponse.json({ success: true, lists });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete list" },
      { status: 500 }
    );
  }
}

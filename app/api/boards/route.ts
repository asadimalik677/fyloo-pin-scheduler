import { NextResponse } from "next/server";
import { listBoards, createBoard, PinterestError } from "../../../lib/pinterest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ boards: await listBoards() });
  } catch (e) {
    const err = e as PinterestError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name) return NextResponse.json({ error: "name is required" }, { status: 400 });
    const board = await createBoard(body.name, body.description);
    return NextResponse.json({ board }, { status: 201 });
  } catch (e) {
    const err = e as PinterestError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

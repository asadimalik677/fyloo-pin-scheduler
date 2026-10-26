import { NextResponse } from "next/server";
import { listBoardPins, PinterestError } from "../../../../../lib/pinterest";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pins = await listBoardPins(params.id);
    return NextResponse.json({ pins });
  } catch (e) {
    const err = e as PinterestError;
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentSession, getSupabaseAuthConfig } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  const { configured } = getSupabaseAuthConfig();
  return NextResponse.json({
    authenticated: Boolean(session),
    user: session,
    provider: configured ? "supabase_auth" : "store_auth",
    supabaseConfigured: configured,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncFromSheet } from "@/lib/sheets-sync";

function checkSecret(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.SYNC_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("sync_log")
      .select("synced_at, rows_upserted, errors, source")
      .order("synced_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return NextResponse.json({ lastSync: data ?? null });
  } catch (err) {
    return NextResponse.json({ lastSync: null, error: String(err) });
  }
}

export async function POST(req: NextRequest) {
  if (!checkSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncFromSheet();
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

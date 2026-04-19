import { NextRequest, NextResponse } from "next/server";
import { syncFromSheet } from "@/lib/sheets-sync";

// Called by Vercel Cron every hour (configured in vercel.json).
// Vercel automatically sets CRON_SECRET and sends it as a Bearer token.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncFromSheet();
  return NextResponse.json(result);
}

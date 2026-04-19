import { NextRequest, NextResponse } from "next/server";
import { publishListing } from "@/lib/admin-listings";

function checkAuth(req: NextRequest) {
  const code = req.headers.get("x-admin-code");
  return code === (process.env.ADMIN_CODE ?? "test");
}

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const res = await publishListing(id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

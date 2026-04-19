import { NextRequest, NextResponse } from "next/server";
import { getAdminListing, updateListing, deleteListing } from "@/lib/admin-listings";

function checkAuth(req: NextRequest) {
  const code = req.headers.get("x-admin-code");
  return code === (process.env.ADMIN_CODE ?? "test");
}

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const res = await getAdminListing(id);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  if (!res.listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing: res.listing });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const res = await updateListing(id, body);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const mode = (new URL(req.url).searchParams.get("mode") ?? "soft") as "soft" | "hard";
  const res = await deleteListing(id, mode);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

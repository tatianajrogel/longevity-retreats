import { NextRequest, NextResponse } from "next/server";
import { getAllListings, createListing } from "@/lib/admin-listings";

function checkAuth(req: NextRequest) {
  const code = req.headers.get("x-admin-code");
  return code === (process.env.ADMIN_CODE ?? "test");
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await getAllListings();
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
  return NextResponse.json({ listings: res.listings });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const res = await createListing(body);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ id: res.id }, { status: 201 });
}

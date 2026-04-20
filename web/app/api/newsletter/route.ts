import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  const apiKey = process.env.BEEHIIV_API_KEY;

  if (!pubId || !apiKey) {
    return NextResponse.json({ error: "newsletter not configured" }, { status: 503 });
  }

  const res = await fetch(`https://api.beehiiv.com/v2/publications/${pubId}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      email,
      reactivate_existing: false,
      send_welcome_email: true,
      utm_source: "website",
      utm_medium: "organic",
    }),
  });

  if (res.status === 409 || res.ok) {
    return NextResponse.json({ ok: true }, { status: res.ok ? 200 : 409 });
  }

  const body = await res.json().catch(() => ({}));
  return NextResponse.json({ error: body?.message ?? "subscription failed" }, { status: 500 });
}

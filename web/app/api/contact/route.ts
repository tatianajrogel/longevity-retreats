import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json().catch(() => ({}));
  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("contact_submissions")
      .insert({ name, email, message });

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact submission error:", err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}

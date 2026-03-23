import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicKey } from "@/lib/env";
import { getCategories } from "@/lib/listings";
import { validateSubmission } from "@/lib/submissions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const categoriesRes = await getCategories();
    if (!categoriesRes.ok) {
      return NextResponse.json(
        { error: "Submission service is temporarily unavailable." },
        { status: 503 },
      );
    }

    const validation = validateSubmission(body, categoriesRes.categories);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = getSupabasePublicKey();
    if (!url || !key) {
      return NextResponse.json(
        { error: "Submission service is not configured." },
        { status: 503 },
      );
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: dbError } = await supabase
      .from("listing_submissions")
      .insert(validation.payload);

    if (dbError) {
      console.error("DB Error:", dbError);
      return NextResponse.json(
        { error: dbError.message || "We could not save your submission. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Application received. Our team will review it before publication." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "We could not process your request." },
      { status: 400 },
    );
  }
}

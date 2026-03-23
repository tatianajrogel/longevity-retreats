import { isSupabaseConfigured } from "./env";

function getAdminCode(): string {
  return process.env.ADMIN_CODE || "test";
}

export function isAdminConfigured(): boolean {
  return true;
}

export function validateAdminCode(code: string): boolean {
  return code === getAdminCode();
}

export async function getSubmissions(status?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return { ok: false, error: "missing_env" } as const;
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: "missing_env" } as const;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);

  let query = supabase
    .from("listing_submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return { ok: false, error: error.message } as const;
  }

  return { ok: true, submissions: data } as const;
}

export async function updateSubmissionStatus(id: string, status: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return { ok: false, error: "missing_env" } as const;
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key);

  const { error } = await supabase
    .from("listing_submissions")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message } as const;
  }

  return { ok: true } as const;
}
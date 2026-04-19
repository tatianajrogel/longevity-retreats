import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const ADMIN_SELECT = `
  id, slug, title, summary, body, city, region, country,
  website_url, image_url, featured, status, created_at, updated_at,
  focus, length_text, price_text, target_audience, best_for, notes,
  luxury_level, environment,
  listing_categories ( categories ( id, slug, name, sort_order ) )
`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function randomHex(n: number) {
  return Math.random().toString(16).slice(2, 2 + n);
}

export async function getAllListings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select(ADMIN_SELECT)
    .order("created_at", { ascending: false });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, listings: data ?? [] };
}

export async function getAdminListing(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("listings")
    .select(ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, listing: data };
}

export type ListingInput = {
  title: string;
  slug?: string;
  summary: string;
  body: string;
  city?: string;
  region?: string;
  country?: string;
  website_url?: string;
  image_url?: string;
  featured?: boolean;
  status?: "draft" | "published";
  focus?: string;
  length_text?: string;
  price_text?: string;
  target_audience?: string;
  best_for?: string;
  notes?: string;
  luxury_level?: string;
  environment?: string;
  category_slugs?: string[];
};

async function upsertCategories(supabase: ReturnType<typeof createSupabaseAdminClient>, listingId: string, categorySlugs: string[]) {
  if (!categorySlugs.length) return;
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const slugToId = Object.fromEntries((cats ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]));
  const rows = categorySlugs
    .filter((s) => slugToId[s])
    .map((s) => ({ listing_id: listingId, category_id: slugToId[s] }));
  if (rows.length) {
    await supabase.from("listing_categories").delete().eq("listing_id", listingId);
    await supabase.from("listing_categories").insert(rows);
  }
}

export async function createListing(input: ListingInput) {
  const supabase = createSupabaseAdminClient();
  let slug = input.slug?.trim() || slugify(input.title);

  // Ensure unique slug
  const { data: existing } = await supabase.from("listings").select("slug").eq("slug", slug).maybeSingle();
  if (existing) slug = `${slug}-${randomHex(4)}`;

  const { data, error } = await supabase
    .from("listings")
    .insert({
      slug,
      title: input.title,
      summary: input.summary,
      body: input.body,
      city: input.city || null,
      region: input.region || null,
      country: input.country || "United States",
      website_url: input.website_url || null,
      image_url: input.image_url || null,
      featured: input.featured ?? false,
      status: input.status ?? "draft",
      focus: input.focus || null,
      length_text: input.length_text || null,
      price_text: input.price_text || null,
      target_audience: input.target_audience || null,
      best_for: input.best_for || null,
      notes: input.notes || null,
      luxury_level: input.luxury_level || null,
      environment: input.environment || null,
    })
    .select("id")
    .single();

  if (error) return { ok: false as const, error: error.message };
  if (input.category_slugs?.length) {
    await upsertCategories(supabase, data.id, input.category_slugs);
  }
  return { ok: true as const, id: data.id };
}

export async function updateListing(id: string, input: Partial<ListingInput>) {
  const supabase = createSupabaseAdminClient();
  const updates: Record<string, unknown> = {};
  const fields: (keyof ListingInput)[] = [
    "title","slug","summary","body","city","region","country",
    "website_url","image_url","featured","status",
    "focus","length_text","price_text","target_audience","best_for","notes",
    "luxury_level","environment",
  ];
  for (const f of fields) {
    if (f in input) updates[f] = (input as Record<string, unknown>)[f] ?? null;
  }
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase.from("listings").update(updates).eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  if (input.category_slugs !== undefined) {
    await upsertCategories(supabase, id, input.category_slugs);
  }
  return { ok: true as const };
}

export async function deleteListing(id: string, mode: "soft" | "hard" = "soft") {
  const supabase = createSupabaseAdminClient();
  if (mode === "hard") {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("listings").update({ status: "draft" }).eq("id", id);
    if (error) return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function publishListing(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("listings").update({ status: "published" }).eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

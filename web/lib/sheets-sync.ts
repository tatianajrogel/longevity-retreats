import { google } from "googleapis";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SyncResult = { upserted: number; errors: string[] };

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

export async function syncFromSheet(): Promise<SyncResult> {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  if (!serviceAccountJson || !sheetId) {
    return { upserted: 0, errors: ["Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SHEET_ID env vars"] };
  }

  const errors: string[] = [];
  let upserted = 0;

  try {
    const credentials = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:N",
    });

    const rows = response.data.values ?? [];
    if (rows.length < 2) {
      return { upserted: 0, errors: ["Sheet has no data rows (expected header in row 1)"] };
    }

    // Expected columns (row 1 is header, data starts at row 2):
    // A: title  B: summary  C: body  D: city  E: region  F: country
    // G: website_url  H: image_url  I: categories (comma-separated slugs)
    // J: focus  K: price_text  L: luxury_level  M: environment  N: listing_type
    const dataRows = rows.slice(1);

    const supabase = createSupabaseAdminClient();

    // Fetch category slug→id map
    const { data: cats } = await supabase.from("categories").select("id, slug");
    const slugToId: Record<string, string> = Object.fromEntries(
      (cats ?? []).map((c: { id: string; slug: string }) => [c.slug, c.id]),
    );

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const [title, summary, body, city, region, country, website_url, image_url, categories, focus, price_text, luxury_level, environment, listing_type] = row;

      if (!title?.trim()) continue;

      const slug = slugify(title.trim());

      try {
        const { data: existing } = await supabase
          .from("listings")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        const listingData = {
          slug,
          title: title.trim(),
          summary: (summary ?? "").trim(),
          body: (body ?? "").trim(),
          city: city?.trim() || null,
          region: region?.trim() || null,
          country: country?.trim() || "United States",
          website_url: website_url?.trim() || null,
          image_url: image_url?.trim() || null,
          focus: focus?.trim() || null,
          price_text: price_text?.trim() || null,
          luxury_level: luxury_level?.trim() || null,
          environment: environment?.trim() || null,
          listing_type: listing_type?.trim() || null,
          status: "published",
          updated_at: new Date().toISOString(),
        };

        let listingId: string;

        if (existing) {
          await supabase.from("listings").update(listingData).eq("id", existing.id);
          listingId = existing.id;
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from("listings")
            .insert({ ...listingData, featured: false })
            .select("id")
            .single();
          if (insertError) {
            errors.push(`Row ${i + 2} (${title}): ${insertError.message}`);
            continue;
          }
          listingId = inserted.id;
        }

        // Update categories
        const catSlugs = (categories ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
        const catRows = catSlugs
          .filter((s: string) => slugToId[s])
          .map((s: string) => ({ listing_id: listingId, category_id: slugToId[s] }));

        if (catRows.length > 0) {
          await supabase.from("listing_categories").delete().eq("listing_id", listingId);
          await supabase.from("listing_categories").insert(catRows);
        }

        upserted++;
      } catch (err) {
        errors.push(`Row ${i + 2} (${title}): ${String(err)}`);
      }
    }

    // Log sync result
    try {
      await supabase.from("sync_log").insert({
        rows_upserted: upserted,
        errors: errors.length > 0 ? errors : null,
        source: "sheets",
      });
    } catch (_e) {
      // sync_log table may not exist yet — non-fatal
    }
  } catch (err) {
    return { upserted, errors: [...errors, String(err)] };
  }

  return { upserted, errors };
}

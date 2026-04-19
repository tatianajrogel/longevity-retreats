"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  city: string;
  region: string;
  country: string;
  website_url: string;
  image_url: string;
  featured: boolean;
  status: "draft" | "published";
  focus: string;
  length_text: string;
  price_text: string;
  target_audience: string;
  best_for: string;
  notes: string;
  luxury_level: string;
  environment: string;
  category_slugs: string[];
};

type Category = { id: string; slug: string; name: string };

type Props = {
  initialData?: Partial<FormData>;
  listingId?: string;
  adminCode: string;
};

const ENVS = ["", "Coastal", "Desert", "Lakeside", "Mountain", "Urban"];
const LUXS = ["", "Premium", "Luxury", "Ultra-Luxury"];
const STATUSES = ["draft", "published"] as const;

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--line)",
  borderRadius: 8,
  font: "inherit",
  fontSize: "0.95rem",
  color: "var(--ink)",
  background: "#fff",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--ink-soft)",
  marginBottom: 6,
};

export function ListingForm({ initialData, listingId, adminCode }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sanitized = Object.fromEntries(
    Object.entries(initialData ?? {}).map(([k, v]) => [k, v === null ? "" : v])
  ) as Partial<FormData>;

  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    summary: "",
    body: "",
    city: "",
    region: "",
    country: "United States",
    website_url: "",
    image_url: "",
    featured: false,
    status: "draft",
    focus: "",
    length_text: "",
    price_text: "",
    target_audience: "",
    best_for: "",
    notes: "",
    luxury_level: "",
    environment: "",
    category_slugs: [],
    ...sanitized,
  });

  useEffect(() => {
    fetch("/api/admin/listings", { headers: { "x-admin-code": adminCode } })
      .then(async (r) => {
        // fetch categories separately via supabase anon if possible
      })
      .catch(() => {});

    // Load categories from public endpoint
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/categories?select=id,slug,name,sort_order&order=sort_order`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ""}`,
      },
    })
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, [adminCode]);

  function set(field: keyof FormData, value: unknown) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !listingId) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  function toggleCategory(slug: string) {
    setForm((prev) => ({
      ...prev,
      category_slugs: prev.category_slugs.includes(slug)
        ? prev.category_slugs.filter((s) => s !== slug)
        : [...prev.category_slugs, slug],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = listingId ? `/api/admin/listings/${listingId}` : "/api/admin/listings";
    const method = listingId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "x-admin-code": adminCode },
      body: JSON.stringify(form),
    });

    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed");
      return;
    }
    router.push("/admin/listings");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {error ? <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: 12, color: "#7f1d1d", fontSize: "0.9rem" }}>{error}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input required value={form.title} onChange={(e) => set("title", e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Slug *</label>
          <input required value={form.slug} onChange={(e) => set("slug", e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Summary *</label>
        <textarea required value={form.summary} onChange={(e) => set("summary", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div>
        <label style={labelStyle}>Body *</label>
        <textarea required value={form.body} onChange={(e) => set("body", e.target.value)} rows={6} style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>City</label><input value={form.city} onChange={(e) => set("city", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Region / State</label><input value={form.region} onChange={(e) => set("region", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Country</label><input value={form.country} onChange={(e) => set("country", e.target.value)} style={inputStyle} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>Website URL</label><input type="url" value={form.website_url} onChange={(e) => set("website_url", e.target.value)} placeholder="https://" style={inputStyle} /></div>
        <div><label style={labelStyle}>Image URL</label><input type="url" value={form.image_url} onChange={(e) => set("image_url", e.target.value)} placeholder="https://" style={inputStyle} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>Focus</label><input value={form.focus} onChange={(e) => set("focus", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Length</label><input value={form.length_text} onChange={(e) => set("length_text", e.target.value)} placeholder="e.g. 3–7 days" style={inputStyle} /></div>
        <div><label style={labelStyle}>Price</label><input value={form.price_text} onChange={(e) => set("price_text", e.target.value)} placeholder="e.g. $2,000 – $5,000" style={inputStyle} /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div><label style={labelStyle}>Target Audience</label><input value={form.target_audience} onChange={(e) => set("target_audience", e.target.value)} style={inputStyle} /></div>
        <div><label style={labelStyle}>Best For</label><input value={form.best_for} onChange={(e) => set("best_for", e.target.value)} style={inputStyle} /></div>
      </div>

      <div><label style={labelStyle}>Notes</label><input value={form.notes} onChange={(e) => set("notes", e.target.value)} style={inputStyle} /></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
        <div>
          <label style={labelStyle}>Environment</label>
          <select value={form.environment} onChange={(e) => set("environment", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {ENVS.map((v) => <option key={v} value={v}>{v || "— None —"}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Luxury Level</label>
          <select value={form.luxury_level} onChange={(e) => set("luxury_level", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
            {LUXS.map((v) => <option key={v} value={v}>{v || "— None —"}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select value={form.status} onChange={(e) => set("status", e.target.value as "draft" | "published")} style={{ ...inputStyle, cursor: "pointer" }}>
            {STATUSES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            <span style={labelStyle}>Featured</span>
          </label>
        </div>
      </div>

      {categories.length > 0 ? (
        <div>
          <label style={labelStyle}>Categories</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map((c) => (
              <label key={c.slug} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "6px 12px", borderRadius: 999, border: `1px solid ${form.category_slugs.includes(c.slug) ? "var(--accent)" : "var(--line)"}`, background: form.category_slugs.includes(c.slug) ? "var(--accent-soft)" : "#fff", fontSize: "0.88rem" }}>
                <input type="checkbox" style={{ display: "none" }} checked={form.category_slugs.includes(c.slug)} onChange={() => toggleCategory(c.slug)} />
                {c.name}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
        <button type="submit" disabled={saving} style={{ padding: "11px 24px", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", border: "none", fontWeight: 500, cursor: saving ? "wait" : "pointer", fontSize: "0.95rem" }}>
          {saving ? "Saving…" : listingId ? "Save changes" : "Create listing"}
        </button>
        <button type="button" onClick={() => router.push("/admin/listings")} style={{ padding: "11px 24px", borderRadius: 999, background: "transparent", color: "var(--ink-soft)", border: "1px solid var(--line)", fontWeight: 500, cursor: "pointer", fontSize: "0.95rem" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

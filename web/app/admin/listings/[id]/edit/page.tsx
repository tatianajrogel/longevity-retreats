"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ListingForm } from "@/components/admin/listing-form";

function getAdminCode() {
  try { return localStorage.getItem("admin_auth_code") ?? ""; } catch { return ""; }
}

function normalizeCategories(listing: Record<string, unknown>): string[] {
  const lc = listing.listing_categories as { categories: { slug: string } | { slug: string }[] | null }[] | null;
  if (!lc) return [];
  return lc.flatMap((row) => {
    const c = row.categories;
    if (!c) return [];
    return Array.isArray(c) ? c.map((x) => x.slug) : [c.slug];
  });
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Record<string, unknown> | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = getAdminCode();
    setAdminCode(code);
    fetch(`/api/admin/listings/${id}`, { headers: { "x-admin-code": code } })
      .then((r) => r.json())
      .then((data) => { setListing(data.listing); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 48, color: "var(--muted)", textAlign: "center" }}>Loading…</div>;
  if (!listing) return <div style={{ padding: 48, color: "red", textAlign: "center" }}>Listing not found.</div>;

  const initialData = {
    ...listing,
    category_slugs: normalizeCategories(listing),
  } as Parameters<typeof ListingForm>[0]["initialData"];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ margin: "0 0 24px", fontSize: "1.5rem", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>
        Edit: {listing.title as string}
      </h1>
      <ListingForm initialData={initialData} listingId={id} adminCode={adminCode} />
    </div>
  );
}

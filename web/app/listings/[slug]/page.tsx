import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getListingBySlug } from "@/lib/listings";
import { normalizeCategories } from "@/types/listing";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getListingBySlug(slug);
  if (!res.ok || !res.listing) return { title: "Listing" };
  return {
    title: res.listing.title,
    description: res.listing.summary,
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const res = await getListingBySlug(slug);

  if (!res.ok && res.error === "missing_env") {
    return (
      <>
        <SiteHeader />
        <main style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
          <p style={{ color: "var(--muted)" }}>Configure Supabase environment variables to view this listing.</p>
          <Link href="/" style={{ display: "inline-block", marginTop: 24, color: "var(--accent)" }}>← Back to directory</Link>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!res.ok || !res.listing) notFound();

  const listing = res.listing;
  const location = [listing.city, listing.region, listing.country].filter(Boolean).join(", ");
  const categories = normalizeCategories(listing);

  const luxColors: Record<string, { bg: string; color: string }> = {
    Premium:       { bg: "#f2ead0", color: "#7e6719" },
    Luxury:        { bg: "#f2ead0", color: "#7e6719" },
    "Ultra-Luxury":{ bg: "#f2ead0", color: "#7e6719" },
  };

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link href="/" style={{ color: "var(--accent)", fontSize: "0.9rem", textDecoration: "none" }}>
          ← Back to directory
        </Link>

        <article style={{ marginTop: 32 }}>
          {/* Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            {listing.focus ? (
              <span style={{ fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--accent-soft)", color: "var(--accent)", padding: "5px 10px", borderRadius: 999, fontWeight: 500 }}>
                {listing.focus}
              </span>
            ) : null}
            {listing.environment ? (
              <span style={{ fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--chip)", color: "var(--ink-soft)", padding: "5px 10px", borderRadius: 999, fontWeight: 500 }}>
                {listing.environment}
              </span>
            ) : null}
            {listing.luxury_level ? (
              <span style={{ fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", padding: "5px 10px", borderRadius: 999, fontWeight: 500, background: luxColors[listing.luxury_level]?.bg ?? "#f2ead0", color: luxColors[listing.luxury_level]?.color ?? "#7e6719" }}>
                {listing.luxury_level}
              </span>
            ) : null}
            {categories.map((c) => (
              <span key={c.id} style={{ fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--chip)", color: "var(--ink-soft)", padding: "5px 10px", borderRadius: 999, fontWeight: 500 }}>
                {c.name}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 500, margin: "0 0 12px" }}>
            {listing.title}
          </h1>

          {location ? (
            <p style={{ color: "var(--muted)", fontSize: "0.95rem", margin: "0 0 24px", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "var(--accent)", fontSize: "0.7rem" }}>◉</span>
              {location}
            </p>
          ) : null}

          <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--ink-soft)", margin: "0 0 32px" }}>
            {listing.summary}
          </p>

          {/* Program details table */}
          {(listing.length_text || listing.price_text || listing.target_audience || listing.best_for || listing.notes) ? (
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 16, padding: 28, marginBottom: 32 }}>
              <h3 style={{ fontSize: "1rem", marginBottom: 16, color: "var(--ink)" }}>Program details</h3>
              <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "10px 20px", fontSize: "0.95rem" }}>
                {listing.length_text ? (
                  <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Length</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{listing.length_text}</dd></>
                ) : null}
                {listing.price_text ? (
                  <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Price</dt><dd style={{ margin: 0, color: "var(--ink)", fontWeight: 600 }}>{listing.price_text}</dd></>
                ) : null}
                {listing.target_audience ? (
                  <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Target</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{listing.target_audience}</dd></>
                ) : null}
                {listing.best_for ? (
                  <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Best for</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{listing.best_for}</dd></>
                ) : null}
                {listing.notes ? (
                  <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Notes</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{listing.notes}</dd></>
                ) : null}
              </dl>
            </div>
          ) : null}

          {/* Body */}
          <div style={{ lineHeight: 1.8, color: "var(--ink-soft)", fontSize: "1rem" }}>
            {listing.body.split("\n\n").map((para, i) => (
              <p key={i} style={{ marginBottom: "1.2rem" }}>{para}</p>
            ))}
          </div>

          {listing.website_url ? (
            <a
              href={listing.website_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 999, fontWeight: 500, fontSize: "0.95rem", border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--bg)", textDecoration: "none", marginTop: 32 }}
            >
              Visit website ↗
            </a>
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

"use client";

import { useState } from "react";
import type { ListingWithCategories } from "@/types/listing";

type Props = { listing: ListingWithCategories };

const luxColors: Record<string, { bg: string; color: string }> = {
  Premium:       { bg: "#f2ead0", color: "#7e6719" },
  Luxury:        { bg: "#f2ead0", color: "#7e6719" },
  "Ultra-Luxury":{ bg: "#f2ead0", color: "#7e6719" },
};

export function ListingCard({ listing }: Props) {
  const [open, setOpen] = useState(false);
  const location = [listing.city, listing.region].filter(Boolean).join(", ");

  return (
    <article style={{
      background: "#fff",
      border: "1px solid var(--line)",
      borderRadius: 16,
      padding: 26,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      transition: "transform .2s ease, box-shadow .2s ease, border-color .2s",
    }}
      className="listing-card card-animate"
    >
      {/* Top accent bar on hover via CSS class */}
      <div className="card-top-bar" />

      <h3 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: "1.25rem", margin: "0 0 4px", fontWeight: 500, color: "var(--ink)" }}>
        {listing.title}
      </h3>

      {location ? (
        <div style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--accent)", fontSize: "0.7rem" }}>◉</span>
          {location}
        </div>
      ) : null}

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {listing.listing_type ? (
          <span style={{ fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--accent-soft)", color: "var(--accent)", padding: "5px 10px", borderRadius: 999, fontWeight: 500 }}>
            {listing.listing_type}
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
      </div>

      <p style={{ color: "var(--ink-soft)", fontSize: "0.95rem", margin: "0 0 18px", flex: 1, lineHeight: 1.6 }}>
        {listing.summary}
      </p>

      {/* Expand toggle */}
      {(listing.length_text || listing.price_text || listing.target_audience) ? (
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            cursor: "pointer",
            font: "inherit",
            fontSize: "0.88rem",
            fontWeight: 500,
            padding: 0,
            marginBottom: 10,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ display: "inline-block", transition: "transform .2s", transform: open ? "rotate(90deg)" : "none" }}>›</span>
          Program details
        </button>
      ) : null}

      {open ? (
        <div style={{ paddingTop: 10, borderTop: "1px dashed var(--line)", marginTop: 0, marginBottom: 10 }}>
          <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", fontSize: "0.9rem" }}>
            {listing.length_text ? (
              <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Length</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{listing.length_text}</dd></>
            ) : null}
            {listing.price_text ? (
              <><dt style={{ color: "var(--muted)", fontWeight: 500 }}>Price</dt><dd style={{ margin: 0, color: "var(--ink-soft)" }}>{listing.price_text}</dd></>
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

      {/* Card footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
        <span style={{ fontSize: "0.88rem", color: "var(--ink)", fontWeight: 600 }}>
          {listing.price_text ?? ""}
        </span>
        {listing.website_url ? (
          <a href={listing.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--accent)", textDecoration: "none" }}>
            Visit site ↗
          </a>
        ) : null}
      </div>
    </article>
  );
}

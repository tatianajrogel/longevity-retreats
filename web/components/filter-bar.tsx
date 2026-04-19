"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { CategoryRow } from "@/types/listing";

type Props = {
  categories: CategoryRow[];
  total: number;
  defaultQ?: string;
  defaultEnv?: string;
  defaultLux?: string;
  defaultCat?: string;
};

const ENVS = ["Coastal", "Desert", "Lakeside", "Mountain", "Urban"];
const LUXS = ["Premium", "Luxury", "Ultra-Luxury"];

const selectStyle: React.CSSProperties = {
  padding: "11px 36px 11px 14px",
  borderRadius: 999,
  border: "1px solid var(--line)",
  background: "#fff",
  font: "inherit",
  color: "var(--ink)",
  cursor: "pointer",
  appearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a847e' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  fontSize: "0.95rem",
};

export function FilterBar({ categories, total, defaultQ, defaultEnv, defaultLux, defaultCat }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  function handleReset() {
    router.push("/", { scroll: false });
  }

  return (
    <div style={{
      position: "sticky",
      top: 64,
      zIndex: 40,
      background: "var(--bg)",
      padding: "20px 0",
      borderBottom: "1px solid var(--line)",
      marginBottom: 40,
    }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ flex: "1 1 260px", minWidth: 220, position: "relative" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, location, or keyword…"
            defaultValue={defaultQ}
            onChange={(e) => navigate({ q: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 16px 12px 42px",
              borderRadius: 999,
              border: "1px solid var(--line)",
              background: "#fff",
              font: "inherit",
              color: "var(--ink)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>

        {/* Environment */}
        <select
          value={defaultEnv ?? ""}
          onChange={(e) => navigate({ env: e.target.value })}
          style={selectStyle}
        >
          <option value="">All environments</option>
          {ENVS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>

        {/* Luxury level */}
        <select
          value={defaultLux ?? ""}
          onChange={(e) => navigate({ lux: e.target.value })}
          style={selectStyle}
        >
          <option value="">All luxury levels</option>
          {LUXS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* Category */}
        <select
          value={defaultCat ?? ""}
          onChange={(e) => navigate({ cat: e.target.value })}
          style={selectStyle}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>

        <button
          onClick={handleReset}
          style={{ background: "transparent", border: "none", color: "var(--accent)", font: "inherit", cursor: "pointer", fontSize: "0.9rem", padding: 0 }}
        >
          Reset
        </button>

        <span style={{ fontSize: "0.88rem", color: "var(--muted)", marginLeft: "auto" }}>
          {total} {total === 1 ? "result" : "results"}
        </span>
      </div>
    </div>
  );
}

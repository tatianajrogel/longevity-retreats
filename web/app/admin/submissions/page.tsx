"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  slug: string;
  status: string;
  luxury_level: string | null;
  environment: string | null;
  featured: boolean;
  created_at: string;
};

function getAdminCode() {
  try { return localStorage.getItem("admin_auth_code") ?? ""; } catch { return ""; }
}

type Tab = {
  key: string;
  label: string;
  filter: (l: Listing) => boolean;
};

const TABS: Tab[] = [
  { key: "all",          label: "All",          filter: () => true },
  { key: "draft",        label: "Draft",        filter: l => l.status === "draft" },
  { key: "published",    label: "Published",    filter: l => l.status === "published" },
  { key: "featured",     label: "Featured",     filter: l => l.featured },
  { key: "Premium",      label: "Premium",      filter: l => l.luxury_level === "Premium" },
  { key: "Luxury",       label: "Luxury",       filter: l => l.luxury_level === "Luxury" },
  { key: "Ultra-Luxury", label: "Ultra-Luxury", filter: l => l.luxury_level === "Ultra-Luxury" },
];

const statusBadge: Record<string, React.CSSProperties> = {
  published: { background: "#d1fae5", color: "#065f46" },
  draft:     { background: "#fef3c7", color: "#92400e" },
};

const luxBadge: Record<string, React.CSSProperties> = {
  "Premium":      { background: "#f0fdf4", color: "#166534" },
  "Luxury":       { background: "#fefce8", color: "#854d0e" },
  "Ultra-Luxury": { background: "#fdf4ff", color: "#6b21a8" },
};

export default function SubmissionsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const code = getAdminCode();
    const res = await fetch("/api/admin/listings", { headers: { "x-admin-code": code } });
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handlePublish(id: string) {
    setUpdating(id);
    const code = getAdminCode();
    await fetch(`/api/admin/listings/${id}/publish`, { method: "POST", headers: { "x-admin-code": code } });
    await load();
    setUpdating(null);
  }

  async function handleUnpublish(id: string) {
    setUpdating(id);
    const code = getAdminCode();
    await fetch(`/api/admin/listings/${id}?mode=soft`, { method: "DELETE", headers: { "x-admin-code": code } });
    await load();
    setUpdating(null);
  }

  const currentTab = TABS.find(t => t.key === activeTab) ?? TABS[0];
  const visible = listings.filter(currentTab.filter);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>Submissions</h1>
        <Link href="/admin/listings/new" style={{ padding: "10px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" }}>
          + New Listing
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {TABS.map(t => {
          const count = listings.filter(t.filter).length;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "6px 14px", borderRadius: 999, border: "1px solid",
                borderColor: active ? "var(--ink)" : "var(--line)",
                background: active ? "var(--ink)" : "#fff",
                color: active ? "var(--bg)" : "var(--ink-soft)",
                fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
              }}
            >
              {t.label} <span style={{ opacity: 0.55 }}>({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Loading…</p>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: "var(--muted)", background: "#fff", border: "1px dashed var(--line)", borderRadius: 12 }}>
          No listings in this view.
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)", fontSize: "0.8rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Title</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Level</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Environment</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Featured</th>
                <th style={{ textAlign: "right", padding: "12px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((l, i) => (
                <tr key={l.id} style={{ borderTop: i > 0 ? "1px solid var(--line)" : undefined }}>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/listings/${l.id}/edit`} style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500, fontSize: "0.95rem" }}>
                      {l.title}
                    </Link>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>{l.slug}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 500, ...(statusBadge[l.status] ?? {}) }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {l.luxury_level
                      ? <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 500, ...(luxBadge[l.luxury_level] ?? {}) }}>{l.luxury_level}</span>
                      : <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "var(--ink-soft)" }}>{l.environment ?? "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: "0.88rem" }}>
                    {l.featured
                      ? <span style={{ color: "var(--accent)", fontWeight: 600 }}>✓</span>
                      : <span style={{ color: "var(--muted)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                      <Link href={`/admin/listings/${l.id}/edit`} style={{ fontSize: "0.82rem", color: "var(--accent)", textDecoration: "none" }}>Edit</Link>
                      {l.status !== "published" ? (
                        <button onClick={() => handlePublish(l.id)} disabled={updating === l.id}
                          style={{ fontSize: "0.82rem", color: "#065f46", background: "#d1fae5", border: "none", borderRadius: 999, padding: "4px 12px", cursor: "pointer", fontWeight: 500 }}>
                          {updating === l.id ? "…" : "Publish"}
                        </button>
                      ) : (
                        <button onClick={() => handleUnpublish(l.id)} disabled={updating === l.id}
                          style={{ fontSize: "0.82rem", color: "var(--muted)", background: "var(--bg-soft)", border: "none", borderRadius: 999, padding: "4px 12px", cursor: "pointer" }}>
                          {updating === l.id ? "…" : "Unpublish"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

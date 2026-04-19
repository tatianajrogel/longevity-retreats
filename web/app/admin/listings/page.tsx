"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const statusColors: Record<string, { bg: string; color: string }> = {
  published: { bg: "#d1fae5", color: "#065f46" },
  draft:     { bg: "#f3f4f6", color: "#374151" },
};

export default function AdminListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const code = getAdminCode();
    const res = await fetch("/api/admin/listings", { headers: { "x-admin-code": code } });
    if (!res.ok) { setError("Failed to load listings"); setLoading(false); return; }
    const data = await res.json();
    setListings(data.listings ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Unpublish "${title}"?`)) return;
    const code = getAdminCode();
    await fetch(`/api/admin/listings/${id}?mode=soft`, { method: "DELETE", headers: { "x-admin-code": code } });
    load();
  }

  async function handlePublish(id: string) {
    const code = getAdminCode();
    await fetch(`/api/admin/listings/${id}/publish`, { method: "POST", headers: { "x-admin-code": code } });
    load();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>All Listings</h1>
        <Link href="/admin/listings/new" style={{ padding: "10px 20px", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" }}>
          + New Listing
        </Link>
      </div>

      {loading ? <p style={{ color: "var(--muted)" }}>Loading…</p> : error ? <p style={{ color: "red" }}>{error}</p> : (
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-soft)", fontSize: "0.82rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Title</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Status</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Level</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Env</th>
                <th style={{ textAlign: "left", padding: "12px 16px" }}>Featured</th>
                <th style={{ textAlign: "right", padding: "12px 16px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l, i) => (
                <tr key={l.id} style={{ borderTop: i > 0 ? "1px solid var(--line)" : undefined }}>
                  <td style={{ padding: "12px 16px", fontSize: "0.95rem", color: "var(--ink)" }}>
                    <Link href={`/admin/listings/${l.id}/edit`} style={{ color: "var(--ink)", textDecoration: "none", fontWeight: 500 }}>{l.title}</Link>
                    <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>{l.slug}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 500, ...statusColors[l.status] ?? {} }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "var(--ink-soft)" }}>{l.luxury_level ?? "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "var(--ink-soft)" }}>{l.environment ?? "—"}</td>
                  <td style={{ padding: "12px 16px", fontSize: "0.88rem", color: "var(--muted)" }}>{l.featured ? "✓" : ""}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <Link href={`/admin/listings/${l.id}/edit`} style={{ fontSize: "0.82rem", color: "var(--accent)" }}>Edit</Link>
                      {l.status !== "published" ? (
                        <button onClick={() => handlePublish(l.id)} style={{ fontSize: "0.82rem", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Publish</button>
                      ) : (
                        <button onClick={() => handleDelete(l.id, l.title)} style={{ fontSize: "0.82rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Unpublish</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>No listings yet. <Link href="/admin/listings/new">Create one</Link>.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

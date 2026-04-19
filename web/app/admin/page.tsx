"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  total: number;
  published: number;
  draft: number;
  featured: number;
  lastSync: string | null;
  syncUpserted: number | null;
};

type SyncResult = { upserted?: number; errors?: string[] } | null;

function getAdminCode() {
  try { return localStorage.getItem("admin_auth_code") ?? ""; } catch { return ""; }
}

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: "24px 28px",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult>(null);

  const loadData = () => {
    const code = getAdminCode();
    Promise.all([
      fetch("/api/admin/listings", { headers: { "x-admin-code": code } }).then(r => r.json()),
      fetch("/api/sync").then(r => r.json()),
    ]).then(([listingsRes, syncRes]) => {
      const listings = listingsRes.listings ?? [];
      setStats({
        total: listings.length,
        published: listings.filter((l: { status: string }) => l.status === "published").length,
        draft: listings.filter((l: { status: string }) => l.status === "draft").length,
        featured: listings.filter((l: { featured: boolean }) => l.featured).length,
        lastSync: syncRes.lastSync ?? null,
        syncUpserted: syncRes.rowsUpserted ?? null,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  async function handleSync() {
    const secret = prompt("Enter your SYNC_SECRET to trigger sync:");
    if (!secret) return;
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      setSyncResult(data);
      loadData();
    } catch {
      setSyncResult({ errors: ["Network error — check your connection."] });
    }
    setSyncing(false);
  }

  const statCards = stats ? [
    { label: "Total Listings", value: stats.total, href: "/admin/listings", accent: false },
    { label: "Published", value: stats.published, href: "/admin/listings", accent: true },
    { label: "Drafts", value: stats.draft, href: "/admin/listings", accent: false },
    { label: "Featured", value: stats.featured, href: "/admin/listings", accent: false },
  ] : [];

  const quickLinks = [
    { href: "/admin/listings/new", label: "+ New Listing", desc: "Add a retreat manually" },
    { href: "/admin/sync", label: "Sync from Sheet", desc: "Pull latest from Google Sheets" },
    { href: "/admin/submissions", label: "Submissions", desc: "Review incoming submissions" },
    { href: "/", label: "View Site →", desc: "See the public directory" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "1.8rem", color: "var(--ink)" }}>
          Dashboard
        </h1>
        <p style={{ margin: "8px 0 0", color: "var(--muted)", fontSize: "0.95rem" }}>
          Longevity Retreats — admin overview
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ ...cardStyle, minHeight: 100, background: "var(--bg-soft)" }} />
        )) : statCards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: "none" }}>
            <div style={{ ...cardStyle, borderColor: card.accent ? "var(--accent)" : "var(--line)", cursor: "pointer" }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 700, color: card.accent ? "var(--accent)" : "var(--ink)", fontFamily: "'Fraunces', serif", lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 8 }}>{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Quick actions */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>Quick Actions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 8, textDecoration: "none", color: "var(--ink)", background: "var(--bg-soft)" }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.92rem" }}>{link.label}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>{link.desc}</div>
                </div>
                <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>›</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Sync status */}
        <div style={cardStyle}>
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>Google Sheets Sync</h2>
          {loading ? (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Loading…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {stats?.lastSync ? (
                <>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Last sync</div>
                    <div style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>
                      {new Date(stats.lastSync).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: 4 }}>Rows upserted</div>
                    <div style={{ fontSize: "0.95rem", color: "var(--ink)", fontWeight: 500 }}>{stats.syncUpserted ?? 0}</div>
                  </div>
                </>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>No sync has run yet.</p>
              )}

              <button
                onClick={handleSync}
                disabled={syncing}
                style={{ padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 500, cursor: syncing ? "wait" : "pointer", fontSize: "0.88rem" }}
              >
                {syncing ? "Syncing…" : "Sync Now"}
              </button>

              {syncResult && (
                <div style={{ padding: 12, borderRadius: 8, background: syncResult.errors?.length ? "#fff0f0" : "#f0fdf4", fontSize: "0.85rem" }}>
                  {syncResult.errors?.length ? (
                    <>
                      <div style={{ fontWeight: 600, color: "#7f1d1d", marginBottom: 4 }}>Sync errors</div>
                      {syncResult.errors.map((e, i) => <div key={i} style={{ color: "#7f1d1d" }}>{e}</div>)}
                    </>
                  ) : (
                    <div style={{ color: "#065f46", fontWeight: 500 }}>✓ {syncResult.upserted ?? 0} rows upserted</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

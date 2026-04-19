"use client";

import { useEffect, useState, useCallback } from "react";

type SyncLog = {
  synced_at: string;
  rows_upserted: number;
  errors: string[] | null;
  source: string;
};

export default function AdminSyncPage() {
  const [lastSync, setLastSync] = useState<SyncLog | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ upserted?: number; errors?: string[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/sync");
      const data = await res.json();
      setLastSync(data.lastSync);
    } catch {
      setLoadError("Could not fetch sync status.");
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  async function handleSync() {
    const secret = prompt("Enter SYNC_SECRET to trigger manual sync:");
    if (!secret) return;
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      setResult(data);
      await loadStatus();
    } catch {
      setResult({ errors: ["Network error"] });
    }
    setSyncing(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem", fontFamily: "'Fraunces', serif", fontWeight: 500 }}>Google Sheets Sync</h1>
      <p style={{ color: "var(--muted)", marginBottom: 32, fontSize: "0.95rem" }}>
        The cron job syncs automatically on the schedule set by <code>SYNC_CRON_SCHEDULE</code> (default: hourly). Use the button below to trigger an immediate sync.
      </p>

      {loadError ? <p style={{ color: "red" }}>{loadError}</p> : null}

      {lastSync ? (
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Last sync</div>
          <div style={{ fontSize: "1rem", color: "var(--ink)", fontWeight: 500 }}>{new Date(lastSync.synced_at).toLocaleString()}</div>
          <div style={{ marginTop: 8, fontSize: "0.9rem", color: "var(--ink-soft)" }}>
            {lastSync.rows_upserted} rows upserted · source: {lastSync.source}
          </div>
          {lastSync.errors && lastSync.errors.length > 0 ? (
            <div style={{ marginTop: 12, padding: 12, background: "#fff0f0", borderRadius: 8 }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#7f1d1d", marginBottom: 6 }}>Errors ({lastSync.errors.length})</div>
              {lastSync.errors.map((e, i) => <div key={i} style={{ fontSize: "0.82rem", color: "#7f1d1d" }}>{e}</div>)}
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ background: "var(--bg-soft)", border: "1px dashed var(--line)", borderRadius: 12, padding: 24, marginBottom: 24, color: "var(--muted)", textAlign: "center" }}>
          No sync has run yet.
        </div>
      )}

      <button
        onClick={handleSync}
        disabled={syncing}
        style={{ padding: "12px 24px", borderRadius: 999, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 500, cursor: syncing ? "wait" : "pointer", fontSize: "0.95rem" }}
      >
        {syncing ? "Syncing…" : "Sync Now from Google Sheets"}
      </button>

      {result ? (
        <div style={{ marginTop: 20, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>Sync result</div>
          <div style={{ fontSize: "0.9rem", color: "var(--ink-soft)" }}>Rows upserted: {result.upserted ?? 0}</div>
          {result.errors && result.errors.length > 0 ? (
            <div style={{ marginTop: 8 }}>
              {result.errors.map((e, i) => <div key={i} style={{ fontSize: "0.82rem", color: "red" }}>{e}</div>)}
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: "0.9rem", color: "#065f46" }}>No errors ✓</div>
          )}
        </div>
      ) : null}

      <div style={{ marginTop: 40, padding: 20, background: "var(--bg-soft)", borderRadius: 12, fontSize: "0.88rem", color: "var(--ink-soft)" }}>
        <strong>Google Sheet format (row 1 = header, data from row 2):</strong>
        <div style={{ fontFamily: "monospace", marginTop: 8, fontSize: "0.8rem", overflowX: "auto" }}>
          A: title | B: summary | C: body | D: city | E: region | F: country | G: website_url | H: image_url | I: categories (comma-slugs) | J: focus | K: price_text | L: luxury_level | M: environment
        </div>
        <div style={{ marginTop: 8 }}>Category slugs: <code>comprehensive-luxury</code>, <code>mindfulness-restoration</code>, <code>fitness-lifestyle-reset</code>, <code>longevity-clinics</code></div>
        <div style={{ marginTop: 4 }}>Luxury levels: <code>Premium</code>, <code>Luxury</code>, <code>Ultra-Luxury</code></div>
        <div style={{ marginTop: 4 }}>Environments: <code>Coastal</code>, <code>Desert</code>, <code>Lakeside</code>, <code>Mountain</code>, <code>Urban</code></div>
      </div>
    </div>
  );
}

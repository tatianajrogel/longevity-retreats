export function SiteFooter() {
  return (
    <footer style={{ padding: "48px 0", textAlign: "center", color: "var(--muted)", fontSize: "0.88rem", borderTop: "1px solid var(--line)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ fontFamily: "'Fraunces', serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, color: "var(--ink)" }}>
          <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--accent)", borderRadius: "50%" }} />
          Longevity Retreats
        </div>
        <div>Curated directory · Last updated April 2026</div>
      </div>
    </footer>
  );
}

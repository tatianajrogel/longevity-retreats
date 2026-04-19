import Link from "next/link";

export function SiteHeader() {
  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: "rgba(247,245,239,.85)",
      backdropFilter: "saturate(140%) blur(10px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--accent)", borderRadius: "50%", marginRight: 8 }} />
          Longevity Retreats
        </Link>
        <div className="nav-links" style={{ display: "flex", gap: 28, fontSize: "0.92rem" }}>
          <a href="/#guide" style={{ color: "var(--ink-soft)", textDecoration: "none" }}>Guide</a>
          <a href="/#retreats" style={{ color: "var(--ink-soft)", textDecoration: "none" }}>Retreats</a>
          <a href="/#updates" style={{ color: "var(--ink-soft)", textDecoration: "none" }}>Updates</a>
          <a href="/#about" style={{ color: "var(--ink-soft)", textDecoration: "none" }}>About</a>
          <Link href="/admin/submissions" style={{ color: "var(--muted)", textDecoration: "none" }}>Admin</Link>
        </div>
      </div>
    </nav>
  );
}

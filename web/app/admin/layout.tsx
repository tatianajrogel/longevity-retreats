"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const auth = localStorage?.getItem("admin_auth");
      const code = localStorage?.getItem("admin_auth_code");
      if (auth === "true" && code) setAuthenticated(true);
    } catch {}
    setLoading(false);
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE ?? "admin123";
    if (code === adminCode) {
      try {
        localStorage?.setItem("admin_auth", "true");
        localStorage?.setItem("admin_auth_code", code);
      } catch {}
      setAuthenticated(true);
      setError(null);
    } else {
      setError("Invalid admin code");
    }
  }

  function handleLogout() {
    try {
      localStorage?.removeItem("admin_auth");
      localStorage?.removeItem("admin_auth_code");
    } catch {}
    setAuthenticated(false);
  }

  if (loading) {
    return <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>Loading…</div>;
  }

  if (!authenticated) {
    return (
      <main style={{ maxWidth: 420, margin: "80px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--accent)", borderRadius: "50%" }} />
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: "1.15rem", fontWeight: 600 }}>Longevity Retreats</span>
          </div>
          <Link href="/" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
            ← Back to site
          </Link>
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.6rem", fontWeight: 500, margin: "0 0 24px" }}>Admin Login</h1>
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--ink-soft)", marginBottom: 6 }}>Admin code</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              autoFocus
              style={{ width: "100%", padding: "11px 14px", border: "1px solid var(--line)", borderRadius: 8, font: "inherit", fontSize: "0.95rem", color: "var(--ink)" }}
            />
          </div>
          {error ? <p style={{ color: "red", fontSize: "0.88rem", margin: 0 }}>{error}</p> : null}
          <button type="submit" style={{ padding: "12px", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", border: "none", fontWeight: 500, cursor: "pointer", fontSize: "0.95rem" }}>
            Sign in
          </button>
        </form>
      </main>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/listings", label: "Listings" },
    { href: "/admin/listings/new", label: "+ New" },
    { href: "/admin/submissions", label: "Submissions" },
    { href: "/admin/sync", label: "Sync" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-soft)" }}>
      <header style={{ borderBottom: "1px solid var(--line)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 600, color: "var(--ink)" }}>Admin</div>
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  fontSize: "0.88rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  color: (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)) ? "var(--accent)" : "var(--ink-soft)",
                  background: (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)) ? "var(--accent-soft)" : "transparent",
                }}
              >
                {label}
              </Link>
            ))}
            <Link href="/" style={{ padding: "6px 14px", fontSize: "0.88rem", color: "var(--muted)", textDecoration: "none" }}>
              View site
            </Link>
            <button onClick={handleLogout} style={{ padding: "6px 14px", fontSize: "0.88rem", color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
              Logout
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}

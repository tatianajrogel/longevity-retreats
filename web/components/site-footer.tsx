"use client";

import Link from "next/link";
import { useState } from "react";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(res.ok || res.status === 409 ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return <p style={{ fontSize: "0.88rem", color: "var(--accent)" }}>Thanks! Check your inbox to confirm.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: "9px 14px", border: "1px solid var(--line)", borderRadius: 999, fontSize: "0.88rem", color: "var(--ink)", background: "#fff", minWidth: 220 }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{ padding: "9px 20px", borderRadius: 999, background: "var(--accent)", color: "#fff", border: "none", fontSize: "0.88rem", fontWeight: 500, cursor: "pointer" }}
      >
        {state === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {state === "error" && <p style={{ width: "100%", textAlign: "center", color: "red", fontSize: "0.82rem", margin: 0 }}>Something went wrong. Try again.</p>}
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--line)", paddingTop: 48, paddingBottom: 48 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
        {/* Newsletter */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", fontWeight: 500, color: "var(--ink)", marginBottom: 8 }}>
            Stay informed
          </div>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 16, maxWidth: 400, margin: "0 auto 16px" }}>
            Get our curated retreat guide delivered to your inbox.
          </p>
          <NewsletterForm />
        </div>

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, borderTop: "1px solid var(--line)", paddingTop: 24 }}>
          <Link href="/" style={{ fontFamily: "'Fraunces', serif", fontSize: "1rem", fontWeight: 600, color: "var(--ink)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "inline-block", width: 7, height: 7, background: "var(--accent)", borderRadius: "50%" }} />
            Great Health Retreats
          </Link>
          <nav style={{ display: "flex", gap: 20, fontSize: "0.85rem", flexWrap: "wrap" }}>
            <Link href="/about" style={{ color: "var(--muted)", textDecoration: "none" }}>About</Link>
            <Link href="/contact" style={{ color: "var(--muted)", textDecoration: "none" }}>Contact</Link>
            <Link href="/privacy" style={{ color: "var(--muted)", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: "var(--muted)", textDecoration: "none" }}>Terms of Service</Link>
          </nav>
          <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>© {new Date().getFullYear()} Great Health Retreats</div>
        </div>
      </div>
    </footer>
  );
}

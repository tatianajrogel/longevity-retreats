"use client";

import { useState } from "react";

export function NewsletterSignup({ dark = false }: { dark?: boolean }) {
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
    return (
      <p style={{ fontSize: "0.95rem", color: dark ? "rgba(247,245,239,.9)" : "var(--accent)", fontWeight: 500 }}>
        Thanks! Check your inbox to confirm your subscription.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <input
        type="email"
        required
        placeholder="Your email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          padding: "11px 16px",
          border: dark ? "1px solid rgba(247,245,239,.3)" : "1px solid var(--line)",
          borderRadius: 999,
          fontSize: "0.92rem",
          color: dark ? "var(--bg)" : "var(--ink)",
          background: dark ? "rgba(247,245,239,.1)" : "#fff",
          minWidth: 240,
          flex: 1,
        }}
      />
      <button
        type="submit"
        disabled={state === "loading"}
        style={{
          padding: "11px 24px",
          borderRadius: 999,
          background: dark ? "var(--bg)" : "var(--accent)",
          color: dark ? "var(--ink)" : "#fff",
          border: "none",
          fontWeight: 600,
          fontSize: "0.92rem",
          cursor: state === "loading" ? "wait" : "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {state === "loading" ? "Subscribing…" : "Get the guide"}
      </button>
      {state === "error" && (
        <p style={{ width: "100%", color: dark ? "rgba(247,245,239,.7)" : "red", fontSize: "0.82rem", margin: 0 }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}

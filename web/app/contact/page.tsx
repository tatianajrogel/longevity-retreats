"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid var(--line)",
  borderRadius: 10,
  font: "inherit",
  fontSize: "0.95rem",
  color: "var(--ink)",
  background: "#fff",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 500,
  color: "var(--ink-soft)",
  marginBottom: 6,
};

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <SiteHeader />

      <header style={{ padding: "72px 0 56px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600, marginBottom: "1rem" }}>
            Get in touch
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
            Contact us.
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--ink-soft)", maxWidth: 560, margin: 0 }}>
            Questions about the directory, retreat suggestions, or want to get your program listed? We&apos;d love to hear from you.
          </p>
        </div>
      </header>

      <section style={{ padding: "64px 0" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
          {state === "success" ? (
            <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 12, padding: "24px 28px" }}>
              <p style={{ color: "var(--accent)", fontWeight: 500, margin: 0, fontSize: "1rem" }}>
                Thanks for reaching out! We&apos;ll get back to you within a few days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {state === "error" && (
                <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: 12, color: "#7f1d1d", fontSize: "0.9rem" }}>
                  Something went wrong. Please try again.
                </div>
              )}

              <div>
                <label style={labelStyle}>Name *</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email *</label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Message *</label>
                <textarea required rows={6} value={form.message} onChange={(e) => set("message", e.target.value)} style={{ ...inputStyle, resize: "vertical" }} />
              </div>

              <div style={{ background: "var(--bg-soft)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 18px" }}>
                <p style={{ margin: 0, color: "var(--ink-soft)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  <strong style={{ color: "var(--ink)" }}>Retreat operators:</strong> if you&apos;d like your program considered for inclusion in the directory, please include a link to your website and a brief description of your program.
                </p>
              </div>

              <button
                type="submit"
                disabled={state === "loading"}
                style={{ padding: "13px 28px", borderRadius: 999, background: "var(--ink)", color: "var(--bg)", border: "none", fontWeight: 500, fontSize: "0.95rem", cursor: state === "loading" ? "wait" : "pointer", alignSelf: "flex-start" }}
              >
                {state === "loading" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

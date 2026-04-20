import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterSignup } from "@/components/newsletter-signup";

export const metadata: Metadata = {
  title: "About",
  description: "Great Health Retreats is a curated directory of wellness, longevity, and fitness retreat programs for health-conscious professionals.",
};

function wrap(children: React.ReactNode) {
  return <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>{children}</div>;
}

export default function AboutPage() {
  return (
    <>
      <SiteHeader />

      <header style={{ padding: "72px 0 56px", borderBottom: "1px solid var(--line)" }}>
        {wrap(
          <>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600, marginBottom: "1rem" }}>
              About this directory
            </div>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 1rem" }}>
              A clearer map of the health retreat landscape.
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--ink-soft)", maxWidth: 640, margin: 0 }}>
              Great Health Retreats was built for people who are serious about their health but don&apos;t have time to wade through promotional content or generic listicles.
            </p>
          </>
        )}
      </header>

      <section style={{ padding: "64px 0", borderBottom: "1px solid var(--line)" }}>
        {wrap(
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }} className="two-col">
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 500, margin: "0 0 1rem" }}>Who this is for</h2>
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.75 }}>
                This directory is designed for successful professionals who value their health and their time. People who want a structured, expert-led environment to reset and invest in long-term wellbeing — without the noise.
              </p>
              <p style={{ color: "var(--ink-soft)", lineHeight: 1.75 }}>
                These programs are particularly valuable for individuals who want to establish healthier routines in an immersive environment, work with expert guidance in fitness and nutrition, and see measurable improvements in key health markers.
              </p>
            </div>
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 500, margin: "0 0 1rem" }}>What we evaluate</h2>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Structured programming focused on measurable health improvements",
                  "Qualified practitioners and evidence-informed approaches",
                  "Emphasis on sustainable lifestyle changes",
                  "Strength of overall program design and participant experience",
                  "Environment supportive of recovery and stress reduction",
                  "Reputation among wellness-focused participants",
                ].map((item) => (
                  <li key={item} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", color: "var(--ink-soft)", display: "flex", gap: 12, lineHeight: 1.5 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section style={{ padding: "64px 0", borderBottom: "1px solid var(--line)" }}>
        {wrap(
          <>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 500, margin: "0 0 1rem" }}>Our commitment</h2>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.75, maxWidth: 640 }}>
              We do not accept payment for inclusion. Every retreat in this directory is evaluated against a consistent set of criteria. Cards give you the essentials at a glance — expand for program details, then visit the retreat&apos;s own website for booking.
            </p>
            <p style={{ color: "var(--ink-soft)", lineHeight: 1.75, maxWidth: 640 }}>
              Over time this directory will expand to include additional retreats, longevity clinics worth traveling for, and decision frameworks to help you choose the right program.
            </p>
          </>
        )}
      </section>

      <section style={{ padding: "64px 0", background: "var(--bg-soft)" }}>
        {wrap(
          <div style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: 20, padding: "48px 48px" }}>
            <h2 style={{ color: "var(--bg)", fontSize: "1.6rem", fontWeight: 500, margin: "0 0 0.75rem" }}>Stay in the loop</h2>
            <p style={{ color: "rgba(247,245,239,.8)", marginBottom: "1.5rem", maxWidth: 480 }}>
              Subscribe to receive our curated retreat guide, plus updates as the directory expands.
            </p>
            <NewsletterSignup dark />
          </div>
        )}
      </section>

      <SiteFooter />

      <style>{`@media (max-width: 700px) { .two-col { grid-template-columns: 1fr !important; gap: 32px !important; } }`}</style>
    </>
  );
}

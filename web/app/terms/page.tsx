import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Great Health Retreats.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 0.75rem", color: "var(--ink)" }}>{title}</h2>
      <div style={{ color: "var(--ink-soft)", lineHeight: 1.75, fontSize: "0.97rem" }}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />

      <header style={{ padding: "64px 0 48px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>Terms of Service</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: 0 }}>Last updated: April 2026</p>
        </div>
      </header>

      <section style={{ padding: "56px 0 80px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>
          <Section title="Acceptance of Terms">
            <p>By accessing GreatHealthRetreats.com (&quot;the Site&quot;), you agree to these Terms of Service. If you do not agree, please do not use the Site.</p>
          </Section>

          <Section title="Use of the Directory">
            <p>Great Health Retreats is a curated informational directory. The retreats and programs listed are provided for informational purposes only. We do not book reservations, process payments, or act as an agent for any listed retreat or clinic.</p>
            <p>All bookings, inquiries, and transactions are made directly with the retreat operator via their own website. Great Health Retreats is not a party to any agreement between you and a retreat operator.</p>
          </Section>

          <Section title="No Medical Advice">
            <p>Nothing on this Site constitutes medical advice. The information provided is for general informational purposes only. Always consult a qualified healthcare professional before beginning any health, wellness, or fitness program.</p>
          </Section>

          <Section title="Accuracy of Listings">
            <p>We make reasonable efforts to keep retreat information accurate and up to date. However, programs, pricing, availability, and details may change. We are not responsible for inaccuracies in retreat listings. Always verify information directly with the retreat operator before making any decisions.</p>
          </Section>

          <Section title="Intellectual Property">
            <p>All content on this Site — including text, design, and organization — is owned by Great Health Retreats unless otherwise noted. You may not reproduce or redistribute content without written permission.</p>
          </Section>

          <Section title="Limitation of Liability">
            <p>Great Health Retreats is provided &quot;as is&quot; without warranty of any kind. We are not liable for any loss or damage arising from your use of the Site or reliance on information contained herein, including any health outcomes resulting from participation in listed programs.</p>
          </Section>

          <Section title="Links to Third Parties">
            <p>The Site contains links to external retreat websites. We are not responsible for the content, accuracy, or practices of third-party websites.</p>
          </Section>

          <Section title="Changes to These Terms">
            <p>We may update these terms at any time. Continued use of the Site after changes constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="Contact">
            <p>Questions? <a href="/contact" style={{ color: "var(--accent)" }}>Contact us</a>.</p>
          </Section>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

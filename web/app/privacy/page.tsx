import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Great Health Retreats.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 600, margin: "0 0 0.75rem", color: "var(--ink)" }}>{title}</h2>
      <div style={{ color: "var(--ink-soft)", lineHeight: 1.75, fontSize: "0.97rem" }}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <header style={{ padding: "64px 0 48px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: "0 0 0.5rem" }}>Privacy Policy</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: 0 }}>Last updated: April 2026</p>
        </div>
      </header>

      <section style={{ padding: "56px 0 80px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 24px" }}>
          <Section title="Overview">
            <p>Great Health Retreats (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates GreatHealthRetreats.com. This Privacy Policy explains how we collect, use, and protect information when you visit our site.</p>
          </Section>

          <Section title="Information We Collect">
            <p><strong>Email address.</strong> If you subscribe to our newsletter, we collect your email address to send you the retreat guide and directory updates. We use Beehiiv to manage subscriptions — you can unsubscribe at any time using the link in any email.</p>
            <p><strong>Contact form submissions.</strong> If you send us a message via the contact form, we store your name, email address, and message to respond to your inquiry.</p>
            <p><strong>Analytics.</strong> We use Google Analytics 4 and Vercel Analytics to understand how visitors use the site. These tools may collect anonymized usage data including pages visited, time on site, and general geographic location. No personally identifiable information is linked to analytics data.</p>
          </Section>

          <Section title="How We Use Your Information">
            <p>We use information we collect to: send newsletters and the retreat guide (with your consent), respond to contact inquiries, and improve the directory based on aggregate usage patterns. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </Section>

          <Section title="Cookies">
            <p>Our site may use cookies set by analytics providers (Google Analytics, Vercel). These are used for analytics only. You can disable cookies in your browser settings at any time.</p>
          </Section>

          <Section title="Data Retention">
            <p>Newsletter subscriptions are managed by Beehiiv and retained until you unsubscribe. Contact form submissions are retained for up to 12 months. Analytics data is retained per the default settings of each analytics provider.</p>
          </Section>

          <Section title="Your Rights">
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us via our contact form. Newsletter subscribers can unsubscribe instantly via any email we send.</p>
          </Section>

          <Section title="Changes to This Policy">
            <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about this privacy policy? <a href="/contact" style={{ color: "var(--accent)" }}>Contact us</a>.</p>
          </Section>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

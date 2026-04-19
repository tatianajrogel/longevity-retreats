import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ListingCard } from "@/components/listing-card";
import { FilterBar } from "@/components/filter-bar";
import { getCategories, getListingsByCategory, getListings } from "@/lib/listings";
import type { CategoryRow, ListingWithCategories } from "@/types/listing";

export const revalidate = 60;

type SearchParams = { q?: string; env?: string; lux?: string; cat?: string };

const CATEGORY_BLURBS: Record<string, string> = {
  "comprehensive-luxury":    "Full-service, expert-led immersions built for multi-day lifestyle resets.",
  "mindfulness-restoration": "Programs centered on stress reduction, recovery, and reflective practice.",
  "fitness-lifestyle-reset": "Performance-minded programs with measurable progress in strength and metabolic health.",
  "longevity-clinics":       "Physician-led diagnostic programs with advanced imaging, labs, and prevention strategies.",
};

function wrap(style: React.CSSProperties, children: React.ReactNode) {
  return <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px", ...style }}>{children}</div>;
}

function Section({ id, muted, children, style }: { id?: string; muted?: boolean; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      id={id}
      style={{
        padding: "80px 0",
        borderBottom: "1px solid var(--line)",
        background: muted ? "var(--bg-soft)" : undefined,
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function SectionLabel({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <div style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: gold ? "var(--gold)" : "var(--accent)", fontWeight: 600, marginBottom: "1rem" }}>
      {children}
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "start" }}
      className="two-col">
      {children}
    </div>
  );
}

async function DirectorySection({ q, env, lux, cat }: { q?: string; env?: string; lux?: string; cat?: string }) {
  const hasFilter = !!(q || env || lux || cat);

  let listings: ListingWithCategories[] = [];
  let categories: CategoryRow[] = [];
  let byCategory: { category: CategoryRow; listings: ListingWithCategories[] }[] = [];

  if (hasFilter) {
    const [catRes, listRes] = await Promise.all([
      getCategories(),
      getListings({ q, environment: env, luxuryLevel: lux, categorySlug: cat }),
    ]);
    categories = catRes.categories;
    listings = listRes.listings;
    // Group filtered results by category
    byCategory = categories.map((c) => ({
      category: c,
      listings: listings.filter((l) =>
        (l.listing_categories ?? []).some((lc) => {
          const cc = lc.categories;
          if (!cc) return false;
          const cats = Array.isArray(cc) ? cc : [cc];
          return cats.some((x) => x.id === c.id);
        }),
      ),
    })).filter((g) => g.listings.length > 0);
  } else {
    const [catRes, byCatRes] = await Promise.all([
      getCategories(),
      getListingsByCategory(),
    ]);
    categories = catRes.categories;
    byCategory = byCatRes.byCategory;
    listings = byCategory.flatMap((g) => g.listings);
  }

  return (
    <>
      <Suspense fallback={null}>
        <FilterBar
          categories={categories}
          total={listings.length}
          defaultQ={q}
          defaultEnv={env}
          defaultLux={lux}
          defaultCat={cat}
        />
      </Suspense>

      {byCategory.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--muted)", background: "#fff", border: "1px dashed var(--line)", borderRadius: 16 }}>
          No retreats match those filters. Try resetting.
        </div>
      ) : (
        byCategory.map(({ category, listings: catListings }) => (
          <div key={category.id} style={{ marginBottom: 56 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}>{category.name}</h2>
              <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{catListings.length} {catListings.length === 1 ? "program" : "programs"}</span>
            </div>
            {CATEGORY_BLURBS[category.slug] ? (
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem", maxWidth: 680, margin: "-8px 0 20px" }}>
                {CATEGORY_BLURBS[category.slug]}
              </p>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {catListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q;
  const env = sp.env;
  const lux = sp.lux;
  const cat = sp.cat;

  return (
    <>
      <SiteHeader />

      {/* Hero */}
      <header style={{
        padding: "88px 0 72px",
        background: `
          radial-gradient(1200px 500px at 85% -10%, rgba(47,93,58,.08), transparent 60%),
          radial-gradient(900px 400px at 0% 10%, rgba(169,139,58,.08), transparent 60%),
          var(--bg)
        `,
        borderBottom: "1px solid var(--line)",
      }}>
        {wrap({}, (
          <>
            <div style={{ fontSize: "0.78rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "1.25rem" }}>
              A Curated Directory · Updated April 2026
            </div>
            <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 4.2rem)", fontWeight: 500, letterSpacing: "-0.02em", margin: 0 }}>
              Best Longevity Retreats<br />in the United States.
            </h1>
            <p style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)", color: "var(--ink-soft)", maxWidth: 720, margin: "1.25rem 0 2rem" }}>
              Curated programs designed to support long-term health, energy, and vitality — from structured fitness resets to advanced diagnostic clinics worth traveling for.
            </p>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap", color: "var(--muted)", fontSize: "0.88rem", marginBottom: "2rem" }}>
              {["18 programs reviewed", "Fitness · Mindfulness · Diagnostics", "Updated monthly"].map((s) => (
                <span key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "var(--muted)" }} />
                  {s}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#retreats" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 999, fontWeight: 500, fontSize: "0.95rem", border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--bg)", textDecoration: "none" }}>
                Browse retreats
              </a>
              <a href="#updates" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 999, fontWeight: 500, fontSize: "0.95rem", border: "1px solid var(--ink)", background: "transparent", color: "var(--ink)", textDecoration: "none" }}>
                Get updates
              </a>
            </div>
          </>
        ))}
      </header>

      {/* Guide section */}
      <Section id="guide">
        {wrap({}, (
          <TwoCol>
            <div>
              <SectionLabel>Who this is for</SectionLabel>
              <h2 style={{ margin: 0, fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>A structured way to reset.</h2>
            </div>
            <div>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem" }}>
                This guide is for individuals who are serious about maintaining high levels of physical health, energy, and cognitive performance as they age. Longevity retreats provide structured environments where participants can focus on nutrition, movement, recovery, sleep, and stress reduction — without the distractions of everyday life.
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem" }}>These programs are particularly valuable for individuals who want to:</p>
              <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0" }}>
                {[
                  "Establish healthier routines in an immersive environment",
                  "Work with expert guidance in fitness and nutrition",
                  "See measurable improvements in key health markers",
                  "Reset energy levels and proactively invest in long-term health",
                ].map((item) => (
                  <li key={item} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", color: "var(--ink-soft)", display: "flex", gap: 12 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TwoCol>
        ))}
      </Section>

      {/* Selection criteria */}
      <Section muted>
        {wrap({}, (
          <TwoCol>
            <div>
              <SectionLabel>Selection criteria</SectionLabel>
              <h2 style={{ margin: 0, fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>How retreats are selected.</h2>
            </div>
            <div>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem" }}>
                Longevity retreats combine evidence-based wellness practices with immersive environments designed to improve healthspan, energy, and long-term vitality. The retreats featured here are evaluated on:
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: "1rem 0 0" }}>
                {[
                  "Structured programming focused on measurable health improvements",
                  "Qualified practitioners and evidence-informed approaches",
                  "Emphasis on sustainable lifestyle changes",
                  "Strength of overall program design and participant experience",
                  "Environment supportive of recovery and stress reduction",
                  "Reputation among wellness-focused participants",
                ].map((item) => (
                  <li key={item} style={{ padding: "10px 0", borderBottom: "1px solid var(--line)", color: "var(--ink-soft)", display: "flex", gap: 12 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </TwoCol>
        ))}
      </Section>

      {/* Directory / Retreats */}
      <Section id="retreats">
        {wrap({}, (
          <>
            <SectionLabel>The Directory</SectionLabel>
            <h2 style={{ marginBottom: 8, fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>Explore the retreats.</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem", maxWidth: 680, marginBottom: 12 }}>
              Search and filter across comprehensive luxury programs, mindfulness-focused retreats, structured fitness resets, and longevity clinics worth traveling for.
            </p>
            <Suspense fallback={<div style={{ height: 80 }} />}>
              <DirectorySection q={q} env={env} lux={lux} cat={cat} />
            </Suspense>
          </>
        ))}
      </Section>

      {/* Signup */}
      <Section id="updates" muted>
        {wrap({}, (
          <div style={{
            background: "var(--ink)",
            color: "var(--bg)",
            borderRadius: 20,
            padding: 56,
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 48,
            alignItems: "center",
          }} className="signup-grid">
            <div>
              <SectionLabel gold>Stay in the loop</SectionLabel>
              <h2 style={{ color: "var(--bg)", margin: "0 0 1rem", fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)" }}>Get updates on new retreats and clinics.</h2>
              <p style={{ color: "rgba(247,245,239,.8)", marginBottom: "1.5rem" }}>
                We add new longevity retreats, clinics worth traveling for, and decision frameworks as the directory expands. Drop a note and you&apos;ll be added to the update list.
              </p>
              <a
                href="mailto:cpoznek@gmail.com?subject=Longevity%20Retreats"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 999, fontWeight: 500, fontSize: "0.95rem", border: "1px solid var(--bg)", background: "var(--bg)", color: "var(--ink)", textDecoration: "none" }}
              >
                Email to subscribe
              </a>
              <p style={{ fontSize: "0.82rem", marginTop: 16, color: "rgba(247,245,239,.6)" }}>
                Send to <strong style={{ color: "var(--bg)" }}>cpoznek@gmail.com</strong> · Subject: <em>Longevity Retreats</em>
              </p>
            </div>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem", marginBottom: 12, color: "var(--bg)" }}>Future updates will include</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "rgba(247,245,239,.85)", fontSize: "0.95rem" }}>
                {[
                  "Additional retreat recommendations",
                  "Longevity clinics worth traveling for",
                  "Decision frameworks",
                  "New program discoveries",
                ].map((item) => (
                  <li key={item} style={{ padding: "8px 0", borderBottom: "1px solid rgba(247,245,239,.15)" }}>
                    <span style={{ color: "var(--gold)", fontWeight: 600, marginRight: 6 }}>+</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </Section>

      {/* About */}
      <Section id="about">
        {wrap({}, (
          <TwoCol>
            <div>
              <SectionLabel>About this project</SectionLabel>
              <h2 style={{ margin: 0, fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}>A clearer map of the longevity landscape.</h2>
            </div>
            <div>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem" }}>
                This site was created to help individuals identify high-quality programs that support long-term health, energy, and quality of life.
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem" }}>
                Interest in longevity continues to grow, yet the available information is often fragmented, promotional, or difficult to evaluate objectively. The goal of this project is to create a clear, structured resource that helps individuals make more informed decisions about programs designed to improve healthspan.
              </p>
              <p style={{ color: "var(--ink-soft)", fontSize: "1.02rem" }}>
                Over time, this resource will expand to include additional retreats, longevity clinics, decision frameworks, and curated recommendations for individuals serious about maintaining long-term vitality.
              </p>
            </div>
          </TwoCol>
        ))}
      </Section>

      <SiteFooter />

      <style>{`
        @media (max-width: 860px) {
          .two-col { grid-template-columns: 1fr !important; gap: 24px !important; }
          .signup-grid { grid-template-columns: 1fr !important; padding: 36px !important; }
        }
      `}</style>
    </>
  );
}

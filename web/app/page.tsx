import { CategoryPills } from "@/components/category-pills";
import { ListingCard } from "@/components/listing-card";
import { SearchForm } from "@/components/search-form";
import { getCategories, getListings } from "@/lib/listings";

export const revalidate = 60;

type SearchParams = { q?: string; category?: string };

function isSchemaOrMissingTableError(msg: string | undefined) {
  if (!msg) return false;
  const m = msg.toLowerCase();
  return (
    m.includes("schema cache") ||
    m.includes("does not exist") ||
    m.includes("could not find") ||
    (m.includes("relation") && m.includes("does not exist"))
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q;
  const category = sp.category;

  const [catRes, listRes] = await Promise.all([
    getCategories(),
    getListings({ q, categorySlug: category }),
  ]);

  const errorMessage = catRes.error ?? listRes.error;
  const dbError =
    errorMessage &&
    errorMessage !== "missing_env" &&
    (catRes.error === errorMessage || listRes.error === errorMessage);
  const showMigrationHint = Boolean(dbError && isSchemaOrMissingTableError(errorMessage));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <section className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">
          Trusted programs
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl">
          Find a retreat that matches your goals and pace
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
          Browse vetted programs with clear categories, practical summaries, and
          detail pages that help you decide faster.
        </p>
      </section>

      {dbError ? (
        <div className="mt-10 space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
          <p className="font-medium">We cannot load directory data right now.</p>
          {showMigrationHint ? (
            <ol className="list-decimal space-y-2 pl-5 leading-relaxed">
              <li>
                Open the{" "}
                <strong>Supabase dashboard</strong> for the same project as{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>
                .
              </li>
              <li>
                Go to <strong>SQL Editor</strong>, paste the full file{" "}
                <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
                  supabase/migrations/20260418120000_init.sql
                </code>
                , and <strong>Run</strong> it once.
              </li>
              <li>
                In <strong>Table Editor</strong>, confirm you see{" "}
                <code className="text-xs">categories</code>,{" "}
                <code className="text-xs">listings</code>, and{" "}
                <code className="text-xs">listing_categories</code>.
              </li>
              <li>
                If tables exist but this message persists, wait a minute or use{" "}
                <strong>Project Settings</strong> → restart or refresh so the API
                schema cache updates.
              </li>
            </ol>
          ) : null}
          <p className="rounded-lg bg-white/60 px-3 py-2 font-mono text-xs text-amber-900">
            {errorMessage}
          </p>
        </div>
      ) : null}

      <section className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SearchForm defaultQuery={q} categorySlug={category} />
      </section>

      <section className="mt-8">
        <h2 className="sr-only">Categories</h2>
        {catRes.ok ? (
          <CategoryPills
            categories={catRes.categories}
            activeSlug={category}
            query={q}
          />
        ) : catRes.error === "missing_env" ? (
          <p className="text-sm text-stone-500">
            Categories appear after you add Supabase URL and a public key to{" "}
            <code className="rounded bg-stone-200/60 px-1 text-xs">.env.local</code>
            .
          </p>
        ) : (
          <p className="text-sm text-stone-500">
            Categories are temporarily unavailable.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-stone-900">Listings</h2>
        {!listRes.ok && listRes.error === "missing_env" ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
            Connect Supabase to load listings. Run the SQL migration in{" "}
            <code className="rounded bg-stone-200/60 px-1 py-0.5 text-xs">
              supabase/migrations
            </code>{" "}
            and add your project keys to{" "}
            <code className="rounded bg-stone-200/60 px-1 py-0.5 text-xs">
              .env.local
            </code>
            .
          </p>
        ) : !listRes.ok && listRes.error ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-600">
            Listings are temporarily unavailable while the data connection
            recovers.
          </p>
        ) : listRes.listings.length === 0 ? (
          <p className="mt-4 text-sm text-stone-600">
            No listings match your filters yet.
          </p>
        ) : (
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listRes.listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard listing={listing} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

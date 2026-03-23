import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { getListingBySlug } from "@/lib/listings";
import { normalizeCategories } from "@/types/listing";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getListingBySlug(slug);
  if (!res.ok || !res.listing) {
    return { title: "Listing" };
  }
  return {
    title: res.listing.title,
    description: res.listing.summary,
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const res = await getListingBySlug(slug);

  if (!res.ok && res.error === "missing_env") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-sm text-stone-600">
          Configure Supabase environment variables to view this listing.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-stone-900 underline underline-offset-4"
        >
          Back to directory
        </Link>
      </main>
    );
  }

  if (!res.ok || !res.listing) {
    notFound();
  }

  const listing = res.listing;
  const location = [listing.city, listing.region, listing.country]
    .filter(Boolean)
    .join(", ");

  const categories = normalizeCategories(listing);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href="/"
        className="text-sm font-medium text-stone-600 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        ← Back to directory
      </Link>

      <article className="mt-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
            >
              {c.name}
            </span>
          ))}
          {listing.featured ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-950">
              Featured
            </span>
          ) : null}
        </div>

        <h1 className="mt-4 font-serif text-4xl leading-tight text-stone-900">
          {listing.title}
        </h1>

        {location ? (
          <p className="mt-3 flex items-center gap-2 text-stone-600">
            <MapPin className="h-4 w-4 text-stone-400" aria-hidden />
            {location}
          </p>
        ) : null}

        <p className="mt-6 text-lg leading-relaxed text-stone-700">
          {listing.summary}
        </p>

        {listing.image_url ? (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100">
            <Image
              src={listing.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        ) : null}

        <div className="mt-10 space-y-4 text-base leading-relaxed text-stone-700">
          {listing.body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {listing.website_url ? (
          <a
            href={listing.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            Visit website
          </a>
        ) : null}
      </article>
    </main>
  );
}

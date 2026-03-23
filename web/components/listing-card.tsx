import Image from "next/image";
import Link from "next/link";
import type { ListingWithCategories } from "@/types/listing";
import { normalizeCategories } from "@/types/listing";
import { MapPin } from "lucide-react";

type Props = { listing: ListingWithCategories };

export function ListingCard({ listing }: Props) {
  const location = [listing.city, listing.region].filter(Boolean).join(", ");
  const categories = normalizeCategories(listing).map((c) => c.name);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/listings/${listing.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              Image coming soon
            </div>
          )}
          {listing.featured ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm backdrop-blur">
              Featured
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 3).map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700"
              >
                {name}
              </span>
            ))}
          </div>
          <h2 className="font-serif text-xl leading-snug text-stone-900">
            {listing.title}
          </h2>
          {location ? (
            <p className="flex items-center gap-1.5 text-sm text-stone-600">
              <MapPin className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
              {location}
            </p>
          ) : null}
          <p className="line-clamp-3 text-sm leading-relaxed text-stone-600">
            {listing.summary}
          </p>
          <span className="mt-auto pt-2 text-sm font-medium text-stone-900 underline-offset-4 group-hover:underline">
            View details
          </span>
        </div>
      </Link>
    </article>
  );
}

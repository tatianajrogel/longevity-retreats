import Link from "next/link";
import type { CategoryRow } from "@/types/listing";

type Props = {
  categories: CategoryRow[];
  activeSlug?: string;
  query?: string;
};

function hrefFor(slug: string | undefined, query: string | undefined) {
  const params = new URLSearchParams();
  if (slug) params.set("category", slug);
  if (query?.trim()) params.set("q", query.trim());
  const s = params.toString();
  return s ? `/?${s}` : "/";
}

export function CategoryPills({ categories, activeSlug, query }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={hrefFor(undefined, query)}
        className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
          !activeSlug
            ? "bg-stone-900 text-white"
            : "bg-stone-100 text-stone-700 hover:bg-stone-200"
        }`}
      >
        All
      </Link>
      {categories.map((cat) => {
        const active = activeSlug === cat.slug;
        return (
          <Link
            key={cat.id}
            href={hrefFor(cat.slug, query)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${
              active
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            {cat.name}
          </Link>
        );
      })}
    </div>
  );
}

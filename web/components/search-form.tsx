"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { FormEvent } from "react";

type Props = {
  defaultQuery?: string;
  categorySlug?: string;
};

export function SearchForm({ defaultQuery, categorySlug }: Props) {
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();
    const params = new URLSearchParams();
    if (categorySlug) params.set("category", categorySlug);
    if (q) params.set("q", q);
    const s = params.toString();
    router.push(s ? `/?${s}` : "/");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-xl items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-2 shadow-sm focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-200"
    >
      <Search className="h-5 w-5 shrink-0 text-stone-400" aria-hidden />
      <input
        name="q"
        defaultValue={defaultQuery ?? ""}
        placeholder="Search by name or summary"
        className="min-w-0 flex-1 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
        autoComplete="off"
      />
      <button
        type="submit"
        className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
      >
        Search
      </button>
    </form>
  );
}

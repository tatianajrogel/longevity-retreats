import Link from "next/link";
import { Plus } from "lucide-react";

export function HeaderSubmit() {
  return (
    <Link
      href="/submit-listing"
      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:border-stone-400 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
    >
      <Plus className="h-4 w-4" aria-hidden />
      Submit a listing
    </Link>
  );
}
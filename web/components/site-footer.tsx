import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-stone-600 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>
          Curated Retreats helps travelers compare programs quickly and helps
          operators reach qualified guests through editorial review.
        </p>
        <div className="flex items-center gap-4">
          <p>Applications are reviewed before publication.</p>
          <Link href="/admin/submissions" className="text-stone-500 hover:text-stone-800">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

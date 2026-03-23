import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif text-3xl text-stone-900">Page not found</h1>
      <p className="mt-3 text-sm text-stone-600">
        That listing may be unpublished or the link is outdated.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
      >
        Back home
      </Link>
    </main>
  );
}

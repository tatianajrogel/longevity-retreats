import Link from "next/link";
import { HeaderSubmit } from "@/components/header-submit";

export function SiteHeader() {
  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="group flex flex-col leading-tight">
          <span className="font-serif text-lg tracking-tight text-stone-900 sm:text-xl">
            Curated Retreats
          </span>
          <span className="text-xs text-stone-500">
            Editorial retreat directory for wellness-led travel
          </span>
        </Link>
        <HeaderSubmit />
      </div>
    </header>
  );
}

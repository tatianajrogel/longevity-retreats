import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConfigBanner } from "@/components/config-banner";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    default: "Curated Retreats",
    template: "%s — Curated Retreats",
  },
  description:
    "Discover trusted retreat programs and submit your venue for editorial review.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configured = isSupabaseConfigured();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-stone-50 text-stone-900">
        {!configured ? <ConfigBanner /> : null}
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

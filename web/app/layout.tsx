import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { ConfigBanner } from "@/components/config-banner";
import { isSupabaseConfigured } from "@/lib/env";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Best Longevity Retreats in the U.S. — A Curated Guide",
    template: "%s — Longevity Retreats",
  },
  description:
    "A curated directory of the best longevity retreats and clinics in the United States. Compare programs focused on healthspan, fitness, mindfulness, and advanced diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configured = isSupabaseConfigured();

  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        {!configured ? <ConfigBanner /> : null}
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

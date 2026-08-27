import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { StoreProvider } from "@/components/providers/store-provider";
import { site } from "@/lib/site";
import "./globals.css";

/**
 * Three faces, three jobs. The display serif carries headlines only, the sans carries
 * reading text, and the mono carries anything that would appear on a shipping
 * document — HS codes, MOQ, ports, field labels. next/font self-hosts all three at
 * build time, so the page makes no request to Google.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: `${site.company.name} — Indian exporter of fresh produce, spices and furniture`,
    template: `%s — ${site.company.name}`,
  },
  description: site.company.blurb,
  applicationName: site.company.name,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

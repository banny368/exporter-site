import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingActions } from "@/components/floating-actions";
import { CookieConsent } from "@/components/cookie-consent";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { getCategories, getProductsByCategory } from "@/lib/products";

export default function SiteLayout({ children }: { children: ReactNode }) {
  // The mega-menu shows a product count per category. Counting here keeps the catalogue
  // on the server — the header used to read it from the store, which is what put all
  // sixteen records into the client bundle on every page.
  const categoryCounts = Object.fromEntries(
    getCategories().map((category) => [category.slug, getProductsByCategory(category.slug).length]),
  );

  return (
    <>
      <OrganizationJsonLd />

      <a
        href="#main"
        className="sr-only rounded-crate focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-amber focus:px-4 focus:py-2 focus:text-harbour"
      >
        Skip to content
      </a>

      <Header categoryCounts={categoryCounts} />

      {/*
        No top padding here on purpose. The header is fixed and transparent over the
        hero, so clearance belongs to whatever renders first on each page — PageHero on
        every inner page, the hero section itself on home. Putting it on <main> pushed
        the home hero down 72px and left the near-white page background showing behind
        the transparent header, which made the cream nav text unreadable.
      */}
      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
      <FloatingActions />
      <CookieConsent />
    </>
  );
}

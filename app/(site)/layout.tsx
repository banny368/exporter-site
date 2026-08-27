import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingActions } from "@/components/floating-actions";
import { CookieConsent } from "@/components/cookie-consent";
import { OrganizationJsonLd } from "@/components/seo/json-ld";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OrganizationJsonLd />

      <a
        href="#main"
        className="sr-only rounded-crate focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-amber focus:px-4 focus:py-2 focus:text-harbour"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="flex-1 pt-18">
        {children}
      </main>

      <Footer />
      <FloatingActions />
      <CookieConsent />
    </>
  );
}

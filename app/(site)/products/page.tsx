import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { ProductBrowser } from "@/components/product/product-browser";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Section } from "@/components/ui/section";
import { getProducts } from "@/lib/products";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Product catalogue",
  description:
    "Full export catalogue: fresh fruit and vegetables, dehydrated products and spices, and solid wood furniture. HS code, grade, packing, MOQ and container loadability published for every item.",
  openGraph: { images: ["/og/default.png"] },
};

export default function ProductsPage() {
  const count = getProducts().length;

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products/" },
        ]}
      />

      <PageHero
        eyebrow={`${count} products · 3 verticals`}
        title="The full export catalogue"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
        ]}
        lead={
          <p>
            Every product below is published with the numbers a buyer needs before writing
            an email: HS code, grade, origin cluster, season, packing, minimum order
            quantity and what fits in a container. Filter by what you need, or send us the
            specification and we will tell you whether we can meet it.
          </p>
        }
      />

      <Section>
        <ProductBrowser source="catalogue" />
      </Section>

      <Section tone="kraft" className="py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-[1.5rem] leading-snug md:text-[1.875rem]">
              Need something not listed here?
            </h2>
            <p className="mt-4 text-[1.0625rem] leading-relaxed">
              We source across the same three verticals beyond this catalogue. Send the
              product, grade and quantity and you will have a straight yes or no within 48
              hours, with a quotation if the answer is yes.
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            {site.loading_ports.map((port) => (
              <div key={port} className="border-t border-brass/30 pt-3">
                <dt className="mono-label">Loading port</dt>
                <dd className="mono-data mt-1">{port}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </>
  );
}

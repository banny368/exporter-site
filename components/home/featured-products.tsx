"use client";

import { ProductCard } from "@/components/product/product-card";
import { useMergedSummaries } from "@/components/providers/store-provider";
import type { ProductSummary } from "@/lib/products";

/**
 * The seed arrives as a prop from the server component that renders this, already
 * trimmed to card fields and already limited. Admin edits are merged over it on the
 * client, so a product the client adds in the admin panel still appears here — but a
 * visitor downloads eight summaries rather than the whole catalogue.
 *
 * On first render the store is empty and the merge returns the seed unchanged, which is
 * what keeps the server HTML and the hydrated markup identical.
 */
export function FeaturedProducts({ seed }: { seed: ProductSummary[] }) {
  const products = useMergedSummaries(seed);
  const featured = products.filter((product) => product.is_featured && product.is_published);
  const shown = featured.length ? featured : products;

  return (
    // Two layers on purpose: the inner element scrolls, the outer one clips.
    // `contain-paint` is the part that actually matters — without it Chromium still
    // counts the row's full 2,800px width in the document scroll area and the whole
    // page gains a horizontal scrollbar, even though the row scrolls correctly.
    <div className="-mx-5 overflow-x-clip md:-mx-8">
      <div className="contain-paint overflow-x-auto px-5 pb-4 md:px-8">
        <ul className="flex snap-x snap-mandatory gap-5" role="list">
          {shown.map((product) => (
            <li key={product.id} className="w-76 shrink-0 snap-start md:w-84">
              <ProductCard product={product} source="home-featured" className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

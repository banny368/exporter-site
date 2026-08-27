"use client";

import { ProductCard } from "@/components/product/product-card";
import { useStore } from "@/components/providers/store-provider";

/**
 * Reads through the store rather than the seed import, so a product the client adds in
 * the admin panel shows up here immediately. On first render the store is empty and the
 * merge returns the seed catalogue unchanged, which is what keeps the static HTML and
 * the hydrated markup identical.
 */
export function FeaturedProducts({ limit = 8 }: { limit?: number }) {
  const { products } = useStore();
  const featured = products.filter((product) => product.is_featured && product.is_published);
  const shown = (featured.length ? featured : products).slice(0, limit);

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

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { useMergedSummaries } from "@/components/providers/store-provider";
import type { ProductSummary } from "@/lib/products";

/**
 * The catalogue row.
 *
 * Affordances are drawn from the subject rather than the usual carousel kit: a manifest
 * position readout and a brass travel rail instead of dots, and square arrows sitting in
 * the row's own header instead of chevron discs floating over the photographs. A bare
 * scroller with no controls was the thing that read as unfinished.
 *
 * Seed arrives as a prop, already trimmed and limited, so a visitor downloads eight
 * summaries rather than the catalogue. Admin edits merge over it on the client.
 */
export function FeaturedProducts({ seed }: { seed: ProductSummary[] }) {
  const products = useMergedSummaries(seed);
  const featured = products.filter((product) => product.is_featured && product.is_published);
  const shown = featured.length ? featured : products;

  const scroller = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [index, setIndex] = useState(1);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const node = scroller.current;
    if (!node) return;

    const max = node.scrollWidth - node.clientWidth;
    const ratio = max > 0 ? node.scrollLeft / max : 0;

    setProgress(ratio);
    setAtStart(node.scrollLeft <= 2);
    setAtEnd(node.scrollLeft >= max - 2);

    // Which card is under the left edge — the manifest position, not a page number.
    const card = node.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : 1;
    setIndex(Math.min(shown.length, Math.round(node.scrollLeft / step) + 1));
  }, [shown.length]);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;

    measure();
    node.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      node.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  function page(direction: 1 | -1) {
    const node = scroller.current;
    if (!node) return;
    const card = node.querySelector("li");
    const step = card ? card.getBoundingClientRect().width + 20 : node.clientWidth;
    node.scrollBy({ left: step * direction, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        {/* Position, read as a manifest line rather than a slide count. */}
        <p className="mono-label" aria-live="polite">
          <span className="text-harbour">{String(index).padStart(2, "0")}</span>
          <span className="mx-1.5 opacity-50">/</span>
          {String(shown.length).padStart(2, "0")}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="Show previous products"
            className="grid size-10 place-items-center rounded-crate border border-harbour/25 text-harbour transition-colors hover:border-harbour/60 hover:bg-harbour/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="Show more products"
            className="grid size-10 place-items-center rounded-crate border border-harbour/25 text-harbour transition-colors hover:border-harbour/60 hover:bg-harbour/5 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/*
        Two layers on purpose: the inner element scrolls, the outer one clips.
        `contain-paint` is the part that actually matters — without it Chromium still
        counts the row's full width in the document scroll area and the whole page gains
        a horizontal scrollbar, even though the row scrolls correctly.
      */}
      <div className="-mx-5 overflow-x-clip md:-mx-8">
        <div
          ref={scroller}
          className="carousel-fade contain-paint overflow-x-auto px-5 pb-4 md:px-8"
        >
          <ul className="flex snap-x snap-mandatory gap-5" role="list">
            {shown.map((product) => (
              <li key={product.id} className="w-76 shrink-0 snap-start md:w-84">
                <ProductCard product={product} source="home-featured" className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The travel rail. Fills as the row moves, like a loading gauge. */}
      <div
        className="mt-2 h-px w-full bg-harbour/12"
        role="presentation"
        aria-hidden="true"
      >
        <div
          className="h-px origin-left bg-brass transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${Math.max(0.04, progress)})` }}
        />
      </div>
    </div>
  );
}

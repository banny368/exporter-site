"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SHOT_LABEL: Record<string, string> = {
  hero: "Product",
  macro: "Detail",
  packing: "Export packing",
  context: "In context",
};

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const ordered = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  // A product can legitimately have no photographs yet — one created in the admin panel
  // starts empty — so the gallery degrades to the placeholder rather than crashing.
  const current = ordered[index] ?? {
    id: "placeholder",
    product_id: "",
    url: "/site/no-image.svg",
    alt_text: `${productName} — no photograph added yet`,
    sort_order: 1,
    is_primary: true,
    shot: "hero" as const,
  };

  const go = (next: number) =>
    setIndex(ordered.length ? (next + ordered.length) % ordered.length : 0);

  return (
    <div>
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label={`${productName} images`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            go(index + 1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            go(index - 1);
          }
        }}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0].clientX;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          if (start === null) return;
          const delta = event.changedTouches[0].clientX - start;
          if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
          touchStartX.current = null;
        }}
        className="group relative aspect-4/3 overflow-hidden rounded-crate border border-harbour/12 bg-harbour/5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt_text}
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover"
        />

        <span className="absolute top-4 left-4 rounded-crate border border-brass/50 bg-harbour-deep/80 px-2.5 py-1.5 font-mono text-[0.625rem] tracking-[0.14em] text-kraft uppercase">
          {SHOT_LABEL[current.shot] ?? current.shot}
        </span>

        <Dialog>
          <DialogTrigger
            className="absolute top-4 right-4 rounded-crate border border-brass/50 bg-harbour-deep/80 p-2 text-kraft transition-colors hover:bg-harbour-deep"
            aria-label={`Enlarge image: ${current.alt_text}`}
          >
            <ZoomIn className="size-4" aria-hidden="true" />
          </DialogTrigger>
          <DialogContent title={productName} className="max-w-3xl">
            <div className="relative aspect-4/3 overflow-hidden rounded-crate bg-harbour/5">
              <Image
                src={current.url}
                alt={current.alt_text}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
            <p className="mt-4 text-[0.9375rem]">{current.alt_text}</p>
          </DialogContent>
        </Dialog>

        {ordered.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-crate border border-brass/40 bg-harbour-deep/75 p-2 text-kraft opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-crate border border-brass/40 bg-harbour-deep/75 p-2 text-kraft opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <ul className="mt-3 grid grid-cols-4 gap-3" role="list">
        {ordered.map((image, position) => (
          <li key={image.id}>
            <button
              type="button"
              onClick={() => setIndex(position)}
              aria-current={position === index ? "true" : undefined}
              aria-label={`Show ${SHOT_LABEL[image.shot] ?? image.shot} image`}
              className={cn(
                "relative block aspect-4/3 w-full overflow-hidden rounded-crate border transition-colors",
                position === index
                  ? "border-brass"
                  : "border-harbour/12 hover:border-harbour/40",
              )}
            >
              <Image src={image.url} alt="" fill sizes="140px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>

      <p className="mono-label mt-3">
        Placeholder artwork — replace with the client&rsquo;s own product photographs before launch
      </p>
    </div>
  );
}

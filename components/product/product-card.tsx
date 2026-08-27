"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { useClientValue } from "@/lib/client-hooks";
import { Chip } from "@/components/ui/chip";
import { WhatsAppIconAction } from "@/components/whatsapp/whatsapp-action";
import { useStore } from "@/components/providers/store-provider";
import { getPrimaryImage } from "@/lib/products";
import { productPath } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { withBase } from "@/lib/paths";

export function ProductCard({
  product,
  source,
  className,
}: {
  product: Product;
  source: string;
  className?: string;
}) {
  const { rfq, addToRfq, hydrated } = useStore();
  const image = getPrimaryImage(product);
  const inRfq = hydrated && rfq.some((item) => item.product_id === product.id);

  // "In season" depends on today's date, so it is resolved on the client rather than
  // baked into the static HTML — otherwise the page ships a claim that goes stale.
  const inSeason = useClientValue(
    () => product.season_months.includes(new Date().getMonth() + 1),
    false,
  );

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-crate border border-harbour/12 bg-paper transition-colors hover:border-brass/50",
        className,
      )}
    >
      <Link
        href={productPath(product.category_id, product.slug)}
        className="relative block aspect-4/3 overflow-hidden bg-harbour/5"
        tabIndex={-1}
        aria-hidden="true"
      >
        <Image
          src={withBase(image.url)}
          alt=""
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Chip tone="brass">HS {product.hs_code}</Chip>
          {inSeason ? <Chip tone="default">In season</Chip> : null}
        </div>

        <h3 className="mt-3 text-[1.1875rem] leading-snug">
          <Link
            href={productPath(product.category_id, product.slug)}
            className="transition-colors hover:text-brass focus-visible:text-brass"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mono-label mt-2 normal-case tracking-[0.04em]">{product.variety}</p>

        <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-relaxed text-slate">
          {product.short_description}
        </p>

        <dl className="mt-4 grid gap-1.5 border-t border-brass/25 pt-4">
          <div className="flex gap-3 font-mono text-[0.75rem]">
            <dt className="w-16 shrink-0 tracking-[0.1em] text-slate-soft uppercase">MOQ</dt>
            <dd className="text-harbour">{product.moq}</dd>
          </div>
          <div className="flex gap-3 font-mono text-[0.75rem]">
            <dt className="w-16 shrink-0 tracking-[0.1em] text-slate-soft uppercase">Season</dt>
            <dd className="text-harbour">{product.season}</dd>
          </div>
        </dl>

        <div className="mt-5 flex items-center gap-2 pt-1">
          <Link
            href={productPath(product.category_id, product.slug)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-crate border border-harbour/25 px-4 text-[0.9375rem] font-medium text-harbour transition-colors hover:border-harbour/60 hover:bg-harbour/5"
          >
            View details
          </Link>

          <button
            type="button"
            onClick={() => addToRfq(product.id)}
            disabled={inRfq}
            aria-label={inRfq ? `${product.name} is in your RFQ list` : `Add ${product.name} to RFQ list`}
            className="inline-flex size-11 items-center justify-center rounded-crate border border-harbour/25 text-harbour transition-colors hover:border-harbour/60 hover:bg-harbour/5 disabled:border-brass/50 disabled:bg-brass/10 disabled:text-brass"
          >
            {inRfq ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
          </button>

          <WhatsAppIconAction product={product} source={source} />
        </div>
      </div>
    </article>
  );
}

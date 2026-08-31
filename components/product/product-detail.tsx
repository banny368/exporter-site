"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { ShippingSpecCard, SpecStrip } from "@/components/product/shipping-spec-card";
import { ContainerLoadability } from "@/components/product/container-loadability";
import { Chip } from "@/components/ui/chip";
import { Rule, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useMergedProduct, useMergedSummaries } from "@/components/providers/store-provider";
import { getPrimaryImage, type ProductSummary } from "@/lib/products";
import { withBase } from "@/lib/paths";
import { categoryPath } from "@/lib/site";
import type { Product } from "@/lib/types";

/**
 * The body of a product page, rendered from the record the client can actually see.
 *
 * This is a client component so that admin edits reach it. The catalogue listing has
 * always merged them through useMergedSummaries; this page did not, and read the shipped
 * record straight from the data layer — so replacing a photograph changed the card and
 * left the product's own page showing the old one.
 *
 * Being a client component costs nothing in SEO: Next still renders this to HTML on the
 * server from the seed record, so a crawler sees the deployed catalogue. The metadata,
 * canonical and JSON-LD stay in the route file and read the seed deliberately — search
 * results must describe what is published, never one visitor's local edits.
 */
export function ProductDetail({
  seed,
  categoryName,
  relatedSeed,
}: {
  seed: Product;
  categoryName: string;
  relatedSeed: ProductSummary[];
}) {
  const merged = useMergedProduct(seed);
  const related = useMergedSummaries(relatedSeed);

  // Deleted in the admin panel. The published page still exists — this browser just
  // holds an edit that removes it — so say that rather than render a stale record.
  if (!merged) {
    return (
      <>
        <PageHero
          eyebrow="Removed"
          title={seed.name}
          crumbs={[
            { name: "Home", href: "/" },
            { name: "Products", href: "/products" },
            { name: categoryName, href: categoryPath(seed.category_id) },
          ]}
          lead={<p>You deleted this product in the admin panel, so it is hidden here too.</p>}
        />
        <Section className="py-16 md:py-20">
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed">
            The change is saved in this browser only. Restore it from the admin panel, or
            reset to the seed data, and this page fills back in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={categoryPath(seed.category_id)}>Back to {categoryName}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/products">Open the admin panel</Link>
            </Button>
          </div>
        </Section>
      </>
    );
  }

  const product = merged;
  const packingImage =
    product.images.find((image) => image.shot === "packing")?.url ??
    getPrimaryImage(product).url;

  return (
    <>
      <PageHero
        eyebrow={`HS ${product.hs_code}`}
        title={product.name}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: categoryName, href: `/products/${product.category_id}` },
          { name: product.name, href: `/products/${product.category_id}/${product.slug}` },
        ]}
        lead={<p>{product.short_description}</p>}
        className="pb-0"
      />

      {/* Gallery left, buy column right. */}
      <Section className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="lg:col-span-5">
            <p className="mono-label">{product.sub_category}</p>
            <h2 className="mt-3 text-[1.75rem] leading-snug md:text-[2rem]">{product.variety}</h2>

            <SpecStrip product={product} className="mt-5" />
            <Rule className="my-6" />

            <p className="text-[1.0625rem] leading-relaxed">{product.long_description[0]}</p>

            <ul className="mt-6 flex flex-wrap gap-2" role="list">
              {product.certifications.map((certification) => (
                <li key={certification}>
                  <Chip tone="brass">{certification}</Chip>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <ProductActions product={product} />
            </div>
          </div>
        </div>
      </Section>

      {/* Description. */}
      <Section tone="kraft" className="py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 className="mono-label border-t border-brass/30 pt-4">About this product</h2>
          </div>
          <div className="lg:col-span-9">
            <div className="grid max-w-3xl gap-5">
              {product.long_description.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-[1.0625rem] leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Specification and loadability — the two blocks buyers screenshot. */}
      <Section className="py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ShippingSpecCard product={product} />
          </div>

          <div className="lg:col-span-5">
            <h2 className="mono-label border-t border-brass/30 pt-4">Container loadability</h2>
            <p className="mt-4 mb-6 text-[0.9375rem] leading-relaxed">
              What fits, per container type. Where a container is marked as not offered, it
              is because this product cannot ship that way — not because we have not
              costed it.
            </p>
            <ContainerLoadability loadability={product.loadability} />
          </div>
        </div>
      </Section>

      {/* Quality parameters. */}
      <Section tone="harbour" className="py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 className="mono-label border-t border-brass/40 pt-4 text-brass">
              Quality parameters
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-kraft/70">
              The testable numbers. Each is verified before the container is sealed, at a
              NABL-accredited laboratory where the method calls for one.
            </p>
          </div>

          {/* min-w-0: without it the grid track sizes to the table's min-content and
              the whole page scrolls sideways on a phone. */}
          <div className="min-w-0 lg:col-span-9">
            <div className="contain-paint overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-brass/40">
                    <th scope="col" className="mono-label pb-3 font-normal text-brass">
                      Parameter
                    </th>
                    <th scope="col" className="mono-label pb-3 font-normal text-brass">
                      Specification
                    </th>
                    <th scope="col" className="mono-label pb-3 font-normal text-brass">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.quality_params.map((parameter) => (
                    <tr key={parameter.parameter} className="border-b border-kraft/12">
                      <th scope="row" className="py-3.5 pr-6 text-[0.9375rem] font-normal text-kraft">
                        {parameter.parameter}
                      </th>
                      <td className="py-3.5 pr-6 font-mono text-[0.8125rem] text-kraft/85">
                        {parameter.specification}
                      </td>
                      <td className="py-3.5 font-mono text-[0.75rem] text-kraft/55">
                        {parameter.method ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* Packing, labelling and documents. */}
      <Section className="py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h2 className="mono-label border-t border-brass/30 pt-4">Packing &amp; labelling</h2>
            <p className="mt-6 text-[1.0625rem] leading-relaxed">{product.packing}</p>
            <p className="mt-4 text-[0.9375rem] leading-relaxed">{product.packing_note}</p>

            <div className="relative mt-8 aspect-3/2 overflow-hidden rounded-crate border border-harbour/12 bg-harbour/5">
              <Image
                src={withBase(packingImage)}
                alt={`Export packing for ${product.name}`}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                // An uploaded photograph is a data URL, which the optimiser cannot take.
                unoptimized={packingImage.startsWith("data:")}
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <h2 className="mono-label border-t border-brass/30 pt-4">
              Documents with this shipment
            </h2>
            <ul className="mt-6 grid gap-px overflow-hidden rounded-crate border border-brass/30 bg-brass/25" role="list">
              {product.documents.map((document) => (
                <li key={document} className="flex items-center gap-3 bg-paper px-4 py-3.5">
                  <FileText className="size-4 shrink-0 text-brass-ink" aria-hidden="true" />
                  <span className="font-mono text-[0.8125rem] text-harbour">{document}</span>
                </li>
              ))}
            </ul>
            <p className="mono-label mt-4 normal-case tracking-[0.04em]">
              Draft documents are sent for your approval before they are finalised.
            </p>
          </div>
        </div>
      </Section>

      {/* Related. */}
      <Section tone="kraft" className="py-16 md:py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[1.5rem] leading-snug md:text-[1.875rem]">
            Also in {categoryName}
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={categoryPath(product.category_id)}>
              View the range
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" role="list">
          {related.map((item) => (
            <li key={item.id} className="flex">
              <ProductCard
                product={item}
                source={`related-${product.slug}`}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

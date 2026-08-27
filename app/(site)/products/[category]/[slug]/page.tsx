import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { ShippingSpecCard, SpecStrip } from "@/components/product/shipping-spec-card";
import { ContainerLoadability } from "@/components/product/container-loadability";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import { Chip } from "@/components/ui/chip";
import { Rule, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import {
  getCategoryBySlug,
  getPrimaryImage,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from "@/lib/products";
import { canonicalFor, withBase } from "@/lib/paths";
import { categoryPath, productPath } from "@/lib/site";

type Params = { category: string; slug: string };

export function generateStaticParams(): Params[] {
  return getProducts().map((product) => ({
    category: product.category_id,
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.meta_title,
    description: product.meta_description,
    openGraph: { images: [withBase(product.og_image)], title: product.meta_title },
    alternates: canonicalFor(productPath(product.category_id, product.slug)),
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryBySlug(product.category_id);
  const related = getRelatedProducts(product, 4);

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products/" },
          { name: category?.name ?? "Products", href: categoryPath(product.category_id) },
          { name: product.name, href: productPath(product.category_id, product.slug) },
        ]}
      />

      <PageHero
        eyebrow={`HS ${product.hs_code}`}
        title={product.name}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: category?.name ?? "Products", href: `/products/${product.category_id}` },
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
                src={withBase(
                  product.images.find((image) => image.shot === "packing")?.url ??
                    getPrimaryImage(product).url,
                )}
                alt={`Export packing for ${product.name}`}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
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
            Also in {category?.name ?? "this range"}
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
              <ProductCard product={item} source={`related-${product.slug}`} className="w-full" />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

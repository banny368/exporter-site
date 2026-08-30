import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { ProductBrowser } from "@/components/product/product-browser";
import { SeasonCalendar } from "@/components/product/season-calendar";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
  toProductSummaries,
} from "@/lib/products";
import { canonicalFor, withBase } from "@/lib/paths";
import { truncateAtWord } from "@/lib/seo";
import type { CategorySlug } from "@/lib/types";

type Params = { category: string };

export function generateStaticParams(): Params[] {
  return getCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: truncateAtWord(category.description, 158),
    openGraph: { images: [withBase(`/og/categories/${category.slug}.png`)] },
    alternates: canonicalFor(`/products/${category.slug}/`),
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const products = getProductsByCategory(category.slug as CategorySlug);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products/" },
          { name: category.name, href: `/products/${category.slug}/` },
        ]}
      />

      <PageHero
        eyebrow={`${products.length} products`}
        title={category.name}
        imageSlot={`category.${category.slug}.banner`}
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products" },
          { name: category.name, href: `/products/${category.slug}` },
        ]}
        lead={<p>{category.description}</p>}
      />

      <Section>
        <ProductBrowser
          seed={toProductSummaries(products)}
          category={category.slug as CategorySlug}
          source={`category-${category.slug}`}
        />
      </Section>

      <Section tone="kraft">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <span className="mono-label block border-t border-brass/30 pt-4">
              Shipping this range
            </span>
            <h2 className="mt-6 text-[1.5rem] leading-snug md:text-[1.875rem]">
              What to know before you order
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed">{category.export_note}</p>

            <div className="mt-8 border-t border-brass/30 pt-6">
              <span className="mono-label">Typical packing</span>
              <p className="mt-3 text-[0.9375rem] leading-relaxed">{category.packing_summary}</p>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-crate border border-brass/35 bg-paper p-6">
              <h3 className="text-[1.25rem] leading-snug">Request the full price list</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed">
                Send your destination port and the grades you need. You will get a written
                quotation for this range within 48 hours, on FOB or CIF basis.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/contact">
                    Send an inquiry
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <WhatsAppAction source={`category-${category.slug}-pricelist`} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-brass/30 pt-10">
          <SeasonCalendar
            rows={category.season_calendar}
            caption={`${category.name} — shipping availability by month`}
          />
        </div>
      </Section>
    </>
  );
}

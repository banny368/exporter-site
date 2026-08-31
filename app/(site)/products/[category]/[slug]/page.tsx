import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/json-ld";
import {
  getCategoryBySlug,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  toProductSummaries,
} from "@/lib/products";
import { canonicalFor, withBase } from "@/lib/paths";
import { truncateAtWord } from "@/lib/seo";
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
    // meta_title is authored to stand on its own at around sixty characters. The root
    // template would append the company name and push every product past what a result
    // shows — truncating the origin detail at the end, which is the part buyers search.
    title: { absolute: product.meta_title },
    description: truncateAtWord(product.meta_description, 158),
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
      {/*
        Structured data and metadata are built from the seed record on purpose. A crawler
        must be told what is published, not what one visitor has edited in their own
        browser. The visible page below merges those edits.
      */}
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Products", href: "/products/" },
          { name: category?.name ?? "Products", href: categoryPath(product.category_id) },
          { name: product.name, href: productPath(product.category_id, product.slug) },
        ]}
      />

      <ProductDetail
        seed={product}
        categoryName={category?.name ?? "this range"}
        relatedSeed={toProductSummaries(related)}
      />
    </>
  );
}

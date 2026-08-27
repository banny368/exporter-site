import categoriesJson from "@/data/categories.json";
import dehydratedJson from "@/data/products/dehydrated.json";
import freshProduceJson from "@/data/products/fresh-produce.json";
import furnitureJson from "@/data/products/furniture.json";
import type { Category, CategorySlug, Product, ProductImage } from "./types";

/**
 * The single swap point between this demo and a real backend.
 *
 * Every page and component reads the catalogue through the functions below. To move
 * to Supabase, replace the bodies here with queries — the signatures, and therefore
 * every caller, stay exactly as they are.
 *
 * The JSON is cast through `unknown` because TypeScript widens JSON string literals
 * to `string`, which will not satisfy unions like CategorySlug. The shape is instead
 * verified at runtime by tests/products.test.ts, which asserts on the real seed data.
 */
const PRODUCTS = [
  ...(freshProduceJson as unknown as Product[]),
  ...(dehydratedJson as unknown as Product[]),
  ...(furnitureJson as unknown as Product[]),
];

const CATEGORIES = categoriesJson as unknown as Category[];

export type SortMode = "curated" | "name-asc" | "name-desc" | "recent";

export interface ProductFilters {
  subCategories?: string[];
  certifications?: string[];
  /** Month numbers, 1–12. A product matches if it ships in any of them. */
  months?: number[];
  /** Substring match against the packing description. */
  packing?: string;
  /** Free text across name, variety, HS code, origin and sub-category. */
  search?: string;
}

/** Every product, drafts included. Admin screens use this. */
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

/** Published products only. Everything public-facing uses this. */
export function getProducts(): Product[] {
  return PRODUCTS.filter((product) => product.is_published);
}

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return PRODUCTS.filter((product) => product.category_id === category);
}

export function getCategories(): Category[] {
  return [...CATEGORIES].sort((a, b) => a.sort_order - b.sort_order);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return getProducts()
    .filter((product) => product.is_featured)
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, limit);
}

/**
 * Siblings from the same category, topped up from the rest of the catalogue when the
 * category cannot fill the row — an empty slot in a four-card grid reads as a bug.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const pool = getProducts().filter((candidate) => candidate.slug !== product.slug);
  const siblings = pool.filter((candidate) => candidate.category_id === product.category_id);
  const others = pool.filter((candidate) => candidate.category_id !== product.category_id);

  return [...siblings, ...others]
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, limit);
}

/** All sub-category values present in a set of products, for the filter rail. */
export function getSubCategories(products: Product[]): string[] {
  return [...new Set(products.map((product) => product.sub_category))].sort();
}

/** All certifications present in a set of products, for the filter rail. */
export function getCertifications(products: Product[]): string[] {
  return [...new Set(products.flatMap((product) => product.certifications))].sort();
}

function matchesSearch(product: Product, term: string): boolean {
  const haystack = [
    product.name,
    product.variety,
    product.hs_code,
    product.origin,
    product.sub_category,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(term);
}

/** Filters combine as AND — a buyer narrowing on two axes expects the intersection. */
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const term = filters.search?.trim().toLowerCase();
  const packing = filters.packing?.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.subCategories?.length && !filters.subCategories.includes(product.sub_category)) {
      return false;
    }

    if (
      filters.certifications?.length &&
      !filters.certifications.every((cert) => product.certifications.includes(cert))
    ) {
      return false;
    }

    if (
      filters.months?.length &&
      !filters.months.some((month) => product.season_months.includes(month))
    ) {
      return false;
    }

    if (packing && !product.packing.toLowerCase().includes(packing)) return false;
    if (term && !matchesSearch(product, term)) return false;

    return true;
  });
}

export function sortProducts(products: Product[], mode: SortMode): Product[] {
  const sorted = [...products];

  switch (mode) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "recent":
      return sorted.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    case "curated":
    default:
      return sorted.sort((a, b) => a.sort_order - b.sort_order);
  }
}

/**
 * Primary image, falling back to the first one, and then to a neutral placeholder.
 *
 * This never returns undefined on purpose: a product created in the admin panel starts
 * with no images at all, and every card, gallery and table would otherwise crash on
 * `image.url` the moment it was published.
 */
export function getPrimaryImage(product: Product): ProductImage {
  return (
    product.images.find((image) => image.is_primary) ??
    product.images[0] ?? {
      id: `${product.id}-placeholder`,
      product_id: product.id,
      url: "/site/no-image.svg",
      alt_text: `${product.name} — no photograph added yet`,
      sort_order: 1,
      is_primary: true,
      shot: "hero" as const,
    }
  );
}

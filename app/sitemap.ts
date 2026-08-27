import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/paths";

/**
 * Emitted as a static sitemap.xml by `output: 'export'`. Product URLs are generated
 * from the catalogue, so adding a product to the data layer adds it here with no
 * second edit.
 */
export const dynamic = "force-static";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/products/", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/vision-mission/", priority: 0.5, changeFrequency: "yearly" },
  { path: "/quality/", priority: 0.8, changeFrequency: "monthly" },
  { path: "/export-process/", priority: 0.8, changeFrequency: "monthly" },
  { path: "/global-reach/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/infrastructure/", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact/", priority: 0.9, changeFrequency: "monthly" },
  { path: "/faq/", priority: 0.7, changeFrequency: "monthly" },
  { path: "/privacy/", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms/", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const categoryEntries = getCategories().map((category) => ({
    url: absoluteUrl(`/products/${category.slug}/`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productEntries = getProducts().map((product) => ({
    url: absoluteUrl(`/products/${product.category_id}/${product.slug}/`),
    lastModified: new Date(product.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}

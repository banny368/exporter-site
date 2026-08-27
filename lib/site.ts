import siteJson from "@/data/site.json";
import type { SiteSettings } from "./types";

/**
 * Seed site settings. Everything identity-shaped — company name, WhatsApp number,
 * registration numbers, socials — lives here and nowhere else, so re-branding the
 * whole site is one file edit. The admin panel edits an overlay on top of this.
 */
export const site = siteJson as unknown as SiteSettings;

/** Product detail pages cite the page they were inquired from. */
export function productPath(categorySlug: string, productSlug: string): string {
  return `/products/${categorySlug}/${productSlug}/`;
}

export function categoryPath(categorySlug: string): string {
  return `/products/${categorySlug}/`;
}

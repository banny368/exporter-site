/**
 * Base-path handling for GitHub Pages project sites.
 *
 * next/link, next/image and next/font all prepend basePath themselves. Anything
 * that is a raw string — an image URL from data/products.json, a background-image
 * in inline style, an OG image in metadata — does not, and 404s on Pages unless it
 * goes through withBase().
 */

export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH ?? "";
}

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** Prefix an app-relative path with the deployment base path. Idempotent. */
export function withBase(path: string): string {
  if (!path) return path;
  if (ABSOLUTE.test(path) || path.startsWith("#")) return path;

  const base = getBasePath();
  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (!base) return normalized;
  if (normalized === base || normalized.startsWith(`${base}/`)) return normalized;

  return `${base}${normalized}`;
}

/** Absolute URL for canonicals, OG tags and WhatsApp deep links. */
export function absoluteUrl(path: string): string {
  const origin = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const withBasePath = withBase(path);
  if (!origin) return withBasePath;
  return `${origin}${withBasePath}`;
}

/**
 * Canonical metadata, or nothing.
 *
 * A relative canonical is invalid, and without NEXT_PUBLIC_SITE_URL that is all we can
 * produce — so it is omitted locally and emitted on the deploy, where CI sets the origin.
 */
export function canonicalFor(path: string): { canonical: string } | undefined {
  const url = absoluteUrl(path);
  return url.startsWith("http") ? { canonical: url } : undefined;
}

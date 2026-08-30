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

/**
 * The origin this deployment is reachable at, or "" if it cannot be known.
 *
 * NEXT_PUBLIC_SITE_URL is the real domain and always wins. Without it, Vercel's own
 * system variables still describe the deployment — and using them matters, because a
 * build with no origin at all leaves metadataBase unset, at which point Next resolves
 * og:image against http://localhost:3000 and every share card points at a dead image.
 *
 * Server-only: VERCEL_* are not NEXT_PUBLIC_, so this must not be called from a client
 * component. Every caller today is metadata, robots, sitemap or JSON-LD.
 */
export function siteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  // The project's stable production domain, set on every Vercel deployment.
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  // Failing that, this specific deployment — which is the right answer for a preview.
  const deployment = process.env.VERCEL_URL;
  if (deployment) return `https://${deployment}`;

  return "";
}

/** Absolute URL for canonicals, OG tags and WhatsApp deep links. */
export function absoluteUrl(path: string): string {
  const origin = siteOrigin();
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

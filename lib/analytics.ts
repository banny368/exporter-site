/**
 * Consent-aware analytics wrapper.
 *
 * Nothing fires before the visitor accepts, and nothing fires at all unless a
 * measurement ID is configured — which it is not in the demo. The gate is here rather
 * than in each caller so there is one place to audit before a GDPR-covered launch.
 */

export const CONSENT_KEY = "exporter-demo:v1:consent";

export type ConsentValue = "accepted" | "rejected";

export function readConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* private mode — the banner simply reappears next visit */
  }
}

export function hasAnalyticsConsent(): boolean {
  return readConsent() === "accepted";
}

/** Measurement IDs, all unset in the demo. Adding one is the only wiring needed. */
export const ANALYTICS_IDS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID ?? "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "",
  linkedIn: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "",
};

export function analyticsConfigured(): boolean {
  return Object.values(ANALYTICS_IDS).some(Boolean);
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Forwards an event to GA4 when — and only when — consent is given and an ID exists.
 * The event is always recorded in the local store regardless, because the admin
 * dashboard's "WhatsApp clicks this week" tile is a demo of the client's own data,
 * not a third-party measurement.
 */
export function forwardToAnalytics(name: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent() || !ANALYTICS_IDS.ga4) return;
  window.gtag?.("event", name, params);
}

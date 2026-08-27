import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/paths";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const sitemap = absoluteUrl("/sitemap.xml");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The admin panel and a visitor's own RFQ list have no business in an index.
        disallow: ["/admin/", "/rfq/"],
      },
    ],
    // A relative Sitemap line makes robots.txt invalid, so it is omitted until
    // NEXT_PUBLIC_SITE_URL is set — which the deploy workflow always does.
    sitemap: sitemap.startsWith("http") ? sitemap : undefined,
  };
}

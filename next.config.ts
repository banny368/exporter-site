import type { NextConfig } from "next";

/**
 * Server-rendered on Vercel.
 *
 * This was a static export for GitHub Pages until the site moved to a real domain.
 * Leaving `output: 'export'` behind is what unlocks image optimisation, the inquiry
 * route handler, and server rendering that keeps the catalogue out of the client bundle.
 *
 * `basePath` is kept because it is env-driven and empty on a root domain, so the
 * GitHub Pages preview still builds. `withBase()` in lib/paths.ts stays for the same
 * reason — with no base path it returns its argument unchanged.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  trailingSlash: true,
  images: {
    // AVIF first; Next falls back to WebP and then the original per Accept header.
    formats: ["image/avif", "image/webp"],
    // Widths the layout actually requests. Trimming the default list means fewer
    // variants generated and cached.
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [96, 140, 240, 320],
  },
};

export default nextConfig;

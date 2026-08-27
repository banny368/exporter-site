import type { NextConfig } from "next";

/**
 * Static export for GitHub Pages.
 *
 * GitHub Pages serves a project site from /<repo>, so every asset URL needs that
 * prefix. CI sets NEXT_PUBLIC_BASE_PATH=/<repo>; locally it is empty and the site
 * serves from the root. Anything reading a raw path out of JSON must go through
 * withBase() in lib/paths.ts — next/link and next/image handle basePath themselves.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // No Image Optimization API on static hosting.
  images: { unoptimized: true },
};

export default nextConfig;

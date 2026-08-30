"use client";

import Image, { type ImageProps } from "next/image";
import { useSiteSettings } from "@/components/providers/store-provider";
import { useMediaDataUrl } from "@/lib/client-hooks";
import { getImageSlot } from "@/lib/image-slots";
import { withBase } from "@/lib/paths";

/**
 * An image the client can replace from the admin panel.
 *
 * Resolution order is override, then upload, then the shipped file. An override may be
 * either an uploaded media id or a plain path, so the client can point a slot at a file
 * they have committed to `public/` instead of uploading it.
 *
 * The fallback renders on the server, so crawlers and the first paint always see a real
 * image; a replacement swaps in after hydration. That means an uploaded image is never
 * the LCP candidate, which is the right trade — a data URL in the initial HTML would be
 * far worse for the very metric this site is being judged on.
 */
export function SiteImage({
  slot,
  alt,
  fallback,
  ...props
}: Omit<ImageProps, "src" | "alt"> & {
  slot: string;
  alt: string;
  /** Overrides the registry's shipped path. Rarely needed. */
  fallback?: string;
}) {
  const settings = useSiteSettings();
  const override = settings.images?.[slot];

  // A path override applies directly; anything else is treated as an uploaded media id.
  const isPath = Boolean(override && (override.startsWith("/") || override.startsWith("http")));
  const uploaded = useMediaDataUrl(isPath ? null : override);

  const shipped = fallback ?? getImageSlot(slot)?.fallback ?? "";
  const resolved = isPath ? withBase(override!) : (uploaded ?? withBase(shipped));

  return (
    <Image
      src={resolved}
      alt={alt}
      // An uploaded data URL cannot go through the optimiser, and the shipped files are
      // already sized by the build.
      unoptimized={Boolean(uploaded)}
      {...props}
    />
  );
}

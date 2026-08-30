"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/components/providers/store-provider";
import { useMediaDataUrl } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

/**
 * The identity, in one place.
 *
 * An uploaded logo replaces both the drawn mark and the wordmark. Until one is uploaded
 * — and whenever the upload cannot be read back — this falls back to the mark plus the
 * company name, so the header is never empty.
 *
 * The mark is a loaded crate seen end-on: a stencilled square with a hatched triangle.
 * Drawn inline rather than loaded as a file so it re-colours with the theme.
 */
export function Logo({
  name,
  onDark = false,
  className,
}: {
  /** Overrides the configured wordmark. Rarely needed. */
  name?: string;
  onDark?: boolean;
  className?: string;
}) {
  const settings = useSiteSettings();
  const uploaded = useMediaDataUrl(settings.branding?.logo_media_id);

  const wordmark = name ?? settings.branding?.logo_text ?? "";
  const label = wordmark || settings.company.name;
  const showMark = settings.branding?.show_mark ?? true;

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label={`${label} — home`}
    >
      {uploaded ? (
        <Image
          src={uploaded}
          alt={label}
          width={200}
          height={48}
          unoptimized
          priority
          className="h-11 w-auto object-contain"
        />
      ) : (
        <>
          {showMark ? (
            <svg viewBox="0 0 40 40" className="size-9 shrink-0" aria-hidden="true">
              <rect
                x="1.5"
                y="1.5"
                width="37"
                height="37"
                fill="none"
                stroke="var(--color-brass)"
                strokeWidth="2"
              />
              <path
                d="M9 29 L20 11 L31 29 Z"
                fill="none"
                stroke="var(--color-brass)"
                strokeWidth="2.5"
              />
              <line x1="9" y1="29" x2="31" y2="29" stroke="var(--color-amber)" strokeWidth="3.5" />
            </svg>
          ) : null}

          <span className="grid gap-0.5">
            <span
              className={cn(
                "font-display text-[1.0625rem] leading-none font-semibold tracking-[-0.01em]",
                onDark ? "text-kraft" : "text-harbour",
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "font-mono text-[0.5625rem] leading-none tracking-[0.28em] uppercase",
                onDark ? "text-brass" : "text-slate-soft",
              )}
            >
              Export House
            </span>
          </span>
        </>
      )}
    </Link>
  );
}

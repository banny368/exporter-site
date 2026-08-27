import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The mark is a loaded crate seen end-on: a stencilled square with a hatched
 * triangle. It is drawn inline rather than loaded as a file so the whole identity —
 * mark and name — re-brands from site settings in one place.
 */
export function Logo({
  name,
  onDark = false,
  className,
}: {
  name: string;
  onDark?: boolean;
  className?: string;
}) {
  return (
    // No aria-label: it would have to repeat the visible "Export House" line to avoid a
    // label/content mismatch, and the visible text is already a good accessible name.
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)}>
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

      <span className="grid gap-0.5">
        <span
          className={cn(
            "font-display text-[1.0625rem] leading-none font-semibold tracking-[-0.01em]",
            onDark ? "text-kraft" : "text-harbour",
          )}
        >
          {name}
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
    </Link>
  );
}

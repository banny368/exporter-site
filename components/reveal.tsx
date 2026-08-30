import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A server component. It only marks an element as revealable — one shared observer in
 * <RevealObserver> does the watching for the whole page.
 *
 * This used to be a client component holding its own IntersectionObserver, which meant
 * a page with a dozen revealed blocks hydrated a dozen React trees purely to add one
 * attribute. The markup is identical; the cost is not.
 *
 * Reduced motion is handled in CSS, so an element is never left invisible if the
 * observer never runs.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  return (
    <Tag
      data-reveal=""
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

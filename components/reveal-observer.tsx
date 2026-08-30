"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * One IntersectionObserver for every [data-reveal] element on the page.
 *
 * Mounted once in the site layout. Elements are server-rendered by <Reveal>; this only
 * flips data-visible when they scroll in, so the reveal animation costs a single client
 * component per page rather than one per revealed block.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])"),
    );
    if (targets.length === 0) return;

    // Nothing to animate: show everything at once and skip the observer entirely.
    if (reduced) {
      for (const target of targets) target.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
    // Re-query after a client-side navigation, which swaps the whole page body.
  }, [pathname]);

  return null;
}

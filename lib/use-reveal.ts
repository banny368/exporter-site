"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/client-hooks";

/**
 * Observe a single element and report when it first scrolls into view.
 *
 * Most reveals on the site do NOT use this — they are server-rendered by <Reveal> and
 * driven by one shared observer in <RevealObserver>, so that a page with a dozen
 * revealed blocks does not hydrate a dozen client components. This hook remains for the
 * rare case that needs the visibility flag in React state, such as starting the counter
 * animation on the About page.
 */
export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || typeof IntersectionObserver === "undefined") return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          window.setTimeout(() => setSeen(true), delay);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [delay, reduced]);

  return { ref, visible: seen || reduced };
}

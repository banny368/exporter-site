"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

/**
 * The only motion on the site: content lifts 14px into place once, on first scroll into
 * view. Reduced motion is handled in three places — this hook skips the observer
 * entirely, the CSS neutralises the transform, and the reveal class defaults to visible.
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

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}

export function Reveal({ children, className, delay = 0, as: Tag = "div" }: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(delay);

  return (
    <Tag ref={ref} className={cn("reveal", className)} data-visible={visible}>
      {children}
    </Tag>
  );
}

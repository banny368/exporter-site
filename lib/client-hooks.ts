"use client";

import { useSyncExternalStore } from "react";

/**
 * Reading browser-only state without a hydration mismatch.
 *
 * The obvious approach — `useState(false)` plus an effect that reads the real value —
 * works, but it sets state synchronously inside an effect, which React flags because it
 * forces a second render pass. `useSyncExternalStore` expresses the same thing properly:
 * a server snapshot for the static HTML, a client snapshot after hydration, and an
 * optional subscription when the value can change.
 *
 * The snapshot function must return a referentially stable value, so these all return
 * primitives.
 */

const NEVER_CHANGES = () => () => {};

/** A browser value read once, that will not change during the page's life. */
export function useClientValue<T extends string | number | boolean | null>(
  read: () => T,
  serverValue: T,
): T {
  return useSyncExternalStore(NEVER_CHANGES, read, () => serverValue);
}

/** True once the page has scrolled past `threshold`. Drives the sticky header. */
export function useScrolledPast(threshold = 24): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("scroll", onChange, { passive: true });
      return () => window.removeEventListener("scroll", onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

/**
 * Honours the visitor's motion preference, and keeps honouring it if they change the
 * setting while the page is open. Defaults to false on the server so the static HTML
 * matches the common case.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * True while a Radix modal is open — it locks pointer events on the body. Used to hide
 * the floating actions, which otherwise sit on top of an open dialog.
 */
export function useModalOpen(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange);
      observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });
      return () => observer.disconnect();
    },
    () => document.body.style.pointerEvents === "none",
    () => false,
  );
}

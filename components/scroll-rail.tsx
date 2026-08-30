"use client";

import { useEffect, useRef } from "react";

/**
 * A two-pixel brass line across the top of the viewport that fills as the page scrolls.
 *
 * The one piece of ambient motion on the site. It writes a transform directly to the
 * node inside a rAF rather than going through React state, so scrolling never triggers a
 * render — the whole point is that it costs nothing on a page already fighting for its
 * performance budget.
 *
 * Hidden entirely under prefers-reduced-motion, in CSS, so it never even animates.
 */
export function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = rail.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(1, doc.scrollTop / max) : 0;
      node.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <div ref={rail} className="scroll-rail" style={{ transform: "scaleX(0)" }} />;
}

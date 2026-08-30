"use client";

import { useEffect, useState } from "react";
import { useReveal } from "@/lib/use-reveal";
import { usePrefersReducedMotion } from "@/lib/client-hooks";
import type { StatCounter } from "@/lib/types";

/**
 * Counts up once, when the row first scrolls into view. Under reduced motion the final
 * figure renders immediately — the ticking is decoration, the number is the content.
 */
function Counter({ stat, active }: { stat: StatCounter; active: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || reduced) return;

    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // Ease out, so it settles rather than stopping dead.
      setValue(Math.round(stat.value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduced, stat.value]);

  const shown = reduced || !active ? (active ? stat.value : 0) : value;

  return (
    <div className="border-t border-brass/30 pt-5">
      <p className="font-display text-[2.5rem] leading-none font-semibold text-harbour md:text-[3rem]">
        {shown.toLocaleString("en-GB")}
        <span className="text-brass">{stat.suffix}</span>
      </p>
      <p className="mono-label mt-3">{stat.label}</p>
    </div>
  );
}

export function StatCounters({ stats }: { stats: StatCounter[] }) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Counter key={stat.label} stat={stat} active={visible} />
      ))}
    </div>
  );
}

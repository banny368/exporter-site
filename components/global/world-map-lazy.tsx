"use client";

import dynamic from "next/dynamic";
import { useReveal } from "@/lib/use-reveal";
import type { MapPoint, PortRoute } from "@/lib/types";

/**
 * The map costs roughly 130KB of library plus topology. This keeps all of it out of the
 * initial bundle: the import only starts once the section scrolls into view, so it never
 * competes with the LCP element and never loads at all for a visitor who does not reach
 * this part of the page.
 *
 * ssr: false because react-simple-maps fetches the topology in the browser; there is
 * nothing useful to render on the server, and the reserved box prevents layout shift.
 */
const WorldMap = dynamic(() => import("./world-map").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <MapPlaceholder />,
});

function MapPlaceholder() {
  return (
    <div
      className="flex w-full items-center justify-center rounded-crate border border-kraft/15 bg-kraft/[0.03]"
      style={{ aspectRatio: "980 / 430" }}
    >
      <span className="mono-label text-kraft/45">Loading the route map…</span>
    </div>
  );
}

export function LazyWorldMap({
  markets,
  ports,
  className,
}: {
  markets: MapPoint[];
  ports: Pick<PortRoute, "port" | "lat" | "lon">[];
  className?: string;
}) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {visible ? <WorldMap markets={markets} ports={ports} /> : <MapPlaceholder />}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Line,
  Marker,
} from "react-simple-maps";
import { withBase } from "@/lib/paths";
import type { MapPoint, PortRoute } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Real geography: 110m country outlines from world-atlas, drawn through react-simple-maps.
 *
 * Loaded through next/dynamic and gated behind a scroll observer by its wrapper, so the
 * ~130KB of library and topology never touches the initial bundle or the LCP element on
 * any page — including the pages that do not show a map at all.
 *
 * Destination markets and loading ports both come from settings, so the admin panel can
 * add a location and the arc redraws with no code change.
 */

// Served from our own origin, not a CDN: the site makes no third-party requests, which
// keeps the cookie-consent story simple and removes an outage we do not control.
const GEO_URL = withBase("/geo/countries-110m.json");

/** The origin every route is drawn from. */
const INDIA: [number, number] = [78.9, 20.6];

export function WorldMap({
  markets,
  ports,
  className,
}: {
  markets: MapPoint[];
  ports: Pick<PortRoute, "port" | "lat" | "lon">[];
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  // Countries to fill differently. Falls back to the display name when no geo name is set.
  const served = new Set(markets.map((market) => market.geo_name ?? market.name));

  return (
    <figure className={cn("overflow-hidden", className)}>
      <ComposableMap
        projection="geoEqualEarth"
        // Centred on the trade lanes rather than the globe: India sits mid-frame and the
        // empty southern ocean is cropped out.
        projectionConfig={{ scale: 185, center: [42, 22] }}
        width={980}
        height={430}
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={`Markets served: ${markets.map((m) => m.name).join(", ")}`}
      >
        <Graticule stroke="var(--color-kraft)" strokeOpacity={0.1} step={[20, 20]} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isServed = served.has(String(geo.properties?.name ?? ""));
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isServed ? "var(--color-brass)" : "var(--color-kraft)"}
                  fillOpacity={isServed ? 0.32 : 0.09}
                  stroke="var(--color-kraft)"
                  strokeOpacity={0.22}
                  strokeWidth={0.4}
                  style={{ outline: "none" }}
                />
              );
            })
          }
        </Geographies>

        {/* Routes, drawn origin to destination. */}
        {markets.map((market) => (
          <Line
            key={`route-${market.name}`}
            from={INDIA}
            to={[market.lon, market.lat]}
            stroke="var(--color-brass)"
            strokeWidth={active === market.name ? 2 : 0.9}
            strokeOpacity={active === market.name ? 0.95 : 0.32}
            strokeLinecap="round"
          />
        ))}

        {/* Loading ports on the Indian coast. */}
        {ports.map((port) => (
          <Marker key={port.port} coordinates={[port.lon, port.lat]}>
            <rect
              x={-3.5}
              y={-3.5}
              width={7}
              height={7}
              fill="var(--color-amber)"
              stroke="var(--color-harbour-deep)"
              strokeWidth={1.2}
            />
          </Marker>
        ))}

        {/* Destination markets. */}
        {markets.map((market) => (
          <Marker
            key={market.name}
            coordinates={[market.lon, market.lat]}
            onMouseEnter={() => setActive(market.name)}
            onMouseLeave={() => setActive(null)}
          >
            <g
              tabIndex={0}
              role="img"
              aria-label={market.name}
              onFocus={() => setActive(market.name)}
              onBlur={() => setActive(null)}
              className="cursor-default focus:outline-none"
            >
              <circle
                r={active === market.name ? 6 : 3.6}
                fill="var(--color-kraft)"
                fillOpacity={active === market.name ? 1 : 0.9}
              />
              {/* Generous invisible hit area — the visible dot is too small to aim at. */}
              <circle r={11} fill="transparent" />
              {active === market.name ? (
                <text
                  x={12}
                  y={4}
                  fontFamily="var(--font-mono)"
                  fontSize={13}
                  letterSpacing={1.4}
                  fill="var(--color-kraft)"
                >
                  {market.name.toUpperCase()}
                </text>
              ) : null}
            </g>
          </Marker>
        ))}
      </ComposableMap>

      <figcaption className="mono-label mt-4 text-kraft/55">
        Amber marks the loading ports. Hover or tab a marker to name the market.
      </figcaption>
    </figure>
  );
}

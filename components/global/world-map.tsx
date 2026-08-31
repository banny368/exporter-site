"use client";

import { useMemo, useState } from "react";
import { geoEqualEarth } from "d3-geo";
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

/**
 * The origin country, named as the topology names it.
 *
 * It needs its own fill. Only destination markets were highlighted, so the country the
 * whole map is about drew at the same 9% as the countries nobody ships to — which left
 * the amber loading ports apparently floating in the Arabian Sea.
 */
const ORIGIN_COUNTRY = "India";

/**
 * Antarctica is dropped rather than drawn.
 *
 * Nothing ships there, and on an equal-earth projection it is a band wide enough to
 * dominate the frame: with it in, the drawn content ran 110px past the bottom of the
 * viewBox while 111px sat empty on the right. Removing it lets the trade lanes centre.
 */
const OMITTED = new Set(["Antarctica"]);

const WIDTH = 980;
const HEIGHT = 430;

/**
 * Room kept clear inside the frame.
 *
 * Right is widest because a hovered market writes its name to the right of its dot; the
 * rest is enough that a marker never touches an edge.
 */
const PADDING = { top: 34, right: 132, bottom: 40, left: 44 };

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

  /**
   * The frame is fitted to the locations actually plotted, not hardcoded.
   *
   * A fixed scale and centre cannot know where the client has put things. The previous
   * one was centred at 42°E, which cut 114px off the left edge — and the USA and Canada
   * markers with it — while 111px of empty ocean sat on the right. Fitting to the points
   * means every port, market and the origin is inside the frame with room to spare, and
   * adding a location in the admin panel reframes the map instead of pushing a marker
   * off the edge.
   */
  const projection = useMemo(() => {
    const coordinates: [number, number][] = [
      INDIA,
      ...ports.map((port): [number, number] => [port.lon, port.lat]),
      ...markets.map((market): [number, number] => [market.lon, market.lat]),
    ];

    return geoEqualEarth().fitExtent(
      [
        [PADDING.left, PADDING.top],
        [WIDTH - PADDING.right, HEIGHT - PADDING.bottom],
      ],
      { type: "MultiPoint", coordinates },
    );
  }, [markets, ports]);

  // Countries to fill differently. Falls back to the display name when no geo name is set.
  const served = new Set(markets.map((market) => market.geo_name ?? market.name));

  return (
    <figure className={cn("overflow-hidden", className)}>
      <ComposableMap
        projection={projection}
        width={WIDTH}
        height={HEIGHT}
        style={{ width: "100%", height: "auto" }}
        role="img"
        aria-label={`Markets served: ${markets.map((m) => m.name).join(", ")}`}
      >
        <Graticule stroke="var(--color-kraft)" strokeOpacity={0.1} step={[20, 20]} />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies
              .filter((geo) => !OMITTED.has(String(geo.properties?.name ?? "")))
              .map((geo) => {
                const name = String(geo.properties?.name ?? "");
                const isOrigin = name === ORIGIN_COUNTRY;
                const isServed = served.has(name);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isOrigin
                        ? "var(--color-brass-bright)"
                        : isServed
                          ? "var(--color-brass)"
                          : "var(--color-kraft)"
                    }
                    fillOpacity={isOrigin ? 0.55 : isServed ? 0.32 : 0.09}
                    stroke="var(--color-kraft)"
                    strokeOpacity={isOrigin ? 0.5 : 0.22}
                    strokeWidth={isOrigin ? 0.7 : 0.4}
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

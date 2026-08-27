"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A chart, not an atlas.
 *
 * Rather than shipping a megabyte of country geometry to decorate one section, this
 * draws what the section is actually about: a graticule, the loading ports on the
 * Indian coast, the destination markets at their true coordinates, and a great-circle
 * arc between them. It reads as a route plan because that is what it is.
 */

const MARKET_COORDS: Record<string, [number, number]> = {
  UAE: [24.0, 54.0],
  "Saudi Arabia": [24.0, 45.0],
  Oman: [21.0, 57.0],
  Qatar: [25.3, 51.2],
  Kuwait: [29.3, 47.5],
  Bahrain: [26.0, 50.5],
  "United Kingdom": [54.0, -2.0],
  Netherlands: [52.2, 5.3],
  Germany: [51.0, 10.5],
  France: [46.6, 2.2],
  Denmark: [56.0, 10.0],
  Spain: [40.4, -3.7],
  Sweden: [60.1, 18.6],
  USA: [39.0, -98.0],
  Canada: [56.0, -106.0],
  Malaysia: [4.2, 101.9],
  Vietnam: [14.0, 108.0],
  Singapore: [1.35, 103.8],
  Indonesia: [-2.5, 118.0],
  Russia: [58.0, 60.0],
  Kazakhstan: [48.0, 67.0],
  Uzbekistan: [41.4, 64.6],
  Japan: [36.2, 138.2],
  Iran: [32.4, 53.7],
  Iraq: [33.2, 43.7],
  Bangladesh: [23.7, 90.4],
  "Sri Lanka": [7.9, 80.8],
  Morocco: [31.8, -7.1],
  Maldives: [3.2, 73.2],
  Australia: [-25.3, 133.8],
};

const INDIA: [number, number] = [20.6, 78.9];

const W = 1000;
const H = 460;
const LON = [-130, 150] as const;
const LAT = [-40, 72] as const;

function project([lat, lon]: [number, number]): [number, number] {
  const x = ((lon - LON[0]) / (LON[1] - LON[0])) * W;
  const y = ((LAT[1] - lat) / (LAT[1] - LAT[0])) * H;
  return [x, y];
}

/** A shallow arc, bowed towards the pole, the way a sailing route is drawn. */
function arc(from: [number, number], to: [number, number]): string {
  const [x1, y1] = project(from);
  const [x2, y2] = project(to);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * 0.18;
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

export function WorldMap({
  markets,
  ports,
  className,
}: {
  markets: string[];
  ports: { port: string; lat: number; lon: number }[];
  className?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const plotted = markets.filter((market) => market in MARKET_COORDS);

  return (
    <figure className={cn("overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full min-w-[36rem]"
        role="img"
        aria-label={`Markets served: ${plotted.join(", ")}`}
      >
        <defs>
          <pattern id="graticule" width="50" height="46" patternUnits="userSpaceOnUse">
            <path
              d="M50 0 V46 M0 46 H50"
              fill="none"
              stroke="var(--color-kraft)"
              strokeOpacity="0.12"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width={W} height={H} fill="url(#graticule)" />

        {/* Equator and the Tropic of Cancer — the latitudes this trade actually sits on. */}
        {[0, 23.44].map((lat) => {
          const [, y] = project([lat, 0]);
          return (
            <g key={lat}>
              <line
                x1="0"
                y1={y}
                x2={W}
                y2={y}
                stroke="var(--color-brass)"
                strokeOpacity="0.3"
                strokeDasharray="6 8"
              />
              <text
                x="8"
                y={y - 8}
                fontFamily="var(--font-mono)"
                fontSize="11"
                letterSpacing="2"
                fill="var(--color-brass)"
                fillOpacity="0.7"
              >
                {lat === 0 ? "EQUATOR" : "TROPIC OF CANCER"}
              </text>
            </g>
          );
        })}

        <g>
          {plotted.map((market) => (
            <path
              key={`arc-${market}`}
              d={arc(INDIA, MARKET_COORDS[market])}
              fill="none"
              stroke="var(--color-brass)"
              strokeOpacity={active === market ? 0.95 : 0.28}
              strokeWidth={active === market ? 2.4 : 1.2}
            />
          ))}
        </g>

        <g>
          {ports.map((port) => {
            const [x, y] = project([port.lat, port.lon]);
            return (
              <g key={port.port}>
                <rect
                  x={x - 3.5}
                  y={y - 3.5}
                  width="7"
                  height="7"
                  fill="var(--color-amber)"
                  stroke="var(--color-harbour)"
                  strokeWidth="1.5"
                />
              </g>
            );
          })}
          <text
            {...(() => {
              const [x, y] = project(INDIA);
              return { x: x + 14, y: y + 34 };
            })()}
            fontFamily="var(--font-mono)"
            fontSize="13"
            letterSpacing="2.4"
            fill="var(--color-amber)"
          >
            LOADING PORTS · INDIA
          </text>
        </g>

        <g>
          {plotted.map((market) => {
            const [x, y] = project(MARKET_COORDS[market]);
            const isActive = active === market;

            return (
              <g
                key={market}
                onMouseEnter={() => setActive(market)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(market)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                role="img"
                aria-label={market}
                className="cursor-default focus:outline-none"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 7 : 4.5}
                  fill="var(--color-kraft)"
                  fillOpacity={isActive ? 1 : 0.85}
                />
                <circle cx={x} cy={y} r="12" fill="transparent" />
                {isActive ? (
                  <text
                    x={x + 14}
                    y={y + 4}
                    fontFamily="var(--font-mono)"
                    fontSize="14"
                    letterSpacing="1.6"
                    fill="var(--color-kraft)"
                  >
                    {market.toUpperCase()}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      <figcaption className="mono-label mt-4 text-kraft/70">
        Amber marks the six loading ports. Hover or tab a marker to name the market.
      </figcaption>
    </figure>
  );
}

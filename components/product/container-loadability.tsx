import type { Loadability } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Container loadability, drawn to scale.
 *
 * The tiles are not uniform boxes: a 40ft really is twice the length of a 20ft, so the
 * 40ft tiles span two grid columns and their silhouettes come out at true relative
 * proportions. The 40ft HQ is visibly taller than the standard 40ft because it is —
 * 2.90 m against 2.59 m. The shape of the tile carries the information; the mono
 * figures confirm it.
 */

interface Tile {
  key: keyof Loadability;
  label: string;
  /** External dimensions in metres, length × height. */
  dims: [number, number];
  span: 1 | 2;
  note: string;
}

const TILES: Tile[] = [
  { key: "20ft", label: "20FT", dims: [6.06, 2.59], span: 1, note: "6.06 × 2.44 × 2.59 m" },
  { key: "reefer", label: "REEFER", dims: [6.06, 2.59], span: 1, note: "Temperature controlled" },
  { key: "40ft", label: "40FT", dims: [12.19, 2.59], span: 2, note: "12.19 × 2.44 × 2.59 m" },
  { key: "40ft_hq", label: "40FT HQ", dims: [12.19, 2.9], span: 2, note: "12.19 × 2.44 × 2.90 m" },
];

/** Values like "Not offered — cold chain only" mean this container is not on the table. */
function isUnavailable(value: string): boolean {
  return /^not\s/i.test(value.trim());
}

function ContainerSilhouette({
  dims,
  muted,
  onDark,
}: {
  dims: [number, number];
  muted: boolean;
  onDark: boolean;
}) {
  const [length, height] = dims;
  // 1 metre = 40 units, so every silhouette on the page shares one scale.
  const w = length * 40;
  const h = height * 40;
  const stroke = onDark ? "#E8DFD0" : "#0E2A33";
  const accent = "#C08A2E";
  const ribs = Math.max(6, Math.round(length * 1.6));

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full"
      role="presentation"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="2"
        width={w - 4}
        height={h - 4}
        fill={muted ? "transparent" : stroke}
        fillOpacity={muted ? 0 : 0.06}
        stroke={muted ? stroke : accent}
        strokeOpacity={muted ? 0.28 : 0.8}
        strokeWidth="3"
        strokeDasharray={muted ? "8 7" : undefined}
      />
      <g stroke={stroke} strokeOpacity={muted ? 0.12 : 0.22} strokeWidth="2">
        {Array.from({ length: ribs - 1 }, (_, i) => {
          const x = ((i + 1) * w) / ribs;
          return <line key={i} x1={x} y1="10" x2={x} y2={h - 10} />;
        })}
      </g>
      {/* Corner castings — the detail that makes it read as a container, not a rectangle. */}
      <g fill={stroke} fillOpacity={muted ? 0.18 : 0.45}>
        <rect x="2" y="2" width="14" height="12" />
        <rect x={w - 16} y="2" width="14" height="12" />
        <rect x="2" y={h - 14} width="14" height="12" />
        <rect x={w - 16} y={h - 14} width="14" height="12" />
      </g>
    </svg>
  );
}

export function ContainerLoadability({
  loadability,
  onDark = false,
  className,
}: {
  loadability: Loadability;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-4 md:gap-5">
        {TILES.map((tile) => {
          const value = loadability[tile.key];
          const muted = isUnavailable(value);

          return (
            <div
              key={tile.key}
              className={cn(
                "rounded-crate border p-4 md:p-5",
                tile.span === 2 ? "col-span-2" : "col-span-1",
                onDark ? "border-kraft/20 bg-kraft/[0.04]" : "border-harbour/15 bg-harbour/[0.02]",
                muted && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className={cn("mono-label", onDark ? "text-brass" : "text-harbour")}>
                  {tile.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-[0.625rem] tracking-[0.1em]",
                    onDark ? "text-kraft/70" : "text-slate-soft",
                  )}
                >
                  {tile.note}
                </span>
              </div>

              <div className="mt-3.5 mb-3.5">
                <ContainerSilhouette dims={tile.dims} muted={muted} onDark={onDark} />
              </div>

              <p
                className={cn(
                  "font-mono text-[0.8125rem] leading-snug",
                  muted
                    ? onDark
                      ? "text-kraft/70"
                      : "text-slate-soft"
                    : onDark
                      ? "text-kraft"
                      : "text-harbour",
                )}
              >
                {value}
              </p>
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          "mono-label mt-4",
          onDark ? "text-kraft/70" : "text-slate-soft",
        )}
      >
        Silhouettes drawn to one scale — a 40ft is twice the length of a 20ft
      </p>
    </div>
  );
}

"use client";

import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { LazyWorldMap } from "@/components/global/world-map-lazy";
import { useStore } from "@/components/providers/store-provider";
import type { MapPoint, PortRoute } from "@/lib/types";

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-2.5 py-2 font-mono text-[0.8125rem] focus-visible:border-brass-ink";

/** Latitude and longitude, kept as numbers and clamped to the real range. */
function coord(value: string, max: number): number {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(-max, Math.min(max, n));
}

export default function AdminMapPage() {
  const { settings, saveSettings } = useStore();

  const markets = settings.market_points ?? [];
  const ports = settings.ports ?? [];

  function writeMarkets(next: MapPoint[]) {
    saveSettings({ market_points: next });
  }

  function writePorts(next: PortRoute[]) {
    saveSettings({ ports: next });
  }

  return (
    <>
      <AdminHeader
        title="Map"
        lead="Loading ports and destination markets. Every route on the map is drawn from these coordinates, so adding a location redraws it — there is no separate list of lines to keep in step."
      />

      <section className="mb-10">
        <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Live preview</h2>
        <div className="rounded-crate bg-harbour p-5">
          <LazyWorldMap markets={markets} ports={ports} />
        </div>
      </section>

      {/* ----------------------------------------------------------- ports -- */}
      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-brass/25 pb-3">
          <h2 className="mono-label">Loading ports — where shipments start</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              writePorts([
                ...ports,
                { port: "New port", code: "", lat: 20, lon: 78, transits: [] },
              ])
            }
          >
            <Plus className="size-4" aria-hidden="true" />
            Add a port
          </Button>
        </div>

        <ul className="grid gap-3" role="list">
          {ports.map((port, index) => (
            <li key={index} className="rounded-crate border border-harbour/12 p-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_7rem_6rem_6rem_auto] sm:items-end">
                <label className="grid gap-1.5">
                  <span className="mono-label">Port</span>
                  <input
                    value={port.port}
                    onChange={(event) => {
                      const next = [...ports];
                      next[index] = { ...port, port: event.target.value };
                      writePorts(next);
                    }}
                    className={FIELD}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="mono-label">UN/LOCODE</span>
                  <input
                    value={port.code}
                    onChange={(event) => {
                      const next = [...ports];
                      next[index] = { ...port, code: event.target.value.toUpperCase() };
                      writePorts(next);
                    }}
                    className={FIELD}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="mono-label">Latitude</span>
                  <input
                    type="number"
                    step="0.01"
                    value={port.lat}
                    onChange={(event) => {
                      const next = [...ports];
                      next[index] = { ...port, lat: coord(event.target.value, 90) };
                      writePorts(next);
                    }}
                    className={FIELD}
                  />
                </label>

                <label className="grid gap-1.5">
                  <span className="mono-label">Longitude</span>
                  <input
                    type="number"
                    step="0.01"
                    value={port.lon}
                    onChange={(event) => {
                      const next = [...ports];
                      next[index] = { ...port, lon: coord(event.target.value, 180) };
                      writePorts(next);
                    }}
                    className={FIELD}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => writePorts(ports.filter((_, i) => i !== index))}
                  aria-label={`Remove ${port.port}`}
                  className="justify-self-start rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-[#9B2C1B]"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 border-t border-brass/20 pt-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="mono-label">Transit times shown on the site</span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...ports];
                      next[index] = {
                        ...port,
                        transits: [...port.transits, { to: "Destination port", days: "0–0" }],
                      };
                      writePorts(next);
                    }}
                    className="mono-label underline underline-offset-4 hover:text-harbour"
                  >
                    Add a route
                  </button>
                </div>

                <ul className="grid gap-2" role="list">
                  {port.transits.map((transit, tIndex) => (
                    <li key={tIndex} className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
                      <input
                        aria-label="Destination port"
                        value={transit.to}
                        onChange={(event) => {
                          const next = [...ports];
                          const transits = [...port.transits];
                          transits[tIndex] = { ...transit, to: event.target.value };
                          next[index] = { ...port, transits };
                          writePorts(next);
                        }}
                        className={FIELD}
                      />
                      <input
                        aria-label="Transit days"
                        value={transit.days}
                        onChange={(event) => {
                          const next = [...ports];
                          const transits = [...port.transits];
                          transits[tIndex] = { ...transit, days: event.target.value };
                          next[index] = { ...port, transits };
                          writePorts(next);
                        }}
                        className={FIELD}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...ports];
                          next[index] = {
                            ...port,
                            transits: port.transits.filter((_, i) => i !== tIndex),
                          };
                          writePorts(next);
                        }}
                        aria-label={`Remove route to ${transit.to}`}
                        className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-[#9B2C1B]"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------- markets -- */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-brass/25 pb-3">
          <h2 className="mono-label">Destination markets — where routes end</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => writeMarkets([...markets, { name: "New market", lat: 0, lon: 0 }])}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add a market
          </Button>
        </div>

        <p className="mb-5 max-w-3xl text-[0.9375rem] leading-relaxed">
          The country is filled on the map when its name matches the map data. Where the
          data spells it differently — the United States is &ldquo;United States of
          America&rdquo; there — put that spelling in the map-data name column.
        </p>

        <ul className="grid gap-2" role="list">
          {markets.map((market, index) => (
            <li
              key={index}
              className="grid gap-2 rounded-crate border border-harbour/12 p-3 sm:grid-cols-[1fr_1fr_6rem_6rem_auto] sm:items-end"
            >
              <label className="grid gap-1.5">
                <span className="mono-label">Market</span>
                <input
                  value={market.name}
                  onChange={(event) => {
                    const next = [...markets];
                    next[index] = { ...market, name: event.target.value };
                    writeMarkets(next);
                  }}
                  className={FIELD}
                />
              </label>

              <label className="grid gap-1.5">
                <span className="mono-label">Map-data name</span>
                <input
                  value={market.geo_name ?? ""}
                  placeholder="same as market"
                  onChange={(event) => {
                    const next = [...markets];
                    next[index] = { ...market, geo_name: event.target.value || undefined };
                    writeMarkets(next);
                  }}
                  className={FIELD}
                />
              </label>

              <label className="grid gap-1.5">
                <span className="mono-label">Latitude</span>
                <input
                  type="number"
                  step="0.01"
                  value={market.lat}
                  onChange={(event) => {
                    const next = [...markets];
                    next[index] = { ...market, lat: coord(event.target.value, 90) };
                    writeMarkets(next);
                  }}
                  className={FIELD}
                />
              </label>

              <label className="grid gap-1.5">
                <span className="mono-label">Longitude</span>
                <input
                  type="number"
                  step="0.01"
                  value={market.lon}
                  onChange={(event) => {
                    const next = [...markets];
                    next[index] = { ...market, lon: coord(event.target.value, 180) };
                    writeMarkets(next);
                  }}
                  className={FIELD}
                />
              </label>

              <button
                type="button"
                onClick={() => writeMarkets(markets.filter((_, i) => i !== index))}
                aria-label={`Remove ${market.name}`}
                className="justify-self-start rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-[#9B2C1B]"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

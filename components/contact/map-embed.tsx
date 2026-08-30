"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { readConsent } from "@/lib/analytics";
import { useClientValue } from "@/lib/client-hooks";

/**
 * Google Maps sets cookies, so the iframe is not loaded until the visitor has accepted
 * analytics — or asks for it explicitly here. Until then the panel shows the address
 * and a link out, which is what most buyers want anyway.
 */
export function MapEmbed({
  query,
  addressLines,
  embedUrl,
}: {
  query: string;
  addressLines: string[];
  /** A full Google Maps embed URL pasted into the admin panel. Wins when present. */
  embedUrl?: string;
}) {
  const consented = useClientValue(() => readConsent() === "accepted", false);
  const [allowedHere, setAllowedHere] = useState(false);

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  if (consented || allowedHere) {
    return (
      <iframe
        title="Facility location on Google Maps"
        src={embedUrl || `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="aspect-4/3 w-full rounded-crate border border-harbour/15"
      />
    );
  }

  return (
    <div className="flex aspect-4/3 flex-col justify-between rounded-crate border border-dashed border-brass/45 bg-harbour/[0.03] p-6">
      <div>
        <MapPin className="size-5 text-brass-ink" aria-hidden="true" />
        <address className="mt-4 text-[0.9375rem] leading-relaxed not-italic">
          {addressLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>

      <div>
        <p className="mono-label normal-case tracking-[0.04em]">
          The map is not loaded until you allow it, because Google sets cookies.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => setAllowedHere(true)}>
            Load the map
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer">
              Open in Google Maps
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { LazyWorldMap } from "@/components/global/world-map-lazy";
import { Chip } from "@/components/ui/chip";
import { Section, SectionHead } from "@/components/ui/section";
import { site } from "@/lib/site";
import { withBase } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Global reach",
  description:
    "Twelve markets across the Middle East, Europe, North America, Southeast Asia and the CIS, loaded from six Indian ports with published transit times.",
  openGraph: { images: [withBase("/og/default.png")] },
};

export default function GlobalReachPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Global reach", href: "/global-reach/" },
        ]}
      />

      <PageHero
        eyebrow={`${site.markets.length} markets · ${site.loading_ports.length} loading ports`}
        title="Where the containers go, and how long they take"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Global reach", href: "/global-reach" },
        ]}
        lead={
          <p>
            Both Indian coasts are covered, which matters more than it sounds: a Gulf
            buyer loading from Mundra saves days over Chennai, and a Southeast Asian buyer
            the opposite. We quote from whichever port is right for your route.
          </p>
        }
      >
        <div className="mt-12">
          <LazyWorldMap />
        </div>
      </PageHero>

      <Section>
        <SectionHead
          eyebrow="Regions"
          title="Which verticals ship where"
          lead="Not every range suits every market. Furniture moves best to Europe and North America; fresh produce to the Gulf and Northern Europe."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {site.regions.map((region) => (
            <article
              key={region.region}
              className="flex h-full flex-col rounded-crate border border-harbour/12 p-6"
            >
              <h3 className="text-[1.25rem] leading-snug">{region.region}</h3>

              <ul className="mt-4 flex flex-wrap gap-1.5" role="list">
                {region.countries.map((country) => (
                  <li key={country}>
                    <Chip tone="muted">{country}</Chip>
                  </li>
                ))}
              </ul>

              <div className="mt-5 border-t border-brass/25 pt-4">
                <span className="mono-label">Ranges shipped</span>
                <ul className="mt-2.5 grid gap-1.5" role="list">
                  {region.verticals.map((vertical) => (
                    <li key={vertical} className="text-[0.9375rem]">
                      {vertical}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="Port network"
          title="Transit times from each loading port"
          lead="Indicative sailing times for direct services. Transhipment routes run longer and we say so in the quotation rather than at the vessel cut-off."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {site.ports.map((port) => (
            <article key={port.code} className="rounded-crate border border-brass/30 bg-paper p-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[1.125rem] leading-snug">{port.port}</h3>
                <span className="mono-label text-brass-ink">{port.code}</span>
              </div>

              <dl className="mt-5 grid gap-2.5 border-t border-brass/25 pt-4">
                {port.transits.map((transit) => (
                  <div key={transit.to} className="flex items-baseline justify-between gap-4">
                    <dt className="text-[0.9375rem]">{transit.to}</dt>
                    <dd className="mono-data text-[0.8125rem]">{transit.days} days</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}

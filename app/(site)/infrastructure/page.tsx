import type { Metadata } from "next";
import { withBase } from "@/lib/paths";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Section, SectionHead } from "@/components/ui/section";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { site } from "@/lib/site";
import { SiteImage } from "@/components/site-image";

export const metadata: Metadata = {
  title: "Infrastructure",
  description:
    "Pack house at 12 MT per day, 600 MT of cold storage across four independently controlled chambers, 1,500 MT dry warehouse, on-site fumigation and a dock-level loading bay.",
  openGraph: { images: [withBase("/og/default.png")] },
};

export default function InfrastructurePage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Infrastructure", href: "/infrastructure/" },
        ]}
      />

      <PageHero
        eyebrow="Facilities"
        title="The capacity behind the specification"
        imageSlot="site.packhouse"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Infrastructure", href: "/infrastructure" },
        ]}
        lead={
          <p>
            A supplier who rents processing capacity cannot change a packing format for one
            buyer without someone else agreeing to it. Everything below is under our own
            supervision, which is why buyer-specific formats are possible at all.
          </p>
        }
      />

      <Section>
        <div className="grid gap-16">
          {site.infrastructure.map((item, index) => (
            <article
              key={item.name}
              className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
            >
              <div
                className={`relative aspect-4/3 overflow-hidden rounded-crate border border-harbour/12 bg-harbour/5 lg:col-span-6 ${
                  index % 2 === 1 ? "lg:order-2" : ""
                }`}
              >
                <SiteImage
                  slot={`infra.${index}.photo`}
                  alt={`${item.name} placeholder image`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="lg:col-span-6">
                <span className="mono-label block border-t border-brass/30 pt-4">
                  Facility {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-5 text-[1.75rem] leading-snug md:text-[2rem]">{item.name}</h2>
                <p className="mono-data mt-3 text-brass-ink">{item.capacity}</p>
                <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="Cold chain"
          title="Set points, per product"
          lead="A single chilled container is not a cold chain. Each product carries at its own temperature, and the set point is verified and logged when the container is stuffed."
        />

        <div className="contain-paint overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-brass/40">
                <th scope="col" className="mono-label pb-3 font-normal">
                  Product
                </th>
                <th scope="col" className="mono-label pb-3 font-normal">
                  Carriage temperature
                </th>
                <th scope="col" className="mono-label pb-3 font-normal">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Thompson Seedless grapes", "0–2 °C", "Highest sensitivity to a chain break"],
                ["Bhagwa pomegranate", "4–5 °C", "45–60 day shelf life once pre-cooled"],
                ["Kagzi lime", "9–10 °C", "Chilling injury below 8 °C"],
                ["Alphonso mango", "12–13 °C", "Pre-cooled before stuffing"],
                ["Cavendish banana", "13.5 °C", "Ripens in transit above 14.5 °C"],
                ["Dehydrated products", "Ambient, below 25 °C", "Humidity controlled, RH under 65%"],
              ].map(([product, temperature, note]) => (
                <tr key={product} className="border-b border-brass/20">
                  <th scope="row" className="py-3.5 pr-6 text-left text-[0.9375rem] font-normal">
                    {product}
                  </th>
                  <td className="mono-data py-3.5 pr-6 text-[0.8125rem]">{temperature}</td>
                  <td className="py-3.5 text-[0.875rem]">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="harbour">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h2 className="max-w-2xl text-[1.75rem] leading-[1.14] text-kraft md:text-[2.25rem]">
              Visits are welcome, and so are auditors
            </h2>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-kraft/75">
              Buyers who intend to run a programme usually visit before the second
              container. Tell us when you are in India and we will arrange the facility and
              a grower block visit in the same trip.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Button size="lg" asChild>
              <Link href="/contact">
                Arrange a visit
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppAction source="infrastructure-cta" size="lg" />
          </div>
        </div>
      </Section>
    </>
  );
}

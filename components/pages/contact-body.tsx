"use client";

import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { MapEmbed } from "@/components/contact/map-embed";
import { Section, SectionHead } from "@/components/ui/section";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { useSiteSettings } from "@/components/providers/store-provider";
import { getProducts, toProductSummaries } from "@/lib/products";
import { SiteImage } from "@/components/site-image";

export function ContactBody() {
  const site = useSiteSettings();

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact/" },
        ]}
      />

      <PageHero
        imageSlot="site.contact"
        eyebrow="Contact"
        title="Send the specification, get a quotation"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Contact", href: "/contact" },
        ]}
        lead={
          <p>
            Product, quantity, destination port and preferred Incoterm is a complete
            inquiry. If any of those are still open, send what you have and we will fill
            in the rest with a recommendation.
          </p>
        }
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <h2 className="mono-label border-t border-brass/30 pt-4">Inquiry form</h2>
            <div className="mt-8">
              <InquiryForm
                source="contact-page"
                productOptions={toProductSummaries(getProducts())}
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <h2 className="mono-label border-t border-brass/30 pt-4">Direct lines</h2>

            <div className="mt-8 grid gap-6">
              <div>
                <WhatsAppAction source="contact-page-direct" size="lg" className="w-full sm:w-auto" />
                <p className="mono-label mt-3 normal-case tracking-[0.04em]">
                  {site.contact.hours_note}
                </p>
              </div>

              {/*
                Each entry is one div holding a dt and a dd. A dl may only contain dt,
                dd or a single wrapping div — nesting them a second level deep, which is
                what the icon layout tempted, silently breaks the list semantics.
              */}
              <dl className="grid gap-5 border-t border-brass/25 pt-6">
                <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3">
                  <Phone className="size-4 shrink-0 translate-y-0.5 text-brass-ink" aria-hidden="true" />
                  <dt className="mono-label">Phone</dt>
                  <dd className="mono-data col-start-2 mt-1">
                    <a href={`tel:${site.contact.phone}`} className="hover:text-brass-ink">
                      {site.contact.phone_display}
                    </a>
                  </dd>
                </div>

                <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3">
                  <Mail className="size-4 shrink-0 translate-y-0.5 text-brass-ink" aria-hidden="true" />
                  <dt className="mono-label">Email</dt>
                  <dd className="mono-data col-start-2 mt-1 break-all">
                    <a
                      href={`mailto:${site.contact.email}?subject=${encodeURIComponent("Export inquiry")}`}
                      className="hover:text-brass-ink"
                    >
                      {site.contact.email}
                    </a>
                  </dd>
                </div>

                {/*
                  "WhatsApp, as displayed" is a field the admin panel has always offered
                  and nothing on the site ever read, so a client could set it and never
                  see it anywhere. Buyers in these markets ask for the WhatsApp number as
                  often as the landline, so it belongs in this list.

                  Shown as plain text until a real number is saved, matching every other
                  WhatsApp control on the site: a wa.me link built from a placeholder is a
                  dead link in front of a buyer.
                */}
                {site.contact.whatsapp_display ? (
                  <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3">
                    <MessageCircle
                      className="size-4 shrink-0 translate-y-0.5 text-brass-ink"
                      aria-hidden="true"
                    />
                    <dt className="mono-label">WhatsApp</dt>
                    <dd className="mono-data col-start-2 mt-1">
                      {site.contact.whatsapp_configured ? (
                        <a
                          href={`https://wa.me/${site.contact.whatsapp.replace(/[^\d]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brass-ink"
                        >
                          {site.contact.whatsapp_display}
                        </a>
                      ) : (
                        site.contact.whatsapp_display
                      )}
                    </dd>
                  </div>
                ) : null}

                <div className="grid grid-cols-[auto_1fr] items-baseline gap-x-3">
                  <Clock className="size-4 shrink-0 translate-y-0.5 text-brass-ink" aria-hidden="true" />
                  <dt className="mono-label">Working hours</dt>
                  <dd className="mono-data col-start-2 mt-1">{site.contact.hours}</dd>
                </div>
              </dl>

              <div className="border-t border-brass/25 pt-6">
                <h3 className="mono-label mb-4">Find us</h3>
                <MapEmbed
                  query={site.contact.map_query}
                  addressLines={site.contact.address_lines}
                  embedUrl={site.contact.map_embed_url}
                />
              </div>

              <dl className="grid gap-2 border-t border-brass/25 pt-6">
                {site.registrations.map((registration) => (
                  <div key={registration.label} className="flex gap-4 font-mono text-[0.75rem]">
                    <dt className="w-24 shrink-0 tracking-[0.12em] text-slate-soft uppercase">
                      {registration.label}
                    </dt>
                    <dd className="text-harbour">{registration.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="Facility"
          title="Where your container is packed"
          lead="Placeholder imagery in this build. Replace with photographs of the client's own pack house, cold store and loading bay before launch."
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {site.infrastructure.map((item, index) => (
            <li key={item.name}>
              <div className="relative aspect-4/3 overflow-hidden rounded-crate border border-harbour/12 bg-harbour/5">
                <SiteImage
                  slot={`infra.${index}.photo`}
                  alt={`${item.name} placeholder image`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 45vw"
                  className="object-cover"
                />
              </div>
              <p className="mono-label mt-3">{item.name}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

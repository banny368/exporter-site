import Image from "next/image";
import { withBase } from "@/lib/paths";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Reveal } from "@/components/reveal";
import { Rule, Section, SectionHead } from "@/components/ui/section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { WorldMap } from "@/components/global/world-map";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { CustomSections, SectionGate } from "@/components/home/section-gate";
import {
  getCategories,
  getFeaturedProducts,
  getProductsByCategory,
  toProductSummaries,
} from "@/lib/products";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: `${site.company.name} — Fresh produce, spices and furniture exporter from India`,
  description:
    "Indian export house shipping fresh fruit and vegetables, dehydrated products and spices, and solid wood furniture. Real HS codes, container loadability and MOQ published for every product.",
  openGraph: { images: [withBase("/og/default.png")] },
};

export default function HomePage() {
  const categories = getCategories();

  return (
    <div className="flex flex-col">
      <SectionGate id="hero">
      {/* 1 — Hero. The image slot is a placeholder graphic today; drop a real
          photograph in and the scrim and type still work. */}
      <section className="relative isolate flex min-h-[min(88vh,46rem)] items-end overflow-hidden bg-harbour">
        <Image
          src={withBase(site.hero.image)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-harbour-deep via-harbour-deep/70 to-harbour-deep/25"
          aria-hidden="true"
        />

        <div className="page-shell relative z-10 pt-28 pb-14 md:pb-20">
          <p className="mono-label text-brass">{site.company.tagline}</p>

          <h1 className="mt-5 max-w-4xl text-[2.25rem] leading-[1.06] text-kraft md:text-[3.25rem] lg:text-[3.75rem]">
            {site.hero.heading}
          </h1>

          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-kraft/80 md:text-[1.1875rem]">
            {site.hero.sub}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href={site.hero.primary_cta.href}>
                {site.hero.primary_cta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppAction source="home-hero" size="lg" label="Inquire on WhatsApp" />
          </div>

          <p className="mt-12 font-mono text-[0.6875rem] tracking-[0.16em] text-kraft/70 uppercase md:text-[0.75rem]">
            Est. {site.company.established} · {site.markets.length} countries ·
            {" "}
            {site.stats.find((stat) => stat.label === "Containers shipped")?.value ?? 500}+
            {" "}
            containers shipped
          </p>
        </div>
      </section>

      </SectionGate>

      <SectionGate id="trust-bar">
      {/* 2 — Trust bar. */}
      <div className="border-y border-brass/25 bg-kraft">
        <div className="page-shell flex flex-wrap items-center gap-x-8 gap-y-3 py-5">
          <span className="mono-label text-slate-soft">Registered &amp; certified</span>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2" role="list">
            {site.certifications.map((certification) => (
              <li
                key={certification.id}
                className="font-mono text-[0.75rem] tracking-[0.14em] text-harbour uppercase"
                title={certification.description}
              >
                {certification.abbr}
              </li>
            ))}
          </ul>
        </div>
      </div>

      </SectionGate>

      <SectionGate id="verticals">
      {/* 3 — Three verticals. */}
      <Section>
        <SectionHead
          eyebrow="Range 01–03"
          title="Three verticals, one standard of documentation"
          lead="Each range ships from the growing or manufacturing cluster that specialises in it, under the same quality, packing and paperwork discipline."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {categories.map((category, index) => {
            const count = getProductsByCategory(category.slug).length;

            return (
              <Reveal key={category.id} delay={index * 90}>
                <Link
                  href={`/products/${category.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-crate border border-harbour/12 bg-paper transition-colors hover:border-brass/60"
                >
                  <div className="relative aspect-3/2 overflow-hidden bg-harbour/5">
                    <Image
                      src={withBase(category.banner_url)}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 33vw, 90vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <span className="mono-label">{count} products</span>
                    <h3 className="mt-3 text-[1.375rem] leading-snug">{category.name}</h3>
                    <p className="mt-3 line-clamp-4 flex-1 text-[0.9375rem] leading-relaxed">
                      {category.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 font-medium text-harbour transition-colors group-hover:text-brass-ink">
                      View range
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      </SectionGate>

      <SectionGate id="catalogue">
      {/* 4 — Featured products. */}
      <Section tone="kraft">
        <SectionHead
          eyebrow="Catalogue"
          title="Published specifications, before you write the first email"
          lead="HS code, grade, packing, MOQ and container loadability are on every product page. If the numbers do not suit your requirement, you will know in ten seconds rather than ten days."
          action={
            <Button variant="outline" asChild>
              <Link href="/products">
                See all products
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
        <FeaturedProducts seed={toProductSummaries(getFeaturedProducts(8))} />
      </Section>

      </SectionGate>

      <SectionGate id="capability">
      {/* 5 — Why choose us. Hard numbers only. */}
      <Section>
        <SectionHead
          eyebrow="Capability"
          title="What actually differs between one Indian supplier and another"
          lead="Not adjectives. These are the six things that decide whether a container arrives matching the specification you signed."
        />

        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {site.differentiators.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <div>
                <Rule className="mb-5" />
                <h3 className="text-[1.125rem] leading-snug">{item.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      </SectionGate>

      <SectionGate id="process">
      {/* 6 — Export process teaser. Numbering is justified: this is a real sequence. */}
      <Section tone="harbour">
        <SectionHead
          onDark
          eyebrow="Process"
          title="Inquiry to shipment, in six steps"
          lead="Each step has an expected timeline, so you can plan against it rather than chase it."
          action={
            <Button variant="onDark" asChild>
              <Link href="/export-process">
                Read the full process
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <ol className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3" role="list">
          {site.export_process.map((step) => (
            <li key={step.step} className="border-t border-brass/40 pt-5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-mono text-[1.75rem] leading-none text-brass">{step.step}</span>
                <span className="mono-label text-kraft/70">{step.timeline}</span>
              </div>
              <h3 className="mt-4 text-[1.125rem] text-kraft">{step.title}</h3>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-kraft/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      </SectionGate>

      <SectionGate id="reach">
      {/* 7 — Global reach. */}
      <Section tone="harbour" className="pt-0">
        <SectionHead
          onDark
          eyebrow="Reach"
          title="Where the containers go"
          lead="Six loading ports on both Indian coasts, into twelve markets across five regions."
        />

        <WorldMap markets={site.markets} ports={site.ports} />

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {site.ports.map((port) => (
            <div key={port.code} className="border-t border-brass/40 pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[1.0625rem] text-kraft">{port.port}</h3>
                <span className="mono-label text-brass">{port.code}</span>
              </div>
              <dl className="mt-3 grid gap-1.5">
                {port.transits.map((transit) => (
                  <div key={transit.to} className="flex justify-between gap-4 font-mono text-[0.75rem]">
                    <dt className="text-kraft/60">{transit.to}</dt>
                    <dd className="text-kraft/85">{transit.days} days</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </Section>

      </SectionGate>

      <SectionGate id="documents">
      {/* 8 — Documents. Buyers scan for this. */}
      <Section tone="kraft">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <span className="mono-label block border-t border-brass/30 pt-4">Paperwork</span>
            <h2 className="mt-6 text-[1.75rem] leading-[1.12] md:text-[2.25rem]">
              Every shipment leaves with a complete document set
            </h2>
            <p className="mt-5 text-[1.0625rem] leading-relaxed">
              Prepared as one set before the vessel sails, not chased afterwards. Draft
              documents go to you for approval before they are finalised, so a spelling
              error on a certificate of origin is caught in India rather than at your port.
            </p>
            <Button variant="outline" className="mt-7" asChild>
              <Link href="/export-process">
                How documentation works
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="lg:col-span-7">
            {/* Three columns, because there are nine documents: a two-column grid leaves
                an odd empty tile that reads as a rendering fault. */}
            <ul className="grid gap-px overflow-hidden rounded-crate border border-brass/30 bg-brass/30 sm:grid-cols-3" role="list">
              {site.documents.map((document) => (
                <li key={document} className="flex items-center gap-3 bg-kraft px-4 py-4">
                  <FileText className="size-4 shrink-0 text-brass-ink" aria-hidden="true" />
                  <span className="font-mono text-[0.8125rem] text-harbour">{document}</span>
                </li>
              ))}
            </ul>
            <p className="mono-label mt-4">
              Plus product-specific certificates — see each product page
            </p>
          </div>
        </div>
      </Section>

      </SectionGate>

      <SectionGate id="testimonials">
      {/* 9 — Testimonials. Demo content: replace with buyers who have given permission. */}
      <Section>
        <SectionHead
          eyebrow="Buyers"
          title="What repeat buyers say"
          lead="Sample content for this demo. Replace with real quotes, and only with written permission to publish."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {site.testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.quote} delay={index * 80}>
              <figure className="flex h-full flex-col rounded-crate border border-harbour/12 bg-paper p-6">
                <Chip tone="muted" className="self-start">
                  Sample content
                </Chip>
                <blockquote className="mt-5 flex-1 font-display text-[1.1875rem] leading-relaxed text-harbour">
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-6 border-t border-brass/25 pt-4">
                  <span className="mono-label block">{testimonial.name}</span>
                  <span className="mt-1.5 block text-[0.9375rem]">
                    {testimonial.flag} {testimonial.company}, {testimonial.country}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      </SectionGate>

      <SectionGate id="cta">
      {/* 10 — Inquiry band. */}
      <section className="bg-harbour-deep py-20 md:py-24">
        <div className="page-shell grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <span className="mono-label text-brass">Next step</span>
            <h2 className="mt-5 max-w-2xl text-[1.75rem] leading-[1.12] text-kraft md:text-[2.25rem]">
              Send the product, quantity, destination port and Incoterm
            </h2>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-kraft/75">
              That is enough for a written quotation within 48 hours. If we cannot supply
              what you need, you will hear that in the same window.
            </p>
            <p className="mono-label mt-6 text-kraft/70">{site.contact.hours}</p>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Button size="lg" asChild>
              <Link href="/contact">Send an inquiry</Link>
            </Button>
            <WhatsAppAction source="home-cta-band" size="lg" />
          </div>
        </div>
      </section>
      </SectionGate>

      <CustomSections />
    </div>
  );
}

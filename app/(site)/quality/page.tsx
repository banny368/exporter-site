import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Section, SectionHead } from "@/components/ui/section";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Quality assurance & certifications",
  description:
    "Six-stage quality process from sourcing to loading supervision, NABL-accredited lab testing before dispatch, and third-party inspection by SGS, Bureau Veritas or Intertek welcome.",
  openGraph: { images: ["/og/default.png"] },
};

export default function QualityPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Quality", href: "/quality/" },
        ]}
      />

      <PageHero
        eyebrow="Quality assurance"
        title="Checked at six stages, not once at the end"
        image="/site/quality.webp"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Quality", href: "/quality" },
        ]}
        lead={
          <p>
            A single pre-shipment inspection catches problems too late to fix them. Each
            stage below has its own reject criteria, so material that will not meet the
            specification is stopped at the gate rather than reworked into a container.
          </p>
        }
      />

      <Section>
        <SectionHead
          eyebrow="Process"
          title="From grower block to sealed container"
          lead="The sequence is numbered because it is a sequence: each stage depends on the one before it."
        />

        <ol className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3" role="list">
          {site.quality_stages.map((stage, index) => (
            <Reveal key={stage.stage} delay={index * 60} as="li">
              <div className="border-t border-brass/30 pt-5">
                <span className="font-mono text-[1.75rem] leading-none text-brass-ink">
                  {stage.stage}
                </span>
                <h3 className="mt-4 text-[1.25rem] leading-snug">{stage.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed">{stage.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="Certifications"
          title="What each certificate actually covers"
          lead="Logos on a website prove nothing on their own. Here is what each registration means for your consignment."
        />

        <ul className="grid gap-px overflow-hidden rounded-crate border border-brass/30 bg-brass/25 md:grid-cols-2" role="list">
          {site.certifications.map((certification) => (
            <li key={certification.id} className="bg-kraft p-6">
              <p className="mono-data text-harbour">{certification.abbr}</p>
              <h3 className="mt-2 text-[1.125rem] leading-snug">{certification.name}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed">{certification.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="harbour">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <span className="mono-label text-brass">Independent verification</span>
            <h2 className="mt-5 max-w-2xl text-[1.75rem] leading-[1.14] text-kraft md:text-[2.25rem]">
              Third-party inspection is welcome, and we hold the container for it
            </h2>
            <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-kraft/75">
              SGS, Bureau Veritas and Intertek inspect at our facility regularly. Inspection
              is at your cost and it is worth it on a first order — an independent report on
              your first container is the cheapest way to find out whether a supplier
              describes their own goods accurately.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-3" role="list">
              {["SGS", "Bureau Veritas", "Intertek"].map((agency) => (
                <li
                  key={agency}
                  className="rounded-crate border border-kraft/20 px-4 py-3 text-center font-mono text-[0.8125rem] tracking-[0.1em] text-kraft/85 uppercase"
                >
                  {agency}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Button size="lg" asChild>
              <Link href="/contact">
                Arrange an inspection
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppAction source="quality-cta" size="lg" />
          </div>
        </div>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Laboratory"
          title="What gets tested, and where"
          lead="Testing is done at NABL-accredited laboratories against the destination market's limits, not a domestic minimum. Reports are issued before the container is sealed."
        />

        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Pesticide residue",
              body: "Full multi-residue panel by LC-MS/MS and GC-MS/MS, reported against EU MRL or the destination's own limits, whichever is stricter.",
            },
            {
              title: "Aflatoxin",
              body: "HPLC-FLD on spices and dried botanicals, to the EU limits of 5 ppb B1 and 10 ppb total unless your market specifies otherwise.",
            },
            {
              title: "Microbiological",
              body: "Total plate count, Salmonella, E. coli, yeast and mould on dehydrated products and powders, sampled per production lot.",
            },
            {
              title: "Heavy metals",
              body: "ICP-MS for lead, cadmium, arsenic and mercury on botanicals and powders, against EU contaminant limits.",
            },
            {
              title: "Physical parameters",
              body: "Moisture, ash, acid insoluble ash, foreign matter, size grading and defect tolerance, checked in-house and confirmed externally.",
            },
            {
              title: "Product-specific actives",
              body: "Curcumin by HPLC, capsaicin for Scoville, ASTA colour by spectrophotometer, volatile oil by Clevenger distillation, Brix by refractometer.",
            },
          ].map((test) => (
            <div key={test.title} className="border-t border-brass/30 pt-5">
              <h3 className="text-[1.125rem] leading-snug">{test.title}</h3>
              <p className="mt-3 text-[0.9375rem] leading-relaxed">{test.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

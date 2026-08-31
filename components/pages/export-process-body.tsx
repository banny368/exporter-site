"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Section, SectionHead } from "@/components/ui/section";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { useSiteSettings } from "@/components/providers/store-provider";

/** Who pays for what, at each handover. This is the table buyers actually want. */
const INCOTERM_ROWS = [
  {
    term: "EXW",
    name: "Ex Works",
    means: "You collect from our facility. We load nothing and clear nothing.",
    seller: "Goods, packing, documents",
    buyer: "Loading, inland transport, export clearance, freight, insurance, import duty",
  },
  {
    term: "FOB",
    name: "Free On Board",
    means: "We deliver on board the vessel at the Indian port. Risk passes there.",
    seller: "Inland transport, export clearance, terminal charges, loading",
    buyer: "Sea freight, insurance, import duty, delivery",
  },
  {
    term: "CFR",
    name: "Cost and Freight",
    means: "We pay the sea freight to your port. You carry the risk from loading.",
    seller: "Everything to FOB, plus sea freight",
    buyer: "Insurance, import duty, delivery",
  },
  {
    term: "CIF",
    name: "Cost, Insurance and Freight",
    means: "As CFR, and we insure the cargo to your port on your behalf.",
    seller: "Everything to CFR, plus marine insurance",
    buyer: "Import duty, customs clearance, delivery",
  },
  {
    term: "DDP",
    name: "Delivered Duty Paid",
    means: "Delivered to your door with duty paid. Quoted case by case.",
    seller: "Everything, including import duty and delivery",
    buyer: "Unloading at final destination",
  },
];

const DOCUMENT_FLOW = [
  { stage: "At order", documents: ["Proforma Invoice", "Sales Contract"] },
  { stage: "Before production", documents: ["LC copy or TT advice", "Approved specification sheet"] },
  { stage: "Before dispatch", documents: ["Certificate of Analysis", "Inspection report"] },
  {
    stage: "At shipment",
    documents: ["Commercial Invoice", "Packing List", "Certificate of Origin", "Phytosanitary or Fumigation Certificate"],
  },
  { stage: "After sailing", documents: ["Bill of Lading", "Insurance Certificate", "Container and vessel details"] },
];

export function ExportProcessBody() {
  const site = useSiteSettings();

  const faqs = site.faqs.filter((faq) =>
    /payment|incoterm|shipment take|documents/i.test(faq.question),
  );

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Export process", href: "/export-process/" },
        ]}
      />
      <FaqJsonLd faqs={faqs} />

      <PageHero
        imageSlot="site.export_process"
        eyebrow="How we work"
        title="Inquiry to shipment, with a timeline on every step"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Export process", href: "/export-process" },
        ]}
        lead={
          <p>
            Nothing here is unusual — it is how a competent exporter works. It is written
            down so you can plan against it, and so you know at which step to chase us.
          </p>
        }
      />

      <Section>
        <ol className="grid gap-12" role="list">
          {site.export_process.map((step, index) => (
            <Reveal key={step.step} delay={index * 50} as="li">
              <div className="grid gap-4 border-t border-brass/30 pt-6 lg:grid-cols-12 lg:gap-8">
                <div className="lg:col-span-2">
                  <span className="font-mono text-[2rem] leading-none text-brass-ink">{step.step}</span>
                </div>
                <div className="lg:col-span-6">
                  <h2 className="text-[1.375rem] leading-snug">{step.title}</h2>
                  <p className="mt-3 max-w-2xl text-[1.0625rem] leading-relaxed">{step.body}</p>
                </div>
                <div className="lg:col-span-4 lg:text-right">
                  <span className="mono-label">Expected</span>
                  <p className="mono-data mt-2">{step.timeline}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="Document flow"
          title="Which paper moves, and when"
          lead="Drafts are sent for your approval before anything is finalised, so an error is corrected in India rather than at your port."
        />

        <ol className="grid gap-5 lg:grid-cols-5" role="list">
          {DOCUMENT_FLOW.map((stage, index) => (
            <li
              key={stage.stage}
              className="flex h-full flex-col rounded-crate border border-brass/30 bg-paper p-5"
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[0.75rem] text-brass-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mono-label text-harbour">{stage.stage}</h3>
              </div>
              <ul className="mt-4 grid gap-2.5" role="list">
                {stage.documents.map((document) => (
                  <li key={document} className="flex items-start gap-2">
                    <FileText className="mt-0.5 size-3.5 shrink-0 text-brass-ink" aria-hidden="true" />
                    <span className="font-mono text-[0.75rem] leading-relaxed text-harbour">
                      {document}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHead
          eyebrow="Incoterms"
          title="Who pays for what, in plain language"
          lead="If you are not sure which term suits your route, tell us the destination port and we will recommend one rather than quoting the term that flatters our price."
        />

        <div className="contain-paint overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-brass/40">
                <th scope="col" className="mono-label pb-3 font-normal">
                  Term
                </th>
                <th scope="col" className="mono-label pb-3 font-normal">
                  What it means
                </th>
                <th scope="col" className="mono-label pb-3 font-normal">
                  We pay
                </th>
                <th scope="col" className="mono-label pb-3 font-normal">
                  You pay
                </th>
              </tr>
            </thead>
            <tbody>
              {INCOTERM_ROWS.map((row) => (
                <tr key={row.term} className="border-b border-brass/20 align-top">
                  <th scope="row" className="py-4 pr-6 text-left font-normal">
                    <span className="mono-data block text-harbour">{row.term}</span>
                    <span className="mono-label mt-1 block normal-case">{row.name}</span>
                  </th>
                  <td className="py-4 pr-6 text-[0.9375rem] leading-relaxed">{row.means}</td>
                  <td className="py-4 pr-6 text-[0.875rem] leading-relaxed">{row.seller}</td>
                  <td className="py-4 text-[0.875rem] leading-relaxed">{row.buyer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mono-label mt-5 normal-case tracking-[0.04em]">
          Payment terms: letter of credit at sight, or 30% TT advance with balance against a
          copy of the bill of lading.
        </p>
      </Section>

      <Section tone="harbour">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h2 className="max-w-2xl text-[1.75rem] leading-[1.14] text-kraft md:text-[2.25rem]">
              Start at step one
            </h2>
            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-kraft/75">
              Product, quantity, destination port, Incoterm. That is a complete inquiry, and
              it comes back quoted within 48 hours.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:col-span-5 lg:justify-end">
            <Button size="lg" asChild>
              <Link href="/contact">
                Send an inquiry
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <WhatsAppAction source="export-process-cta" size="lg" />
          </div>
        </div>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/ui/section";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of use for this website, and the commercial terms that apply to quotations, orders, inspection, claims and shipment.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "About these terms",
    body: [
      `These terms cover use of this website, operated by ${site.company.legal_name}. The commercial terms of any actual sale are set out in the proforma invoice and sales contract for that shipment, and those documents take precedence over anything on this site.`,
    ],
  },
  {
    heading: "Information on this site is indicative",
    body: [
      "Specifications, packing formats, container loadability figures, lead times and availability are published in good faith and reflect typical shipments. They are not an offer, and they do not form part of a contract until they appear on a proforma invoice that you have accepted.",
      "Crop products vary by season. Where a season is short or a grade is subject to harvest conditions, the figure on the product page is the range we work to, not a guarantee for a particular week.",
    ],
  },
  {
    heading: "Quotations",
    body: [
      "Quotations are valid for seven days from issue unless the quotation itself states otherwise, because freight rates and crop prices move. A quotation is priced against a named specification, a named destination port and a named Incoterm; changing any of those changes the price.",
    ],
  },
  {
    heading: "Orders and payment",
    body: [
      "An order is confirmed when we receive an accepted proforma invoice together with a letter of credit at sight, or the agreed telegraphic transfer advance. Production or procurement begins at that point and not before.",
      "We do not ship on open account for a first order. Terms for repeat buyers are reviewed after the first two shipments.",
    ],
  },
  {
    heading: "Inspection and rejection",
    body: [
      "You may appoint an independent inspection agency at your own cost, and we will hold the container for the inspection. Where an inspection finds the consignment outside the agreed specification before shipment, we will replace or rework the affected lot, or cancel that line and refund against it.",
      "Claims raised after arrival must be made within seven days of discharge for fresh produce and thirty days for other products, with photographs, the container and seal numbers, and an independent survey report where the value warrants one.",
    ],
  },
  {
    heading: "Delivery and delay",
    body: [
      "Shipment dates are quoted against booked vessel space and are estimates. We are not liable for delay caused by carrier schedule changes, port congestion, customs inspection, weather or any other matter outside our reasonable control, but we will tell you as soon as we know, with a revised estimate and the reason.",
    ],
  },
  {
    heading: "Title and risk",
    body: [
      "Risk passes at the point set by the agreed Incoterm. Title passes on receipt of payment in full. Where an Incoterm places insurance with us, we insure to 110% of the CIF value in accordance with normal marine practice.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "The text, layout and imagery on this site belong to us. You may print or save pages for the purpose of evaluating us as a supplier. You may not republish the specifications as your own catalogue content.",
    ],
  },
  {
    heading: "Governing law",
    body: [
      "These terms and any sale made under them are governed by the laws of India, and the courts at our registered office have jurisdiction, unless the sales contract for a particular shipment specifies arbitration or another forum.",
    ],
  },
  {
    heading: "Demo build notice",
    body: [
      "This site is currently deployed as a demonstration. Company details, registration numbers, statistics, testimonials and product photographs are placeholders and must not be relied on. Nothing on this build constitutes an offer to sell.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Terms", href: "/terms" },
        ]}
        lead={
          <p>
            Website terms, and the commercial terms that sit behind a quotation. The
            proforma invoice for a specific shipment always takes precedence over this
            page.
          </p>
        }
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <nav aria-label="On this page" className="sticky top-24">
              <h2 className="mono-label border-t border-brass/30 pt-4">Contents</h2>
              <ol className="mt-4 grid gap-2" role="list">
                {SECTIONS.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#t${index + 1}`}
                      className="text-[0.875rem] leading-snug hover:text-brass-ink"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="grid max-w-3xl gap-10 lg:col-span-9">
            {SECTIONS.map((section, index) => (
              <section key={section.heading} id={`t${index + 1}`} className="scroll-mt-28">
                <h2 className="text-[1.375rem] leading-snug">{section.heading}</h2>
                <div className="mt-4 grid gap-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-[1.0625rem] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

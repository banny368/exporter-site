import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { site } from "@/lib/site";
import { canonicalFor, withBase } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Buyer FAQs",
  description:
    "Minimum order quantities, Incoterms, payment terms, samples, lead times, inspection, documentation and private labelling — answered for first-time buyers.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/faq/"),
};

export default function FaqPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "FAQs", href: "/faq/" },
        ]}
      />
      <FaqJsonLd faqs={site.faqs} />

      <PageHero
        imageSlot="site.faq"
        eyebrow="Buyer FAQs"
        title="The questions a first container raises"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "FAQs", href: "/faq" },
        ]}
        lead={
          <p>
            If your question is not here, ask it directly — you will get a straight answer
            rather than a brochure.
          </p>
        }
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 className="mono-label border-t border-brass/30 pt-4">Common questions</h2>
          </div>

          <div className="lg:col-span-9">
            {/* Native disclosure elements: keyboard accessible, and they work with no JS. */}
            <ul className="grid" role="list">
              {site.faqs.map((faq) => (
                <li key={faq.question} className="border-b border-brass/25 first:border-t">
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 marker:content-none">
                      <h3 className="text-[1.125rem] leading-snug text-harbour">{faq.question}</h3>
                      <Plus
                        className="mt-1 size-4 shrink-0 text-brass-ink transition-transform duration-200 group-open:rotate-45"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="max-w-2xl pr-10 pb-6 text-[0.9375rem] leading-relaxed">
                      {faq.answer}
                    </p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="kraft">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-[1.5rem] leading-snug md:text-[1.875rem]">
              Still deciding whether to send an inquiry?
            </h2>
            <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed">
              Send the product and quantity even if the rest is undecided. We will tell you
              which Incoterm suits your route and what the realistic lead time is, and you
              can take that to whichever supplier you choose.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button size="lg" asChild>
              <Link href="/contact">Send an inquiry</Link>
            </Button>
            <WhatsAppAction source="faq-cta" size="lg" />
          </div>
        </div>
      </Section>
    </>
  );
}

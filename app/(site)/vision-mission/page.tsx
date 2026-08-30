import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { Reveal } from "@/components/reveal";
import { Section, SectionHead } from "@/components/ui/section";
import { site } from "@/lib/site";
import { canonicalFor, withBase } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Vision, mission & motive",
  description:
    "Connecting Indian growers and workshops directly to overseas buyers, with a verifiable source and a specification that holds from sample to container.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/vision-mission/"),
};

export default function VisionMissionPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "Vision & mission", href: "/vision-mission/" },
        ]}
      />

      <PageHero
        eyebrow="Vision · Mission · Motive · Values"
        title="What the company is for"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Vision & mission", href: "/vision-mission" },
        ]}
        lead={
          <p>
            Four separate things, written separately, because a mission statement that
            reads like a vision statement tells a buyer nothing about how you will be
            treated on your third container.
          </p>
        }
      />

      {/* Vision — one full-width dark panel, one statement, nothing else on it. */}
      <section className="bg-harbour-deep py-24 md:py-32">
        <div className="page-shell">
          <span className="mono-label text-brass">Vision</span>
          <p className="mt-8 max-w-5xl font-display text-[1.75rem] leading-[1.2] font-semibold text-kraft md:text-[2.5rem] lg:text-[3rem]">
            {site.vision}
          </p>
        </div>
      </section>

      {/* Mission — four pillars in a 2x2 grid. */}
      <Section>
        <SectionHead
          eyebrow="Mission"
          title="Four commitments, each one testable"
          lead="A buyer should be able to hold us to every one of these on a specific shipment, not agree with them in principle."
        />

        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
          {site.mission.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 70}>
              <div className="border-t border-brass/30 pt-6">
                <h3 className="text-[1.375rem] leading-snug">{pillar.title}</h3>
                <p className="mt-4 text-[1.0625rem] leading-relaxed">{pillar.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Motive — kraft block, longer-form prose. */}
      <Section tone="kraft">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="mono-label block border-t border-brass/30 pt-4">Our motive</span>
            <h2 className="mt-6 text-[1.75rem] leading-[1.14] md:text-[2.25rem]">
              Why we export at all
            </h2>
          </div>

          <div className="grid max-w-3xl gap-5 lg:col-span-8">
            {site.motive.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-[1.0625rem] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Section>

      {/* Core values — six mono-labelled cards. */}
      <Section tone="harbour">
        <SectionHead
          onDark
          eyebrow="Core values"
          title="Six words we are willing to be measured against"
        />

        <ul className="grid gap-px overflow-hidden rounded-crate border border-brass/30 bg-brass/30 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {site.values.map((value, index) => (
            <li key={value.name} className="bg-harbour p-6 md:p-7">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[0.75rem] tracking-[0.14em] text-brass">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mono-label text-kraft">{value.name}</h3>
              </div>
              <p className="mt-4 text-[0.9375rem] leading-relaxed text-kraft/75">{value.body}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { PageHero } from "@/components/layout/page-hero";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { StatCounters } from "@/components/stat-counters";
import { Reveal } from "@/components/reveal";
import { Section, SectionHead } from "@/components/ui/section";
import { site } from "@/lib/site";
import { SiteImage } from "@/components/site-image";

export const metadata: Metadata = {
  title: "About us",
  description:
    "How the company grew from a single container of turmeric to three export verticals, and the pack house, cold storage and warehouse capacity behind it today.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/about/"),
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about/" },
        ]}
      />

      <PageHero
        eyebrow={`Established ${site.company.established}`}
        title="An export house built around what arrives, not what is promised"
        imageSlot="site.about"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "About", href: "/about" },
        ]}
        lead={<p>{site.company.blurb}</p>}
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 className="mono-label border-t border-brass/30 pt-4">Our story</h2>
          </div>
          <div className="grid max-w-3xl gap-5 lg:col-span-9">
            {site.story.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="text-[1.0625rem] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="By the numbers"
          title="Scale, stated plainly"
          lead="Demo figures in this build — replace them with the company's real numbers in Site Settings before launch."
        />
        <StatCounters stats={site.stats} />
      </Section>

      <Section>
        <SectionHead
          eyebrow="Infrastructure"
          title="What we own rather than rent"
          lead="Controlling the grading line and the cold chain is what makes a specification change possible without a third party agreeing to it first."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.infrastructure.map((item, index) => (
            <Reveal key={item.name} delay={index * 70}>
              <article className="flex h-full flex-col overflow-hidden rounded-crate border border-harbour/12">
                <div className="relative aspect-4/3 bg-harbour/5">
                  <SiteImage
                    slot={`infra.${index}.photo`}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 45vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-[1.1875rem] leading-snug">{item.name}</h3>
                  <p className="mono-data mt-2 text-brass-ink">{item.capacity}</p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed">{item.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="harbour">
        <SectionHead
          onDark
          eyebrow="Team"
          title="Who you will be dealing with"
          lead="Four people cover an inquiry from first email to loaded container. Names go in once the client supplies them."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {site.team.map((member, index) => (
            <div key={member.role} className="overflow-hidden rounded-crate border border-kraft/15">
              <div className="relative aspect-3/4 bg-kraft/5">
                <SiteImage
                  slot={`team.${index}.photo`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <p className="text-[1.0625rem] text-kraft">{member.name}</p>
                <p className="mono-label mt-2 text-brass">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Timeline" title="How the company got here" />

        <ol className="relative grid gap-10 border-l border-brass/30 pl-6 md:pl-10" role="list">
          {site.milestones.map((milestone) => (
            <li key={milestone.title} className="relative">
              <span
                className="absolute top-2 -left-[1.65rem] size-2.5 rounded-full bg-brass md:-left-[2.65rem]"
                aria-hidden="true"
              />
              <span className="mono-label text-brass-ink">{milestone.year}</span>
              <h3 className="mt-2 text-[1.25rem] leading-snug">{milestone.title}</h3>
              <p className="mt-2.5 max-w-2xl text-[0.9375rem] leading-relaxed">{milestone.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="kraft">
        <SectionHead
          eyebrow="Registrations"
          title="Memberships and registration numbers"
          lead="Every number a buyer or a bank might ask to verify, in one place."
        />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <dl className="grid gap-px overflow-hidden rounded-crate border border-brass/30 bg-brass/25">
              {site.registrations.map((registration) => (
                <div
                  key={registration.label}
                  className="grid gap-1 bg-kraft px-5 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4"
                >
                  <dt className="mono-label">{registration.label}</dt>
                  <dd className="mono-data">{registration.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-5">
            <h3 className="mono-label border-t border-brass/30 pt-4">Certifications held</h3>
            <ul className="mt-5 grid gap-4" role="list">
              {site.certifications.map((certification) => (
                <li key={certification.id}>
                  <p className="mono-data text-harbour">{certification.abbr}</p>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed">
                    {certification.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </>
  );
}

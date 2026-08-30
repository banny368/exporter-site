"use client";

import type { ReactNode } from "react";
import { useSiteSettings } from "@/components/providers/store-provider";

/**
 * Applies the admin panel's section settings to a server-rendered home page.
 *
 * The sections themselves are rendered on the server from the seed config, which is what
 * keeps the HTML correct for crawlers and keeps the page weight where it is. This wrapper
 * then hides anything the client has switched off and reorders what is left, both
 * instantly, using CSS `order` on the flex column rather than re-rendering anything.
 *
 * The one thing it cannot do is bring back a section that the deployed seed has switched
 * off — that HTML was never sent. The admin screen says so, and Export settings is the
 * route: the next deploy renders it server-side.
 */
export function SectionGate({ id, children }: { id: string; children: ReactNode }) {
  const settings = useSiteSettings();
  const sections = settings.sections ?? [];

  const index = sections.findIndex((section) => section.id === id);
  // Unknown to the config means it is simply not managed — render it untouched.
  if (index === -1) return <>{children}</>;

  const section = sections[index];
  if (!section.enabled) return null;

  return <div style={{ order: index }}>{children}</div>;
}

/**
 * Blocks the client added in the admin panel that are not yet in the deployed seed.
 * Rendered on the client only until Export settings and a deploy make them part of the
 * server-rendered page.
 */
export function CustomSections() {
  const settings = useSiteSettings();
  const sections = settings.sections ?? [];

  const custom = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => section.kind !== "builtin" && section.enabled);

  if (custom.length === 0) return null;

  return (
    <>
      {custom.map(({ section, index }) => {
        const tone =
          section.tone === "harbour"
            ? "bg-harbour text-kraft"
            : section.tone === "kraft"
              ? "bg-kraft text-slate"
              : "bg-paper text-slate";

        return (
          <section
            key={section.id}
            style={{ order: index }}
            className={`${tone} py-20 md:py-28`}
          >
            <div className="page-shell">
              {section.eyebrow ? (
                <span
                  className={`mono-label block border-t pt-4 ${
                    section.tone === "harbour" ? "border-brass/40 text-brass" : "border-brass/30"
                  }`}
                >
                  {section.eyebrow}
                </span>
              ) : null}

              {section.heading ? (
                <h2
                  className={`mt-6 max-w-3xl text-[1.75rem] leading-[1.12] md:text-[2.25rem] ${
                    section.tone === "harbour" ? "text-kraft" : ""
                  }`}
                >
                  {section.heading}
                </h2>
              ) : null}

              {section.body ? (
                <div className="mt-5 grid max-w-2xl gap-4">
                  {section.body.split(/\n{2,}/).map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 32)}
                      className={`text-[1.0625rem] leading-relaxed ${
                        section.tone === "harbour" ? "text-kraft/80" : ""
                      }`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : null}

              {section.cta_label && section.cta_href ? (
                <a
                  href={section.cta_href}
                  className="mt-7 inline-flex h-11 items-center rounded-crate bg-amber px-5 font-medium text-harbour transition-colors hover:bg-brass-bright"
                >
                  {section.cta_label}
                </a>
              ) : null}
            </div>
          </section>
        );
      })}
    </>
  );
}

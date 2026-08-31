import Image from "next/image";
import { withBase } from "@/lib/paths";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SiteImage } from "@/components/site-image";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * The banner every inner page opens with. Image is optional — without one it falls
 * back to the harbour ground, which keeps the page usable before a client supplies
 * photography.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageSlot,
  crumbs,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  image?: string;
  /** Registry slot, so the banner can be replaced from the admin panel. */
  imageSlot?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
  className?: string;
}) {
  const hasBanner = Boolean(image || imageSlot);

  return (
    // pt-18 clears the fixed header. It lives here rather than on <main> so the harbour
    // ground runs all the way to the top of the viewport and the header sits on it.
    <section className={cn("relative isolate overflow-hidden bg-harbour pt-18", className)}>
      {/*
        The photograph gets a band of its own rather than sitting behind the text.

        It used to be full-bleed at 70% opacity under a scrim that reached full opacity
        at the bottom, which meant a replaced banner came out at roughly the same
        brightness as the placeholder — clients replaced an image and saw no change.
        Thinning that scrim is not an option: the eyebrow and breadcrumbs are brass on
        harbour, and brass needs about 90% scrim coverage to hold 4.5:1 over a bright
        photograph. Text over a client-supplied image can therefore never be relied on.

        Giving the image its own band settles both. The photograph is fully visible
        because nothing is written on it, and the text below sits on solid harbour, at
        exactly the contrast the pages without a banner already pass at.
      */}
      {hasBanner ? (
        <div className="relative h-40 w-full overflow-hidden sm:h-52 lg:h-64">
          {imageSlot ? (
            <SiteImage
              slot={imageSlot}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <Image src={withBase(image!)} alt="" fill priority sizes="100vw" className="object-cover" />
          )}

          {/* A light wash sits the photograph in the palette. No text is over it, so it
              carries no contrast burden and can stay this gentle. */}
          <div className="absolute inset-0 bg-harbour-deep/20" aria-hidden="true" />

          {/* Softens the join, so the band and the text below read as one surface. */}
          <div
            className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-harbour to-transparent"
            aria-hidden="true"
          />
        </div>
      ) : null}

      {/* The image band already carries the top of the section, so the text needs less
          room above it than it does on a page that opens straight onto the ground. */}
      <div
        className={cn(
          "page-shell relative z-10 pb-16 md:pb-24",
          hasBanner ? "pt-10 md:pt-14" : "pt-16 md:pt-24",
        )}
      >
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1" role="list">
              {crumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center gap-2">
                  {index > 0 ? (
                    <span aria-hidden="true" className="text-brass/60">
                      /
                    </span>
                  ) : null}
                  {index === crumbs.length - 1 ? (
                    <span
                      aria-current="page"
                      className="font-mono text-[0.6875rem] tracking-[0.14em] text-kraft/70 uppercase"
                    >
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="font-mono text-[0.6875rem] tracking-[0.14em] text-brass uppercase transition-colors hover:text-brass-bright"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <span className="mono-label text-brass">{eyebrow}</span>

        <h1 className="mt-5 max-w-4xl text-[2rem] leading-[1.08] text-kraft md:text-[2.75rem] lg:text-[3.25rem]">
          {title}
        </h1>

        {lead ? (
          <div className="mt-6 max-w-3xl text-[1.0625rem] leading-relaxed text-kraft/80">{lead}</div>
        ) : null}

        {children}
      </div>
    </section>
  );
}

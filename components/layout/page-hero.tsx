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
  return (
    // pt-18 clears the fixed header. It lives here rather than on <main> so the harbour
    // ground runs all the way to the top of the viewport and the header sits on it.
    <section className={cn("relative isolate overflow-hidden bg-harbour pt-18", className)}>
      {image || imageSlot ? (
        <>
          {imageSlot ? (
            <SiteImage
              slot={imageSlot}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-70"
            />
          ) : (
            <Image src={withBase(image!)} alt="" fill priority sizes="100vw" className="object-cover opacity-70" />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-harbour-deep via-harbour-deep/80 to-harbour-deep/50"
            aria-hidden="true"
          />
        </>
      ) : null}

      <div className="page-shell relative z-10 py-16 md:py-24">
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

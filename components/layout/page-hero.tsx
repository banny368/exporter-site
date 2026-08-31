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
 * The banner every inner page opens with.
 *
 * The photograph sits beside the heading rather than behind it or above it, framed like
 * a print clipped to a shipping file. Two earlier arrangements failed for reasons worth
 * recording, because both look reasonable until measured:
 *
 * Behind the text, it had to be buried. The eyebrow and breadcrumbs are brass on
 * harbour, and brass needs roughly 90% scrim coverage to hold 4.5:1 over a bright
 * photograph. At that coverage a replaced banner looks identical to the one it replaced —
 * measured at mean brightness 34 out of 255 — so clients changed the image and saw
 * nothing happen.
 *
 * Above the text, it was visible but the section grew to 804px: a 256px strip and a
 * 476px block of type, stacked, reading as two unrelated slabs with a muddy fade between
 * them.
 *
 * Side by side, the photograph is at full opacity and unmistakably visible, the type sits
 * on solid harbour at the contrast the pages without a banner already pass at, and the
 * section is roughly half the height. The image is also a fraction of the pixels it was
 * full-bleed, which is the cheapest thing that could have been done for the LCP.
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
    <section
      className={cn(
        "relative isolate overflow-hidden bg-harbour pt-18",
        className,
      )}
    >
      <div className="page-shell relative z-10 pt-12 pb-14 md:pt-16 md:pb-20">
        <div
          className={cn(
            "grid items-center gap-10",
            hasBanner && "lg:grid-cols-12 lg:gap-14",
          )}
        >
          <div className={cn(hasBanner && "lg:col-span-7")}>
            {crumbs?.length ? (
              <nav aria-label="Breadcrumb" className="mb-7">
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

            <h1
              className={cn(
                "mt-4 text-[1.875rem] leading-[1.1] text-kraft md:text-[2.5rem] lg:text-[2.875rem]",
                hasBanner ? "max-w-2xl" : "max-w-4xl",
              )}
            >
              {title}
            </h1>

            {lead ? (
              <div className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-kraft/80">
                {lead}
              </div>
            ) : null}

            {children}
          </div>

          {hasBanner ? (
            // A brass hairline and the crate radius are the same devices the product
            // cards use, so the photograph reads as filed rather than dropped in.
            <div className="lg:col-span-5">
              <div className="relative aspect-16/9 overflow-hidden rounded-crate border border-brass/30 bg-harbour-deep lg:aspect-4/3">
                {imageSlot ? (
                  <SiteImage
                    slot={imageSlot}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={withBase(image!)}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

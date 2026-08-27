import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "paper" | "kraft" | "harbour";

const TONES: Record<Tone, string> = {
  paper: "bg-paper text-slate",
  kraft: "bg-kraft text-slate",
  harbour: "bg-harbour text-kraft",
};

export function Section({
  children,
  tone = "paper",
  className,
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn(TONES[tone], "py-20 md:py-28 lg:py-32", className)}>
      <div className="page-shell">{children}</div>
    </section>
  );
}

/** Hairline brass divider — used instead of borders everywhere. */
export function Rule({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <hr
      className={cn("border-0 border-t", onDark ? "border-brass/40" : "border-brass/30", className)}
    />
  );
}

/**
 * Section headings put their eyebrow in the left margin rather than centred above the
 * title — a margin annotation on a document, not a decorative kicker. It collapses to
 * a stacked label below the lg breakpoint.
 */
export function SectionHead({
  eyebrow,
  title,
  lead,
  action,
  onDark = false,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  action?: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      <div className="grid gap-x-8 gap-y-4 lg:grid-cols-12">
        <div className="lg:col-span-3 xl:col-span-2">
          <span
            className={cn(
              "mono-label block pt-2 lg:border-t lg:pt-4",
              onDark ? "border-brass/40 text-brass" : "border-brass/30 text-slate-soft",
            )}
          >
            {eyebrow}
          </span>
        </div>

        <div className="lg:col-span-9 xl:col-span-10">
          <h2
            className={cn(
              "max-w-3xl text-[1.75rem] leading-[1.12] md:text-[2.25rem] lg:text-[2.75rem]",
              onDark && "text-kraft",
            )}
          >
            {title}
          </h2>

          {lead ? (
            <p
              className={cn(
                "mt-5 max-w-2xl text-[1.0625rem]",
                onDark ? "text-kraft/75" : "text-slate",
              )}
            >
              {lead}
            </p>
          ) : null}

          {action ? <div className="mt-7">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

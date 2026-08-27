import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipTone = "default" | "brass" | "onDark" | "muted";

const TONES: Record<ChipTone, string> = {
  default: "border-harbour/20 bg-harbour/[0.04] text-harbour",
  brass: "border-brass/45 bg-brass/10 text-harbour",
  onDark: "border-kraft/25 bg-kraft/10 text-kraft",
  muted: "border-slate/20 bg-transparent text-slate-soft",
};

/** Mono, uppercase, hairline border. Used for HS codes, MOQ, certifications. */
export function Chip({
  children,
  tone = "default",
  className,
  title,
}: {
  children: ReactNode;
  tone?: ChipTone;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-crate border px-2.5 py-1",
        "font-mono text-[0.6875rem] leading-none tracking-[0.12em] uppercase",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** A labelled data pair, as it would appear on a manifest. */
export function DataPair({
  label,
  value,
  onDark = false,
  className,
}: {
  label: string;
  value: ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-1", className)}>
      <dt className={cn("mono-label", onDark && "text-brass")}>{label}</dt>
      <dd className={cn("mono-data", onDark && "text-kraft")}>{value}</dd>
    </div>
  );
}

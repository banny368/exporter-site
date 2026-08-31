import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { QualityBody } from "@/components/pages/quality-body";

export const metadata: Metadata = {
  title: "Quality assurance & certifications",
  description:
    "Six-stage quality process from sourcing to loading, NABL-accredited lab testing before dispatch, and third-party inspection by SGS, Bureau Veritas or Intertek.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/quality/"),
};

export default function QualityPage() {
  return <QualityBody />;
}

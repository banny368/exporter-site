import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { FaqBody } from "@/components/pages/faq-body";

export const metadata: Metadata = {
  title: "Buyer FAQs",
  description:
    "Minimum order quantities, Incoterms, payment terms, samples, lead times, inspection, documentation and private labelling — answered for first-time buyers.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/faq/"),
};

export default function FaqPage() {
  return <FaqBody />;
}

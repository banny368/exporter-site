import type { Metadata } from "next";
import { canonicalFor } from "@/lib/paths";
import { TermsBody } from "@/components/pages/terms-body";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of use for this website, and the commercial terms that apply to quotations, orders, inspection, claims and shipment.",
  alternates: canonicalFor("/terms/"),
};

export default function TermsPage() {
  return <TermsBody />;
}

import type { Metadata } from "next";
import { canonicalFor } from "@/lib/paths";
import { PrivacyBody } from "@/components/pages/privacy-body";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What this website collects, why, how long it is kept, and the rights you have over it under the GDPR and India's DPDP Act.",
  alternates: canonicalFor("/privacy/"),
};

export default function PrivacyPage() {
  return <PrivacyBody />;
}

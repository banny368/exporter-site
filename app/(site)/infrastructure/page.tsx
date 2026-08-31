import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { InfrastructureBody } from "@/components/pages/infrastructure-body";

export const metadata: Metadata = {
  title: "Infrastructure",
  description:
    "Pack house at 12 MT per day, 600 MT cold storage across four chambers, 1,500 MT dry warehouse, on-site fumigation and a dock-level loading bay.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/infrastructure/"),
};

export default function InfrastructurePage() {
  return <InfrastructureBody />;
}

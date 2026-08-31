import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { AboutBody } from "@/components/pages/about-body";

export const metadata: Metadata = {
  title: "About us",
  description:
    "How the company grew from a single container of turmeric to three export verticals, and the pack house, cold storage and warehouse capacity behind it today.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/about/"),
};

export default function AboutPage() {
  return <AboutBody />;
}

import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { site } from "@/lib/site";
import { HomeBody } from "@/components/pages/home-body";

// Metadata reads the shipped settings on purpose: a search result must describe the
// published company, not one visitor's local edits. The page below reads live settings.
export const metadata: Metadata = {
  title: {
    absolute: `${site.company.name} — Indian produce, spice & furniture exporter`,
  },
  description:
    "Indian export house shipping fresh fruit and vegetables, dehydrated spices, and solid wood furniture. HS codes, loadability and MOQ published per product.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/"),
};

export default function HomePage() {
  return <HomeBody />;
}

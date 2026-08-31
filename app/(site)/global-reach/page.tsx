import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { GlobalReachBody } from "@/components/pages/global-reach-body";

export const metadata: Metadata = {
  title: "Global reach",
  description:
    "Twelve markets across the Middle East, Europe, North America, Southeast Asia and the CIS, loaded from six Indian ports with published transit times.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/global-reach/"),
};

export default function GlobalReachPage() {
  return <GlobalReachBody />;
}

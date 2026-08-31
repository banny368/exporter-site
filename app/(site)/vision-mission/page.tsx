import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { VisionMissionBody } from "@/components/pages/vision-mission-body";

export const metadata: Metadata = {
  title: "Vision, mission & motive",
  description:
    "Connecting Indian growers and workshops directly to overseas buyers, with a verifiable source and a specification that holds from sample to container.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/vision-mission/"),
};

export default function VisionMissionPage() {
  return <VisionMissionBody />;
}

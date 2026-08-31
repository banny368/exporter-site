import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { ExportProcessBody } from "@/components/pages/export-process-body";

export const metadata: Metadata = {
  title: "Export process",
  description:
    "Six steps from inquiry to shipment, each with an expected timeline. Plus the document flow and a plain-language explanation of EXW, FOB, CFR, CIF and DDP.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/export-process/"),
};

export default function ExportProcessPage() {
  return <ExportProcessBody />;
}

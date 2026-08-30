import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import { RfqList } from "@/components/rfq/rfq-list";
import { Section } from "@/components/ui/section";
import { getProducts, toProductSummaries } from "@/lib/products";

export const metadata: Metadata = {
  title: "Your RFQ list",
  description: "Set a quantity per product and send one combined request for quotation.",
  // A personal working list, not a page for search results.
  robots: { index: false, follow: true },
};

export default function RfqPage() {
  return (
    <>
      <PageHero
        eyebrow="Request for quotation"
        title="One message, every product you need quoted"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "RFQ list", href: "/rfq" },
        ]}
        lead={
          <p>
            Set a quantity against each line, add the destination port and Incoterm once,
            and send the whole list in a single message. Your list is kept in this browser
            only.
          </p>
        }
      />

      <Section>
        <RfqList seed={toProductSummaries(getProducts())} />
      </Section>
    </>
  );
}

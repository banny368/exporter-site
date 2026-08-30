"use client";

import { useState } from "react";
import { Check, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { useStore } from "@/components/providers/store-provider";
import type { Product } from "@/lib/types";
import { toProductSummary } from "@/lib/products";

/** The three actions in the buy column: WhatsApp, a quote form, and the RFQ list. */
export function ProductActions({ product }: { product: Product }) {
  const { rfq, addToRfq, hydrated } = useStore();
  const [quoteOpen, setQuoteOpen] = useState(false);
  const inRfq = hydrated && rfq.some((item) => item.product_id === product.id);

  return (
    <div className="grid gap-3">
      <WhatsAppAction
        product={product}
        source={`product-${product.slug}`}
        label="Inquire on WhatsApp"
        variant="primary"
        size="lg"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              Request a quote
            </Button>
          </DialogTrigger>
          <DialogContent
            title={`Request a quote — ${product.name}`}
            description="Send the quantity, destination port and Incoterm. You will have a written quotation within 48 hours."
            className="max-w-2xl"
          >
            <InquiryForm source={`quote-modal-${product.slug}`} presetProducts={[toProductSummary(product)]} />
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          size="lg"
          onClick={() => addToRfq(product.id)}
          disabled={inRfq}
        >
          {inRfq ? (
            <>
              <Check className="size-4" aria-hidden="true" />
              In RFQ list
            </>
          ) : (
            <>
              <ClipboardList className="size-4" aria-hidden="true" />
              Add to RFQ list
            </>
          )}
        </Button>
      </div>

      <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate-soft">
        Prices quoted on FOB or CIF basis against a confirmed enquiry. Payment terms:{" "}
        {product.payment_terms.toLowerCase()}.
      </p>
    </div>
  );
}

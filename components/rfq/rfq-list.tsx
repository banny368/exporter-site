"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { useStore } from "@/components/providers/store-provider";
import { INCOTERMS } from "@/lib/countries";
import { productPath, site } from "@/lib/site";
import { withBase } from "@/lib/paths";
import { useMergedSummaries } from "@/components/providers/store-provider";
import type { ProductSummary } from "@/lib/products";

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2.5 text-[0.9375rem] " +
  "placeholder:text-slate-soft focus-visible:border-brass";

/**
 * The multi-product quote cart. Everything the buyer sets here goes into one WhatsApp
 * message rather than one per product, and the same list is saved as a single RFQ
 * inquiry so it lands in the admin pipeline.
 */
export function RfqList({ seed }: { seed: ProductSummary[] }) {
  const { rfq, hydrated, updateRfqQuantity, removeFromRfq, clearRfq, addInquiry } =
    useStore();

  const [destinationPort, setDestinationPort] = useState("");
  const [incoterm, setIncoterm] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const products = useMergedSummaries(seed);

  const items = rfq
    .map((item) => ({
      quantity: item.quantity,
      product: products.find((product) => product.id === item.product_id),
    }))
    .filter((item): item is { quantity: string; product: NonNullable<typeof item.product> } =>
      Boolean(item.product),
    );

  if (!hydrated) {
    return <p className="mono-label">Loading your list…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-crate border border-dashed border-brass/40 px-6 py-16 text-center">
        <p className="font-display text-[1.375rem] text-harbour">Your RFQ list is empty</p>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed">
          Add products from the catalogue and quote them all in one message, rather than
          sending a separate inquiry for each one.
        </p>
        <Button className="mt-6" asChild>
          <Link href="/products">Browse the catalogue</Link>
        </Button>
      </div>
    );
  }

  function saveRfq() {
    addInquiry({
      name: "",
      company,
      country: "",
      email,
      phone: "",
      message: `RFQ list with ${items.length} product${items.length === 1 ? "" : "s"}.`,
      product_ids: items.map((item) => item.product.id),
      quantity: items.map((item) => `${item.product.name}: ${item.quantity || "—"}`).join("; "),
      destination_port: destinationPort,
      incoterm,
      source: "rfq",
      status: "new",
      internal_notes: "",
    });
    setSaved(true);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <ul className="grid gap-px overflow-hidden rounded-crate border border-harbour/12 bg-harbour/10" role="list">
          {items.map(({ product, quantity }) => {
            const image = product.image;

            return (
              <li key={product.id} className="grid gap-4 bg-paper p-5 sm:grid-cols-[6rem_1fr]">
                <div className="relative aspect-4/3 overflow-hidden rounded-crate bg-harbour/5 sm:aspect-square">
                  <Image src={withBase(image.url)} alt="" fill sizes="96px" className="object-cover" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-[1.0625rem] leading-snug">
                        <Link
                          href={productPath(product.category_id, product.slug)}
                          className="hover:text-brass"
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <p className="mono-label mt-1.5">HS {product.hs_code}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromRfq(product.id)}
                      aria-label={`Remove ${product.name} from the RFQ list`}
                      className="shrink-0 rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-harbour"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  <label
                    htmlFor={`qty-${product.id}`}
                    className="mono-label mt-4 mb-2 block"
                  >
                    Quantity required
                  </label>
                  <input
                    id={`qty-${product.id}`}
                    value={quantity}
                    onChange={(event) => updateRfqQuantity(product.id, event.target.value)}
                    placeholder={product.moq}
                    className={FIELD}
                  />
                  <p className="mono-label mt-2 normal-case tracking-[0.04em]">
                    MOQ {product.moq}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={clearRfq}
          className="mono-label mt-5 underline underline-offset-4 hover:text-harbour"
        >
          Clear the list
        </button>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-24 rounded-crate border border-brass/35 bg-kraft/50 p-6">
          <h2 className="text-[1.25rem] leading-snug">Shared shipment details</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed">
            These apply to every line, so you only enter them once.
          </p>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="rfq-port" className="mono-label">
                Destination port
              </label>
              <input
                id="rfq-port"
                value={destinationPort}
                onChange={(event) => setDestinationPort(event.target.value)}
                placeholder="Jebel Ali"
                className={FIELD}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="rfq-incoterm" className="mono-label">
                Preferred Incoterm
              </label>
              <select
                id="rfq-incoterm"
                value={incoterm}
                onChange={(event) => setIncoterm(event.target.value)}
                className={FIELD}
              >
                <option value="">Select if you know it</option>
                {INCOTERMS.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="rfq-company" className="mono-label">
                Company
              </label>
              <input
                id="rfq-company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                className={FIELD}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="rfq-email" className="mono-label">
                Email
              </label>
              <input
                id="rfq-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div className="mt-7 grid gap-3">
            <WhatsAppAction
              source="rfq-page"
              label={`Send all ${items.length} on WhatsApp`}
              size="lg"
              items={items.map(({ product, quantity }) => ({ product, quantity }))}
              requirement={{ destinationPort, incoterm }}
              inquiry={{ company, email }}
              onSent={saveRfq}
            />

            <Button variant="outline" size="lg" onClick={saveRfq}>
              Save this RFQ
            </Button>
          </div>

          {saved ? (
            <p className="mt-5 flex items-start gap-2 text-[0.875rem] leading-relaxed text-harbour">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brass-ink" aria-hidden="true" />
              Saved. It appears in the admin panel&rsquo;s inquiry pipeline, and we reply
              within 24 hours, {site.contact.hours}.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

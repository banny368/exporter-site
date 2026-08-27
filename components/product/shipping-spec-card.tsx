import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The Shipping Specification card — the block a buyer screenshots and forwards.
 *
 * It is built to read as a document rather than a UI panel: a header strip with a
 * reference number derived from the HS code, stencilled uppercase field labels, mono
 * values, hairline dividers, and a brass rule down the left edge. Everything around it
 * on the page is deliberately quieter than this.
 */

function specRows(product: Product): { label: string; value: string }[] {
  return [
    { label: "Trade name", value: product.name },
    { label: "HS code", value: product.hs_code },
    { label: "Grade / variety", value: product.variety },
    { label: "Origin cluster", value: product.origin },
    { label: "Season & availability", value: product.season },
    { label: "Packing options", value: product.packing },
    { label: "MOQ", value: product.moq },
    { label: "Shelf life", value: product.shelf_life },
    { label: "Storage", value: product.storage_temp },
    { label: "Loading ports", value: product.loading_ports.join(" · ") },
    { label: "Lead time", value: product.lead_time },
    { label: "Payment terms", value: product.payment_terms },
    { label: "Incoterms offered", value: product.incoterms },
    // Rows the client adds in the admin panel land here, after the standard set.
    ...product.specs.filter(
      (row) => !["Trade name", "HS code"].includes(row.label),
    ),
  ];
}

export function ShippingSpecCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const rows = specRows(product);
  const reference = `SPEC/${product.hs_code.replace(/\./g, "")}/${product.slug
    .slice(0, 3)
    .toUpperCase()}`;

  return (
    <section
      aria-labelledby={`spec-${product.slug}`}
      className={cn(
        "rounded-crate border border-harbour/15 border-l-2 border-l-brass bg-paper",
        className,
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-brass/30 px-5 py-4 md:px-7">
        <h3
          id={`spec-${product.slug}`}
          className="font-mono text-[0.8125rem] tracking-[0.16em] uppercase"
        >
          Shipping specification
        </h3>
        <span className="mono-label">{reference}</span>
      </header>

      <dl className="divide-y divide-brass/20">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 px-5 py-3.5 md:grid-cols-[13rem_1fr] md:gap-6 md:px-7"
          >
            <dt className="mono-label pt-0.5">{row.label}</dt>
            <dd className="mono-data text-[0.8125rem] leading-relaxed md:text-sm">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <footer className="border-t border-brass/30 px-5 py-3.5 md:px-7">
        <p className="mono-label leading-relaxed normal-case tracking-[0.04em]">
          Prices quoted on FOB or CIF basis against a confirmed enquiry. Specification is
          agreed before order and verified before the container is sealed.
        </p>
      </footer>
    </section>
  );
}

/** The compact strip that sits under the product name in the buy column. */
export function SpecStrip({ product, className }: { product: Product; className?: string }) {
  const items = [
    `HS CODE ${product.hs_code}`,
    `ORIGIN ${product.origin.toUpperCase()}`,
    `SEASON ${product.season.toUpperCase()}`,
  ];

  return (
    <p
      className={cn(
        "font-mono text-[0.6875rem] leading-relaxed tracking-[0.11em] text-slate-soft uppercase",
        className,
      )}
    >
      {items.join("  ·  ")}
    </p>
  );
}

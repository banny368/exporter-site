"use client";

import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { useStore, useMergedProducts } from "@/components/providers/store-provider";
import { useClientValue } from "@/lib/client-hooks";
import { STATUS_LABELS } from "@/lib/store-core";
import { formatDate } from "@/lib/utils";
import { INQUIRY_STATUSES } from "@/lib/types";
import { getAllProducts } from "@/lib/products";

function Tile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-crate border border-harbour/12 bg-paper p-5">
      <p className="mono-label">{label}</p>
      <p className="mt-3 font-display text-[2rem] leading-none font-semibold text-harbour">
        {value}
      </p>
      {note ? <p className="mt-2 text-[0.8125rem] text-slate-soft">{note}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const { categories, inquiries, events } = useStore();
  const products = useMergedProducts(getAllProducts());

  // Read the clock as a date string rather than a timestamp: the snapshot has to be
  // stable across renders, and this one only changes at midnight.
  const today = useClientValue(() => new Date().toISOString().slice(0, 10), "");
  const since = (days: number) =>
    today ? new Date(Date.parse(today) - days * 86_400_000).toISOString() : "";

  const monthAgo = since(30);
  const weekAgo = since(7);

  const inquiriesThisMonth = inquiries.filter((inquiry) => inquiry.created_at >= monthAgo);
  const whatsappThisWeek = events.filter(
    (event) => event.name === "whatsapp_click" && event.created_at >= weekAgo,
  );

  // Which products actually generate interest — inquiries plus WhatsApp clicks.
  const interest = new Map<string, number>();
  for (const inquiry of inquiries) {
    for (const id of inquiry.product_ids) interest.set(id, (interest.get(id) ?? 0) + 1);
  }
  for (const event of events) {
    if (!event.product_slug) continue;
    const product = products.find((item) => item.slug === event.product_slug);
    if (product) interest.set(product.id, (interest.get(product.id) ?? 0) + 1);
  }

  const topProducts = [...interest.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ product: products.find((item) => item.id === id), count }))
    .filter((row) => row.product);

  return (
    <>
      <AdminHeader
        title="Dashboard"
        lead="Everything on this screen is drawn from what has happened in this browser. Click around the public site and the numbers move."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label="Published products"
          value={products.filter((product) => product.is_published).length}
          note={`${products.length} total, ${categories.length} categories`}
        />
        <Tile
          label="Inquiries this month"
          value={inquiriesThisMonth.length}
          note={`${inquiries.length} all time`}
        />
        <Tile
          label="New, not yet contacted"
          value={inquiries.filter((inquiry) => inquiry.status === "new").length}
          note="Sitting at the top of the pipeline"
        />
        <Tile
          label="WhatsApp clicks this week"
          value={whatsappThisWeek.length}
          note={`${events.filter((event) => event.name === "whatsapp_click").length} all time`}
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Products by category</h2>
          <ul className="grid gap-3" role="list">
            {categories.map((category) => {
              const count = products.filter(
                (product) => product.category_id === category.slug,
              ).length;
              const share = products.length ? Math.round((count / products.length) * 100) : 0;

              return (
                <li key={category.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[0.9375rem]">{category.name}</span>
                    <span className="mono-data text-[0.8125rem]">{count}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-[2px] bg-harbour/8">
                    <div className="h-full bg-brass" style={{ width: `${share}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Inquiries by status</h2>
          <ul className="grid gap-2.5" role="list">
            {INQUIRY_STATUSES.map((status) => (
              <li key={status} className="flex items-baseline justify-between gap-4">
                <span className="text-[0.9375rem]">{STATUS_LABELS[status]}</span>
                <span className="mono-data text-[0.8125rem]">
                  {inquiries.filter((inquiry) => inquiry.status === status).length}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Most-inquired products</h2>
          {topProducts.length === 0 ? (
            <p className="text-[0.9375rem] leading-relaxed text-slate-soft">
              Nothing yet. Open a product on the public site and press an Inquire button —
              it will appear here.
            </p>
          ) : (
            <ol className="grid gap-2.5" role="list">
              {topProducts.map((row) => (
                <li key={row.product!.id} className="flex items-baseline justify-between gap-4">
                  <Link
                    href={`/products/${row.product!.category_id}/${row.product!.slug}`}
                    className="text-[0.9375rem] hover:text-brass-ink"
                  >
                    {row.product!.name}
                  </Link>
                  <span className="mono-data text-[0.8125rem]">{row.count}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section>
          <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Recent inquiries</h2>
          {inquiries.length === 0 ? (
            <p className="text-[0.9375rem] leading-relaxed text-slate-soft">
              No inquiries yet. Submit the contact form on the public site to see one land
              in the pipeline.
            </p>
          ) : (
            <ul className="grid gap-3" role="list">
              {inquiries.slice(0, 10).map((inquiry) => (
                <li key={inquiry.id} className="flex items-baseline justify-between gap-4">
                  <span className="min-w-0 truncate text-[0.9375rem]">
                    {inquiry.company || inquiry.name || "Unnamed"}
                    <span className="ml-2 text-slate-soft">{inquiry.country}</span>
                  </span>
                  <span className="mono-label shrink-0">{formatDate(inquiry.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/inquiries" className="mono-label mt-5 inline-block hover:text-harbour">
            Open the pipeline →
          </Link>
        </section>
      </div>
    </>
  );
}

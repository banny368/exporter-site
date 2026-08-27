"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/components/providers/store-provider";
import { STATUS_LABELS, inquiriesToCsv } from "@/lib/store-core";
import { downloadTextFile } from "@/lib/store";
import { INQUIRY_STATUSES, type Inquiry, type InquiryStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const FIELD =
  "rounded-crate border border-harbour/20 bg-paper px-3 py-2 text-[0.875rem] focus-visible:border-brass";

export default function AdminInquiriesPage() {
  const { inquiries, products, updateInquiry, hydrated } = useStore();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Inquiry | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return inquiries.filter((inquiry) => {
      if (status && inquiry.status !== status) return false;
      if (term && !`${inquiry.name} ${inquiry.company} ${inquiry.country} ${inquiry.email}`.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [inquiries, status, search]);

  function productNames(inquiry: Inquiry): string {
    if (inquiry.product_ids.length === 0) return "General inquiry";
    return inquiry.product_ids
      .map((id) => products.find((product) => product.id === id)?.name ?? id)
      .join(", ");
  }

  return (
    <>
      <AdminHeader
        title="Inquiries"
        lead="Every form submission, WhatsApp handoff and saved RFQ from this browser, in one pipeline."
        action={
          <Button
            variant="outline"
            onClick={() =>
              downloadTextFile(
                `inquiries-${new Date().toISOString().slice(0, 10)}.csv`,
                inquiriesToCsv(rows),
              )
            }
            disabled={rows.length === 0}
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label htmlFor="inq-search" className="sr-only">
          Search inquiries
        </label>
        <input
          id="inq-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, company, country or email"
          className={`${FIELD} min-w-56 flex-1`}
        />

        <label htmlFor="inq-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="inq-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={FIELD}
        >
          <option value="">Any status</option>
          {INQUIRY_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {hydrated && inquiries.length === 0 ? (
        <div className="rounded-crate border border-dashed border-brass/40 px-6 py-14 text-center">
          <p className="font-display text-[1.25rem] text-harbour">No inquiries yet</p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed">
            Open the public site, submit the contact form or save an RFQ list, and it will
            appear here with a full pipeline behind it.
          </p>
        </div>
      ) : (
        <div className="contain-paint overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-brass/30">
                <th scope="col" className="mono-label pb-3 font-normal">Date</th>
                <th scope="col" className="mono-label pb-3 font-normal">Company</th>
                <th scope="col" className="mono-label pb-3 font-normal">Country</th>
                <th scope="col" className="mono-label pb-3 font-normal">Products</th>
                <th scope="col" className="mono-label pb-3 font-normal">Source</th>
                <th scope="col" className="mono-label pb-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className="cursor-pointer border-b border-brass/15 hover:bg-kraft/40"
                  onClick={() => setOpen(inquiry)}
                >
                  <td className="mono-label py-3.5 pr-4">{formatDate(inquiry.created_at)}</td>
                  <td className="py-3.5 pr-4">
                    <button type="button" className="text-left text-[0.9375rem] text-harbour hover:text-brass-ink">
                      {inquiry.company || inquiry.name || "Unnamed"}
                    </button>
                    <p className="mono-label mt-1">{inquiry.email}</p>
                  </td>
                  <td className="py-3.5 pr-4 text-[0.875rem]">{inquiry.country || "—"}</td>
                  <td className="max-w-56 truncate py-3.5 pr-4 text-[0.875rem]">
                    {productNames(inquiry)}
                  </td>
                  <td className="py-3.5 pr-4">
                    <Chip tone="muted">{inquiry.source}</Chip>
                  </td>
                  <td className="py-3.5">
                    <Chip tone={inquiry.status === "new" ? "brass" : "default"}>
                      {STATUS_LABELS[inquiry.status]}
                    </Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(open)} onOpenChange={(isOpen) => !isOpen && setOpen(null)}>
        <DialogContent title="Inquiry detail" className="max-w-2xl">
          {open ? (
            <div className="grid gap-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Name", open.name || "—"],
                  ["Company", open.company || "—"],
                  ["Country", open.country || "—"],
                  ["Email", open.email || "—"],
                  ["Phone", open.phone || "—"],
                  ["Quantity", open.quantity || "—"],
                  ["Destination port", open.destination_port || "—"],
                  ["Incoterm", open.incoterm || "—"],
                  ["Source", open.source],
                  ["Received", formatDate(open.created_at)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="mono-label">{label}</dt>
                    <dd className="mono-data mt-1 break-words">{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <h3 className="mono-label">Products</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed">{productNames(open)}</p>
              </div>

              {open.message ? (
                <div>
                  <h3 className="mono-label">Message</h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed whitespace-pre-wrap">
                    {open.message}
                  </p>
                </div>
              ) : null}

              <div>
                <h3 className="mono-label mb-3">Pipeline</h3>
                <div className="flex flex-wrap gap-2">
                  {INQUIRY_STATUSES.map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={open.status === value}
                      onClick={() => {
                        updateInquiry(open.id, { status: value as InquiryStatus });
                        setOpen({ ...open, status: value as InquiryStatus });
                      }}
                      className={`rounded-crate border px-3 py-2 font-mono text-[0.6875rem] tracking-[0.1em] uppercase ${
                        open.status === value
                          ? "border-brass bg-brass/15 text-harbour"
                          : "border-harbour/15 text-slate hover:border-harbour/40"
                      }`}
                    >
                      {STATUS_LABELS[value]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="internal-notes" className="mono-label">
                  Internal notes
                </label>
                <textarea
                  id="internal-notes"
                  rows={4}
                  value={open.internal_notes}
                  onChange={(event) => {
                    updateInquiry(open.id, { internal_notes: event.target.value });
                    setOpen({ ...open, internal_notes: event.target.value });
                  }}
                  placeholder="Quoted 12 Feb at USD 1,240 CIF Jebel Ali. Awaiting confirmation."
                  className="w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2.5 text-[0.9375rem] focus-visible:border-brass"
                />
                <p className="text-[0.8125rem] text-slate-soft">
                  Saved as you type. Never shown to the buyer.
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

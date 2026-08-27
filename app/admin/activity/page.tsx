"use client";

import { AdminHeader } from "@/components/admin/admin-shell";
import { Chip } from "@/components/ui/chip";
import { useStore } from "@/components/providers/store-provider";

function timestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminActivityPage() {
  const { activity, events, hydrated } = useStore();

  return (
    <>
      <AdminHeader
        title="Activity log"
        lead="Who changed what, and when. Cheap to keep, and it settles arguments later."
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Content changes</h2>

          {hydrated && activity.length === 0 ? (
            <p className="text-[0.9375rem] leading-relaxed text-slate-soft">
              Nothing recorded yet. Edit a product or a setting and it will show up here.
            </p>
          ) : (
            <ul className="grid gap-3" role="list">
              {activity.slice(0, 60).map((entry) => (
                <li key={entry.id} className="border-b border-brass/15 pb-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="text-[0.9375rem] text-harbour">{entry.action}</span>
                    <span className="mono-label">{timestamp(entry.created_at)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip tone="muted">{entry.entity}</Chip>
                    <span className="font-mono text-[0.6875rem] text-slate-soft">
                      {entry.entity_id}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Buyer events</h2>

          {hydrated && events.length === 0 ? (
            <p className="text-[0.9375rem] leading-relaxed text-slate-soft">
              No WhatsApp clicks recorded yet. Press an Inquire button on the public site
              and it lands here, and on the dashboard.
            </p>
          ) : (
            <ul className="grid gap-3" role="list">
              {events.slice(0, 60).map((event) => (
                <li key={event.id} className="border-b border-brass/15 pb-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <span className="mono-data text-[0.8125rem]">{event.name}</span>
                    <span className="mono-label">{timestamp(event.created_at)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip tone="muted">{event.source}</Chip>
                    {event.product_slug ? <Chip tone="brass">{event.product_slug}</Chip> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

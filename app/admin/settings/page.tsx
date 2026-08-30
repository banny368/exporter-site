"use client";

import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import { downloadTextFile, listMedia } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2.5 text-[0.9375rem] focus-visible:border-brass";

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="mono-label">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[0.8125rem] leading-relaxed text-slate-soft">{hint}</p> : null}
    </div>
  );
}

export default function AdminSettingsPage() {
  const { settings, saveSettings } = useStore();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saved, setSaved] = useState(false);

  const setCompany = (patch: Partial<SiteSettings["company"]>) =>
    setDraft({ ...draft, company: { ...draft.company, ...patch } });
  const setContact = (patch: Partial<SiteSettings["contact"]>) =>
    setDraft({ ...draft, contact: { ...draft.contact, ...patch } });

  return (
    <>
      <AdminHeader
        title="Site settings"
        lead="Everything that would otherwise be hardcoded. Saving here re-brands the whole public site."
      />

      <form
        className="grid max-w-3xl gap-10"
        onSubmit={(event) => {
          event.preventDefault();
          saveSettings({
            company: draft.company,
            contact: draft.contact,
            registrations: draft.registrations,
            socials: draft.socials,
            marketplaces: draft.marketplaces,
          });
          setSaved(true);
          window.setTimeout(() => setSaved(false), 3000);
        }}
      >
        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Company</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Trading name" id="company-name">
              <input
                id="company-name"
                className={FIELD}
                value={draft.company.name}
                onChange={(event) => setCompany({ name: event.target.value })}
              />
            </Field>
            <Field label="Legal name" id="company-legal">
              <input
                id="company-legal"
                className={FIELD}
                value={draft.company.legal_name}
                onChange={(event) => setCompany({ legal_name: event.target.value })}
              />
            </Field>
            <Field label="Tagline" id="company-tagline">
              <input
                id="company-tagline"
                className={FIELD}
                value={draft.company.tagline}
                onChange={(event) => setCompany({ tagline: event.target.value })}
              />
            </Field>
            <Field label="Established" id="company-established">
              <input
                id="company-established"
                className={FIELD}
                value={draft.company.established}
                onChange={(event) => setCompany({ established: event.target.value })}
              />
            </Field>
          </div>

          <Field label="Footer blurb" id="company-blurb">
            <textarea
              id="company-blurb"
              rows={4}
              className={FIELD}
              value={draft.company.blurb}
              onChange={(event) => setCompany({ blurb: event.target.value })}
            />
          </Field>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Contact</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="WhatsApp number"
              id="contact-whatsapp"
              hint="Digits only, with country code — for example 919876543210."
            >
              <input
                id="contact-whatsapp"
                className={FIELD}
                value={draft.contact.whatsapp}
                onChange={(event) => setContact({ whatsapp: event.target.value })}
              />
            </Field>
            <Field label="WhatsApp, as displayed" id="contact-whatsapp-display">
              <input
                id="contact-whatsapp-display"
                className={FIELD}
                value={draft.contact.whatsapp_display}
                onChange={(event) => setContact({ whatsapp_display: event.target.value })}
              />
            </Field>
            <Field label="Phone" id="contact-phone">
              <input
                id="contact-phone"
                className={FIELD}
                value={draft.contact.phone}
                onChange={(event) => setContact({ phone: event.target.value })}
              />
            </Field>
            <Field label="Phone, as displayed" id="contact-phone-display">
              <input
                id="contact-phone-display"
                className={FIELD}
                value={draft.contact.phone_display}
                onChange={(event) => setContact({ phone_display: event.target.value })}
              />
            </Field>
            <Field label="Sales email" id="contact-email">
              <input
                id="contact-email"
                type="email"
                className={FIELD}
                value={draft.contact.email}
                onChange={(event) => setContact({ email: event.target.value })}
              />
            </Field>
            <Field label="Working hours" id="contact-hours">
              <input
                id="contact-hours"
                className={FIELD}
                value={draft.contact.hours}
                onChange={(event) => setContact({ hours: event.target.value })}
              />
            </Field>
          </div>

          <div className="rounded-crate border border-brass/40 bg-brass/10 p-4">
            <label className="flex items-start gap-3 text-[0.9375rem] leading-relaxed">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-brass"
                checked={draft.contact.whatsapp_configured}
                onChange={(event) => setContact({ whatsapp_configured: event.target.checked })}
              />
              <span>
                This WhatsApp number is real and live.
                <span className="mt-1 block text-[0.8125rem] text-slate">
                  While unticked, every WhatsApp button shows a preview of the message it
                  would send instead of opening a dead chat. Tick it once a real number is
                  in the field above.
                </span>
              </span>
            </label>
          </div>

          <Field label="Address" id="contact-address" hint="One line per row.">
            <textarea
              id="contact-address"
              rows={4}
              className={FIELD}
              value={draft.contact.address_lines.join("\n")}
              onChange={(event) =>
                setContact({ address_lines: event.target.value.split("\n") })
              }
            />
          </Field>

          <Field
            label="Map search query"
            id="contact-map"
            hint="What the contact page map searches for."
          >
            <input
              id="contact-map"
              className={FIELD}
              value={draft.contact.map_query}
              onChange={(event) => setContact({ map_query: event.target.value })}
            />
          </Field>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Registration numbers</h2>
          <div className="grid gap-3">
            {draft.registrations.map((registration, index) => (
              <div key={registration.label} className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                <label
                  htmlFor={`reg-${index}`}
                  className="mono-label self-center"
                >
                  {registration.label}
                </label>
                <input
                  id={`reg-${index}`}
                  className={FIELD}
                  value={registration.value}
                  onChange={(event) => {
                    const next = [...draft.registrations];
                    next[index] = { ...registration, value: event.target.value };
                    setDraft({ ...draft, registrations: next });
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Social and marketplace links</h2>

          <div className="grid gap-3">
            {[...draft.socials, ...draft.marketplaces].map((link) => {
              const isSocial = draft.socials.some((item) => item.network === link.network);

              return (
                <div key={link.network} className="grid gap-2 sm:grid-cols-[10rem_1fr]">
                  <label
                    htmlFor={`link-${link.network}`}
                    className="mono-label self-center"
                  >
                    {link.network}
                  </label>
                  <input
                    id={`link-${link.network}`}
                    type="url"
                    className={FIELD}
                    value={link.url}
                    onChange={(event) => {
                      if (isSocial) {
                        setDraft({
                          ...draft,
                          socials: draft.socials.map((item) =>
                            item.network === link.network ? { ...item, url: event.target.value } : item,
                          ),
                        });
                      } else {
                        setDraft({
                          ...draft,
                          marketplaces: draft.marketplaces.map((item) =>
                            item.network === link.network ? { ...item, url: event.target.value } : item,
                          ),
                        });
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4 border-t border-brass/25 pt-6">
          <Button type="submit" size="lg">
            Save settings
          </Button>
          {saved ? (
            <p className="flex items-center gap-2 text-[0.9375rem] text-harbour">
              <CheckCircle2 className="size-4 text-brass-ink" aria-hidden="true" />
              Saved. Open the public site to see it.
            </p>
          ) : null}
        </div>
      </form>

      {/*
        The bridge between "edited in this browser" and "live for everyone". Everything
        the admin panel changes lives in localStorage; this writes it back out as the
        same data/site.json the site is built from.
      */}
      <section className="mt-12 border-t border-brass/25 pt-8">
        <h2 className="mono-label mb-3">Publish these changes</h2>
        <p className="mb-5 max-w-2xl text-[0.9375rem] leading-relaxed">
          Everything you change here is saved in this browser, so only you can see it.
          Export the settings file, drop it into <span className="font-mono">data/site.json</span>{" "}
          in the repository, and deploy — then every visitor sees it.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              downloadTextFile(
                "site.json",
                JSON.stringify(settings, null, 2) + "\n",
                "application/json",
              );
            }}
          >
            <Download className="size-4" aria-hidden="true" />
            Export settings file
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              const media = (await listMedia()) ?? [];
              downloadTextFile(
                "media-manifest.json",
                JSON.stringify(
                  media.map((record) => ({
                    id: record.id,
                    name: record.name,
                    width: record.width,
                    height: record.height,
                    bytes: record.bytes,
                    dataUrl: record.dataUrl,
                  })),
                  null,
                  2,
                ) + "\n",
                "application/json",
              );
            }}
          >
            Export uploaded images
          </Button>
        </div>

        <p className="mono-label mt-4 normal-case tracking-[0.04em]">
          Uploaded images export separately because they are stored as data URLs and the
          file is large. Save them into <span className="font-mono">public/</span> and point
          the settings at those paths before deploying.
        </p>
      </section>
    </>
  );
}

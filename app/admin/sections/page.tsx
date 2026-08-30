"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import { createId } from "@/lib/store-core";
import type { SectionConfig } from "@/lib/types";

/** Names the client will recognise, rather than the ids the code uses. */
const BUILTIN_LABELS: Record<string, string> = {
  hero: "Hero banner",
  "trust-bar": "Certification bar",
  verticals: "Three product verticals",
  catalogue: "Featured catalogue",
  capability: "Capability — what differs between suppliers",
  process: "Export process, six steps",
  reach: "Global reach and port network",
  documents: "Documents we provide",
  testimonials: "Buyer testimonials",
  cta: "Inquiry call to action",
};

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2 text-[0.9375rem] focus-visible:border-brass-ink";

export default function AdminSectionsPage() {
  const { settings, saveSettings } = useStore();
  const sections = settings.sections ?? [];
  const [editing, setEditing] = useState<string | null>(null);

  function write(next: SectionConfig[]) {
    saveSettings({ sections: next });
  }

  function move(index: number, by: number) {
    const next = [...sections];
    const target = index + by;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    write(next);
  }

  function toggle(index: number) {
    const next = [...sections];
    next[index] = { ...next[index], enabled: !next[index].enabled };
    write(next);
  }

  function update(index: number, patch: Partial<SectionConfig>) {
    const next = [...sections];
    next[index] = { ...next[index], ...patch };
    write(next);
  }

  function addCustom() {
    const section: SectionConfig = {
      id: createId("sec"),
      kind: "rich-text",
      enabled: true,
      tone: "paper",
      eyebrow: "New section",
      heading: "A heading for this section",
      body: "Write the copy here. Leave a blank line between paragraphs.",
      cta_label: "",
      cta_href: "",
    };
    write([...sections, section]);
    setEditing(section.id);
  }

  function remove(index: number) {
    write(sections.filter((_, i) => i !== index));
  }

  return (
    <>
      <AdminHeader
        title="Sections"
        lead="Which blocks appear on the home page, and in what order."
        action={
          <Button onClick={addCustom}>
            <Plus className="size-4" aria-hidden="true" />
            Add a section
          </Button>
        }
      />

      {/*
        Being straight about what applies where. Hiding and reordering are pure CSS on
        already-delivered markup, so they are instant. Bringing a hidden section back, or
        publishing a new one to real visitors, needs the settings exported and deployed —
        that HTML was never sent to the browser in the first place.
      */}
      <p className="mb-8 max-w-3xl rounded-crate border border-brass/35 bg-brass/5 p-4 text-[0.9375rem] leading-relaxed">
        Hiding and reordering take effect immediately for you. To make them live for real
        visitors — and to publish a section you have added here — use{" "}
        <strong>Export settings</strong> on the Site settings screen and deploy the file.
      </p>

      <ul className="grid gap-3" role="list">
        {sections.map((section, index) => {
          const label = BUILTIN_LABELS[section.id] ?? section.heading ?? "Custom section";
          const isCustom = section.kind !== "builtin";
          const open = editing === section.id;

          return (
            <li
              key={section.id}
              className={`rounded-crate border p-4 ${
                section.enabled ? "border-harbour/12" : "border-dashed border-harbour/25 bg-harbour/[0.02]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="mono-label w-6 shrink-0">{index + 1}</span>
                  <div className="min-w-0">
                    <p
                      className={`text-[1.0625rem] leading-snug ${
                        section.enabled ? "text-harbour" : "text-slate-soft"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="mono-label mt-1">
                      {isCustom ? "Custom block" : "Built in"}
                      {section.enabled ? "" : " · hidden"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move ${label} up`}
                    className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-harbour disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                    aria-label={`Move ${label} down`}
                    className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-harbour disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-pressed={!section.enabled}
                    aria-label={section.enabled ? `Hide ${label}` : `Show ${label}`}
                    className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-harbour"
                  >
                    {section.enabled ? (
                      <Eye className="size-4" aria-hidden="true" />
                    ) : (
                      <EyeOff className="size-4" aria-hidden="true" />
                    )}
                  </button>

                  {isCustom ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(open ? null : section.id)}
                      >
                        {open ? "Done" : "Edit"}
                      </Button>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Delete ${label}`}
                        className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-[#9B2C1B]"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {isCustom && open ? (
                <div className="mt-5 grid gap-4 border-t border-brass/25 pt-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="mono-label">Eyebrow</span>
                      <input
                        value={section.eyebrow ?? ""}
                        onChange={(event) => update(index, { eyebrow: event.target.value })}
                        className={FIELD}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="mono-label">Background</span>
                      <select
                        value={section.tone ?? "paper"}
                        onChange={(event) =>
                          update(index, { tone: event.target.value as SectionConfig["tone"] })
                        }
                        className={FIELD}
                      >
                        <option value="paper">Page background</option>
                        <option value="kraft">Light band</option>
                        <option value="harbour">Dark band</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className="mono-label">Heading</span>
                    <input
                      value={section.heading ?? ""}
                      onChange={(event) => update(index, { heading: event.target.value })}
                      className={FIELD}
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="mono-label">Body</span>
                    <textarea
                      rows={5}
                      value={section.body ?? ""}
                      onChange={(event) => update(index, { body: event.target.value })}
                      className={`${FIELD} resize-y`}
                    />
                    <span className="text-[0.8125rem] text-slate-soft">
                      Leave a blank line between paragraphs.
                    </span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className="mono-label">Button label</span>
                      <input
                        value={section.cta_label ?? ""}
                        placeholder="Leave blank for no button"
                        onChange={(event) => update(index, { cta_label: event.target.value })}
                        className={FIELD}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="mono-label">Button link</span>
                      <input
                        value={section.cta_href ?? ""}
                        placeholder="/contact"
                        onChange={(event) => update(index, { cta_href: event.target.value })}
                        className={FIELD}
                      />
                    </label>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

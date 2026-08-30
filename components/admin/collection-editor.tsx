"use client";

import { useId, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import type { CollectionSchema, FieldSchema } from "@/lib/collections";
import type { SiteSettings } from "@/lib/types";

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2 text-[0.9375rem] focus-visible:border-brass-ink";

type Row = Record<string, unknown>;

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  // useId rather than a random string: stable across renders, and unique per instance
  // so two collections rendering the same field key still get distinct labels.
  const id = `${useId()}-${field.key}`;

  return (
    <label className={`grid gap-1.5 ${field.wide ? "sm:col-span-2" : ""}`} htmlFor={id}>
      <span className="mono-label">{field.label}</span>

      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={4}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={`${FIELD} resize-y`}
        />
      ) : field.type === "number" ? (
        <input
          id={id}
          type="number"
          value={Number(value ?? 0)}
          onChange={(event) => onChange(Number(event.target.value))}
          className={FIELD}
        />
      ) : field.type === "list" ? (
        <input
          id={id}
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(",")
                .map((part) => part.trim())
                .filter(Boolean),
            )
          }
          className={FIELD}
        />
      ) : (
        <input
          id={id}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
          className={FIELD}
        />
      )}

      {field.hint ? <span className="text-[0.8125rem] text-slate-soft">{field.hint}</span> : null}
    </label>
  );
}

/**
 * One editor for every content list on the site.
 *
 * The schema says what the fields are; this handles add, edit, reorder and delete for all
 * of them. Thirteen bespoke screens would have been thirteen places to fix the same bug.
 *
 * Lists stored as plain strings are wrapped into objects to edit and unwrapped on save,
 * so the shape on disk stays what the rest of the site expects.
 */
export function CollectionEditor({ schema }: { schema: CollectionSchema }) {
  const { settings, saveSettings } = useStore();
  const [open, setOpen] = useState<number | null>(null);

  const stored = (settings[schema.key] ?? []) as unknown[];
  const rows: Row[] = schema.primitive
    ? stored.map((value) => ({ value }))
    : (stored as Row[]);

  function write(next: Row[]) {
    const value = schema.primitive ? next.map((row) => row.value) : next;
    saveSettings({ [schema.key]: value } as unknown as Partial<SiteSettings>);
  }

  function update(index: number, key: string, value: unknown) {
    const next = [...rows];
    next[index] = { ...next[index], [key]: value };
    write(next);
  }

  function move(index: number, by: number) {
    const target = index + by;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    write(next);
  }

  return (
    <section className="border-t border-brass/25 pt-8">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.25rem] leading-snug">{schema.label}</h2>
          <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed">{schema.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            write([...rows, schema.blank()]);
            setOpen(rows.length);
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Add a {schema.itemLabel}
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-crate border border-dashed border-brass/40 px-5 py-8 text-center text-[0.9375rem]">
          Nothing here yet. Add a {schema.itemLabel} and it appears on the site straight away.
        </p>
      ) : (
        <ul className="grid gap-2" role="list">
          {rows.map((row, index) => {
            const title = String(row[schema.titleField] ?? `Untitled ${schema.itemLabel}`);
            const isOpen = open === index;

            return (
              <li key={index} className="rounded-crate border border-harbour/12">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="mono-label w-6 shrink-0">{index + 1}</span>
                    <p className="min-w-0 truncate text-[0.9375rem] text-harbour">{title}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${title} up`}
                      className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-harbour disabled:opacity-30"
                    >
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                      aria-label={`Move ${title} down`}
                      className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-harbour disabled:opacity-30"
                    >
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpen(isOpen ? null : index)}
                    >
                      {isOpen ? "Done" : "Edit"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => write(rows.filter((_, i) => i !== index))}
                      aria-label={`Delete ${title}`}
                      className="rounded-crate p-2 text-slate transition-colors hover:bg-harbour/5 hover:text-[#9B2C1B]"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="grid gap-4 border-t border-brass/20 p-4 sm:grid-cols-2">
                    {schema.fields.map((field) => (
                      <Field
                        key={field.key}
                        field={field}
                        value={row[field.key]}
                        onChange={(next) => update(index, field.key, next)}
                      />
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useStore, useMergedProducts } from "@/components/providers/store-provider";
import type { Category } from "@/lib/types";
import { monthLabels } from "@/lib/utils";
import { getAllProducts } from "@/lib/products";

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2.5 text-[0.9375rem] focus-visible:border-brass";

export default function AdminCategoriesPage() {
  const { categories, saveCategory } = useStore();
  const products = useMergedProducts(getAllProducts());
  const [editing, setEditing] = useState<Category | null>(null);

  if (editing) {
    const set = <K extends keyof Category>(key: K, value: Category[K]) =>
      setEditing({ ...editing, [key]: value });

    return (
      <>
        <AdminHeader
          title={`Edit ${editing.name}`}
          lead="Banner copy, export note and the season calendar shown under the product grid."
        />

        <form
          className="grid max-w-3xl gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveCategory(editing);
            setEditing(null);
          }}
        >
          <div className="grid gap-2">
            <label htmlFor="cat-name" className="mono-label">
              Name
            </label>
            <input
              id="cat-name"
              className={FIELD}
              value={editing.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cat-desc" className="mono-label">
              Banner intro
            </label>
            <textarea
              id="cat-desc"
              rows={5}
              className={FIELD}
              value={editing.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cat-note" className="mono-label">
              Export note
            </label>
            <textarea
              id="cat-note"
              rows={5}
              className={FIELD}
              value={editing.export_note}
              onChange={(event) => set("export_note", event.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="cat-packing" className="mono-label">
              Typical packing
            </label>
            <textarea
              id="cat-packing"
              rows={3}
              className={FIELD}
              value={editing.packing_summary}
              onChange={(event) => set("packing_summary", event.target.value)}
            />
          </div>

          <fieldset className="grid gap-3">
            <legend className="mono-label mb-2">Season calendar</legend>
            <div className="contain-paint overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse text-left">
                <thead>
                  <tr>
                    <th scope="col" className="mono-label pb-2 font-normal">
                      Product
                    </th>
                    {monthLabels().map((month) => (
                      <th
                        key={month}
                        scope="col"
                        className="pb-2 text-center font-mono text-[0.625rem] font-normal text-slate-soft uppercase"
                      >
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {editing.season_calendar.map((row, rowIndex) => (
                    <tr key={row.item} className="border-t border-brass/20">
                      <th scope="row" className="py-2 pr-3 text-left text-[0.875rem] font-normal">
                        {row.item}
                      </th>
                      {row.months.map((available, monthIndex) => (
                        <td key={monthIndex} className="px-1 py-2 text-center">
                          <input
                            type="checkbox"
                            className="size-4 accent-brass"
                            checked={available}
                            aria-label={`${row.item} available in ${monthLabels()[monthIndex]}`}
                            onChange={(event) => {
                              const calendar = editing.season_calendar.map((entry, index) =>
                                index === rowIndex
                                  ? {
                                      ...entry,
                                      months: entry.months.map((month, position) =>
                                        position === monthIndex ? event.target.checked : month,
                                      ),
                                    }
                                  : entry,
                              );
                              set("season_calendar", calendar);
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-brass/25 pt-5">
            <Button type="submit" size="lg">
              Save category
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Categories"
        lead="Three verticals. Editing one changes its banner, its export note and the season calendar under its grid."
      />

      <ul className="grid gap-4 lg:grid-cols-3" role="list">
        {categories.map((category) => {
          const count = products.filter((product) => product.category_id === category.slug).length;

          return (
            <li key={category.id} className="rounded-crate border border-harbour/12 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[1.1875rem] leading-snug">{category.name}</h2>
                  <p className="mono-label mt-1.5">
                    /{category.slug} · {count} products
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  aria-label={`Edit ${category.name}`}
                  className="shrink-0 rounded-crate border border-harbour/15 p-2 text-slate hover:border-harbour/40"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <p className="mt-4 line-clamp-4 text-[0.875rem] leading-relaxed">
                {category.description}
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}

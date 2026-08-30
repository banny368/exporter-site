"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import {
  filterProducts,
  getCertifications,
  getSubCategories,
  sortProducts,
  type ProductFilters,
  type SortMode,
} from "@/lib/products";
import type { CategorySlug } from "@/lib/types";
import { monthLabels } from "@/lib/utils";
import { useMergedSummaries, useSiteSettings } from "@/components/providers/store-provider";
import type { ProductSummary } from "@/lib/products";

const SORTS: { value: SortMode; label: string }[] = [
  { value: "curated", label: "Our display order" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "recent", label: "Recently added" },
];

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-[0.9375rem]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 shrink-0 accent-brass"
      />
      <span>{label}</span>
    </label>
  );
}

function FilterFields({
  subCategories,
  certifications,
  packingTypes,
  filters,
  setFilters,
}: {
  subCategories: string[];
  certifications: string[];
  /** Editable in the admin panel rather than hardcoded. */
  packingTypes: string[];
  filters: ProductFilters;
  setFilters: (next: ProductFilters) => void;
}) {
  return (
    <div className="grid gap-8">
      <div>
        <label htmlFor="product-search" className="mono-label mb-3 block">
          Search
        </label>
        <input
          id="product-search"
          type="search"
          value={filters.search ?? ""}
          onChange={(event) => setFilters({ ...filters, search: event.target.value })}
          placeholder="Name, HS code or origin"
          className="w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2.5 text-[0.9375rem] placeholder:text-slate-soft focus-visible:border-brass"
        />
      </div>

      <fieldset>
        <legend className="mono-label mb-2">Sub-category</legend>
        {subCategories.map((value) => (
          <CheckboxRow
            key={value}
            label={value}
            checked={filters.subCategories?.includes(value) ?? false}
            onChange={() =>
              setFilters({
                ...filters,
                subCategories: toggle(filters.subCategories ?? [], value),
              })
            }
          />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mono-label mb-2">Certification</legend>
        {certifications.map((value) => (
          <CheckboxRow
            key={value}
            label={value}
            checked={filters.certifications?.includes(value) ?? false}
            onChange={() =>
              setFilters({
                ...filters,
                certifications: toggle(filters.certifications ?? [], value),
              })
            }
          />
        ))}
      </fieldset>

      <fieldset>
        <legend className="mono-label mb-3">Available in month</legend>
        <div className="grid grid-cols-4 gap-1.5">
          {monthLabels().map((label, index) => {
            const month = index + 1;
            const active = filters.months?.includes(month) ?? false;

            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setFilters({
                    ...filters,
                    months: active
                      ? (filters.months ?? []).filter((value) => value !== month)
                      : [...(filters.months ?? []), month],
                  })
                }
                className={`rounded-crate border px-1.5 py-2 font-mono text-[0.6875rem] tracking-[0.08em] uppercase transition-colors ${
                  active
                    ? "border-brass bg-brass/15 text-harbour"
                    : "border-harbour/15 text-slate hover:border-harbour/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mono-label mb-3">Packing type</legend>
        <div className="flex flex-wrap gap-2">
          {packingTypes.map((value) => {
            const active = filters.packing === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters({ ...filters, packing: active ? undefined : value })}
                className={`rounded-crate border px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors ${
                  active
                    ? "border-brass bg-brass/15 text-harbour"
                    : "border-harbour/15 text-slate hover:border-harbour/40"
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

export function ProductBrowser({
  seed,
  category,
  source,
}: {
  /** Trimmed summaries from the server component that renders this browser. */
  seed: ProductSummary[];
  category?: CategorySlug;
  source: string;
}) {
  const products = useMergedSummaries(seed);
  const packingTypes = useSiteSettings().packing_types ?? [];
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<SortMode>("curated");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scope = useMemo(
    () =>
      products.filter(
        (product) => product.is_published && (!category || product.category_id === category),
      ),
    [products, category],
  );

  const subCategories = useMemo(() => getSubCategories(scope), [scope]);
  const certifications = useMemo(() => getCertifications(scope), [scope]);
  const results = useMemo(
    () => sortProducts(filterProducts(scope, filters), sort),
    [scope, filters, sort],
  );

  const activeCount =
    (filters.subCategories?.length ?? 0) +
    (filters.certifications?.length ?? 0) +
    (filters.months?.length ?? 0) +
    (filters.packing ? 1 : 0) +
    (filters.search ? 1 : 0);

  const clear = () => setFilters({});

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
      <aside className="hidden lg:col-span-3 lg:block">
        <div className="sticky top-24">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-brass/30 pb-4">
            <h2 className="mono-label">Filter</h2>
            {activeCount > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="font-mono text-[0.6875rem] tracking-[0.1em] text-brass-ink uppercase underline underline-offset-4"
              >
                Clear {activeCount}
              </button>
            ) : null}
          </div>

          <FilterFields
            subCategories={subCategories}
            certifications={certifications}
            packingTypes={packingTypes}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </aside>

      <div className="lg:col-span-9">
        {/* The filter aside holds the only h2, and it is hidden below lg. Without this
            the heading order jumps from h1 to the h3 in each product card. */}
        <h2 className="sr-only">Products</h2>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-brass/30 pb-4">
          <p className="mono-label">
            {results.length} {results.length === 1 ? "product" : "products"}
          </p>

          <div className="flex items-center gap-3">
            <DialogPrimitive.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DialogPrimitive.Trigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                  Filter{activeCount > 0 ? ` (${activeCount})` : ""}
                </Button>
              </DialogPrimitive.Trigger>

              <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-harbour-deep/70" />
                <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-[min(22rem,88vw)] overflow-y-auto border-r border-brass/30 bg-paper focus:outline-none">
                  <div className="flex items-center justify-between border-b border-brass/25 px-5 py-4">
                    <DialogPrimitive.Title className="mono-label">Filter products</DialogPrimitive.Title>
                    <DialogPrimitive.Description className="sr-only">
                      Narrow the catalogue by sub-category, certification, availability month
                      and packing type.
                    </DialogPrimitive.Description>
                    <DialogPrimitive.Close className="rounded-crate p-2 text-slate hover:bg-harbour/5">
                      <X className="size-4" aria-hidden="true" />
                      <span className="sr-only">Close filters</span>
                    </DialogPrimitive.Close>
                  </div>

                  <div className="px-5 py-6">
                    <FilterFields
                      subCategories={subCategories}
                      certifications={certifications}
                      packingTypes={packingTypes}
                      filters={filters}
                      setFilters={setFilters}
                    />

                    <div className="mt-8 flex gap-3">
                      <Button variant="outline" size="sm" onClick={clear} className="flex-1">
                        Clear filters
                      </Button>
                      <Button size="sm" onClick={() => setDrawerOpen(false)} className="flex-1">
                        Show {results.length}
                      </Button>
                    </div>
                  </div>
                </DialogPrimitive.Content>
              </DialogPrimitive.Portal>
            </DialogPrimitive.Root>

            {/* sr-only rather than hidden: a display:none label does not name the
                select for assistive technology. */}
            <label htmlFor="sort" className="mono-label sr-only sm:not-sr-only sm:block">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="rounded-crate border border-harbour/20 bg-paper px-3 py-2 text-[0.875rem]"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {results.length === 0 ? (
          <div className="rounded-crate border border-dashed border-brass/40 px-6 py-16 text-center">
            <p className="font-display text-[1.25rem] text-harbour">
              No products match these filters
            </p>
            <p className="mx-auto mt-3 max-w-md text-[0.9375rem]">
              Clear the filters to see the full range, or send us the specification you need
              and we will tell you whether we can source it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button variant="outline" size="sm" onClick={clear}>
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" role="list">
            {results.map((product) => (
              <li key={product.id} className="flex">
                <ProductCard product={product} source={source} className="w-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

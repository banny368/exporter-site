"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { ProductEditor, emptyProduct } from "@/components/admin/product-editor";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/components/providers/store-provider";
import { getPrimaryImage } from "@/lib/products";
import { createId } from "@/lib/store-core";
import type { Product } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { withBase } from "@/lib/paths";

const FIELD =
  "rounded-crate border border-harbour/20 bg-paper px-3 py-2 text-[0.875rem] focus-visible:border-brass";

export default function AdminProductsPage() {
  const { products, categories, saveProduct, deleteProduct, hydrated } = useStore();

  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((product) => {
        if (category && product.category_id !== category) return false;
        if (status === "published" && !product.is_published) return false;
        if (status === "draft" && product.is_published) return false;
        if (term && !`${product.name} ${product.hs_code} ${product.origin}`.toLowerCase().includes(term)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }, [products, search, category, status]);

  if (editing) {
    return (
      <>
        <AdminHeader
          title={products.some((product) => product.id === editing.id) ? "Edit product" : "New product"}
          lead="Changes are saved to this browser and appear on the public site straight away."
        />
        <ProductEditor initial={editing} onDone={() => setEditing(null)} />
      </>
    );
  }

  function move(product: Product, direction: -1 | 1) {
    const ordered = [...products].sort((a, b) => a.sort_order - b.sort_order);
    const index = ordered.findIndex((item) => item.id === product.id);
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;

    // Swap the two sort_order values so the change is one field on two records.
    saveProduct({ ...product, sort_order: ordered[target].sort_order });
    saveProduct({ ...ordered[target], sort_order: product.sort_order });
  }

  function duplicate(product: Product) {
    saveProduct({
      ...product,
      id: createId("prd"),
      name: `${product.name} (copy)`,
      slug: `${product.slug}-copy`,
      is_published: false,
      is_featured: false,
      sort_order: product.sort_order + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  function bulk(action: "publish" | "unpublish" | "delete") {
    for (const id of selected) {
      const product = products.find((item) => item.id === id);
      if (!product) continue;
      if (action === "delete") deleteProduct(id);
      else saveProduct({ ...product, is_published: action === "publish" });
    }
    setSelected([]);
  }

  const allShownSelected = rows.length > 0 && rows.every((row) => selected.includes(row.id));

  return (
    <>
      <AdminHeader
        title="Products"
        lead="The screen the client will actually live in. Add, edit, reorder, duplicate and publish, without touching code."
        action={
          <Button onClick={() => setEditing(emptyProduct(categories[0]?.slug ?? "fresh-produce"))}>
            <Plus className="size-4" aria-hidden="true" />
            Add product
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <label htmlFor="admin-product-search" className="sr-only">
          Search products
        </label>
        <input
          id="admin-product-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, HS code or origin"
          className={`${FIELD} min-w-56 flex-1`}
        />

        <label htmlFor="admin-product-category" className="sr-only">
          Filter by category
        </label>
        <select
          id="admin-product-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={FIELD}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="admin-product-status" className="sr-only">
          Filter by status
        </label>
        <select
          id="admin-product-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className={FIELD}
        >
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {selected.length > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-crate border border-brass/40 bg-brass/10 px-4 py-3">
          <span className="mono-label">{selected.length} selected</span>
          <Button variant="outline" size="sm" onClick={() => bulk("publish")}>
            Publish
          </Button>
          <Button variant="outline" size="sm" onClick={() => bulk("unpublish")}>
            Unpublish
          </Button>
          <Button variant="outline" size="sm" onClick={() => bulk("delete")}>
            Delete
          </Button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="mono-label underline underline-offset-4"
          >
            Clear selection
          </button>
        </div>
      ) : null}

      <div className="contain-paint overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-brass/30">
              <th scope="col" className="w-10 pb-3">
                <input
                  type="checkbox"
                  className="size-4 accent-brass"
                  checked={allShownSelected}
                  aria-label="Select all shown products"
                  onChange={(event) =>
                    setSelected(event.target.checked ? rows.map((row) => row.id) : [])
                  }
                />
              </th>
              <th scope="col" className="mono-label pb-3 font-normal">
                Product
              </th>
              <th scope="col" className="mono-label pb-3 font-normal">
                Category
              </th>
              <th scope="col" className="mono-label pb-3 font-normal">
                Status
              </th>
              <th scope="col" className="mono-label pb-3 font-normal">
                Updated
              </th>
              <th scope="col" className="mono-label pb-3 text-right font-normal">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((product) => {
              const image = getPrimaryImage(product);
              const categoryName =
                categories.find((item) => item.slug === product.category_id)?.name ?? product.category_id;

              return (
                <tr key={product.id} className="border-b border-brass/15">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      className="size-4 accent-brass"
                      checked={selected.includes(product.id)}
                      aria-label={`Select ${product.name}`}
                      onChange={(event) =>
                        setSelected((previous) =>
                          event.target.checked
                            ? [...previous, product.id]
                            : previous.filter((id) => id !== product.id),
                        )
                      }
                    />
                  </td>

                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-crate bg-harbour/5">
                        {image ? (
                          <Image src={withBase(image.url)} alt="" fill sizes="44px" unoptimized className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[0.9375rem] text-harbour">{product.name}</p>
                        <p className="mono-label mt-1">HS {product.hs_code}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 pr-4 text-[0.875rem]">{categoryName}</td>

                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Chip tone={product.is_published ? "brass" : "muted"}>
                        {product.is_published ? "Published" : "Draft"}
                      </Chip>
                      <button
                        type="button"
                        onClick={() => saveProduct({ ...product, is_featured: !product.is_featured })}
                        aria-pressed={product.is_featured}
                        aria-label={`${product.is_featured ? "Remove" : "Add"} ${product.name} ${
                          product.is_featured ? "from" : "to"
                        } the featured row`}
                        className={`rounded-crate border p-1.5 ${
                          product.is_featured
                            ? "border-brass bg-brass/15 text-brass-ink"
                            : "border-harbour/15 text-slate-soft"
                        }`}
                      >
                        <Star className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>

                  <td className="mono-label py-3 pr-4">{formatDate(product.updated_at)}</td>

                  <td className="py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => move(product, -1)}
                        aria-label={`Move ${product.name} earlier`}
                        className="rounded-crate border border-harbour/15 p-2 text-slate hover:border-harbour/40"
                      >
                        <ChevronUp className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(product, 1)}
                        aria-label={`Move ${product.name} later`}
                        className="rounded-crate border border-harbour/15 p-2 text-slate hover:border-harbour/40"
                      >
                        <ChevronDown className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicate(product)}
                        aria-label={`Duplicate ${product.name}`}
                        className="rounded-crate border border-harbour/15 p-2 text-slate hover:border-harbour/40"
                      >
                        <Copy className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(product)}
                        aria-label={`Edit ${product.name}`}
                        className="rounded-crate border border-harbour/15 p-2 text-slate hover:border-harbour/40"
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        className="rounded-crate border border-harbour/15 p-2 text-slate hover:border-harbour/40"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {hydrated && rows.length === 0 ? (
        <p className="mt-8 rounded-crate border border-dashed border-brass/40 px-6 py-12 text-center text-[0.9375rem]">
          No products match these filters. Clear the search and filters to see the full
          catalogue.
        </p>
      ) : null}

      <Dialog open={Boolean(confirmDelete)} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent
          title="Delete product"
          description="The product is removed from the public catalogue in this browser. Resetting to seed data brings it back."
        >
          <p className="text-[0.9375rem] leading-relaxed">
            Delete <strong>{confirmDelete?.name}</strong>?
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                if (confirmDelete) deleteProduct(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete product
            </Button>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Keep it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

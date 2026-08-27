"use client";

import Image from "next/image";
import { useState } from "react";
import { GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { ShippingSpecCard } from "@/components/product/shipping-spec-card";
import { ContainerLoadability } from "@/components/product/container-loadability";
import { useStore } from "@/components/providers/store-provider";
import { fileToStoredImage, putMedia } from "@/lib/store";
import { createId } from "@/lib/store-core";
import type { CategorySlug, Product, ProductImage } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { withBase } from "@/lib/paths";

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2.5 text-[0.9375rem] " +
  "placeholder:text-slate-soft focus-visible:border-brass";

const CERTIFICATIONS = [
  "APEDA",
  "FSSAI",
  "Spices Board",
  "ISO 22000",
  "HACCP",
  "GLOBALG.A.P.",
  "GRASP",
  "Halal",
  "Kosher",
  "Phytosanitary",
  "Fumigation",
  "ISPM-15",
  "Non-GMO",
  "Organic (NPOP/NOP)",
  "FSC (on request)",
  "Legal Timber Declaration",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A blank product, pre-seeded with the standard export terms so nobody retypes them. */
export function emptyProduct(category: CategorySlug): Product {
  const now = new Date().toISOString();
  return {
    id: createId("prd"),
    name: "",
    slug: "",
    category_id: category,
    sub_category: "",
    short_description: "",
    long_description: [""],
    hs_code: "",
    variety: "",
    origin: "",
    season: "",
    season_months: [],
    packing: "",
    moq: "",
    shelf_life: "",
    storage_temp: "",
    lead_time: "",
    payment_terms: "LC at sight, or 30% TT advance with balance against B/L copy",
    incoterms: "EXW · FOB · CFR · CIF",
    loading_ports: [],
    loadability: { "20ft": "", "40ft": "", "40ft_hq": "", reefer: "" },
    specs: [],
    quality_params: [],
    certifications: [],
    markets: [],
    packing_note: "",
    documents: [],
    is_featured: false,
    is_published: false,
    sort_order: 99,
    meta_title: "",
    meta_description: "",
    og_image: "/og/default.png",
    images: [],
    created_at: now,
    updated_at: now,
  };
}

/**
 * Wraps the control in a label so it is announced properly. `plain` opts out for the
 * rows whose content is a group of controls rather than one field — wrapping several
 * inputs in one label associates the name with the wrong control.
 */
function Row({
  label,
  children,
  hint,
  plain = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  plain?: boolean;
}) {
  const Wrapper = plain ? "div" : "label";

  return (
    <Wrapper className="grid gap-2">
      <span className="mono-label">{label}</span>
      {children}
      {hint ? <span className="text-[0.8125rem] text-slate-soft">{hint}</span> : null}
    </Wrapper>
  );
}

export function ProductEditor({ initial, onDone }: { initial: Product; onDone: () => void }) {
  const { categories, saveProduct } = useStore();
  const [draft, setDraft] = useState<Product>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.slug));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));

  function setName(name: string) {
    setDraft((previous) => ({
      ...previous,
      name,
      slug: slugTouched ? previous.slug : slugify(name),
    }));
  }

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setUploadError("");

    try {
      const added: ProductImage[] = [];
      for (const file of Array.from(files)) {
        const record = await fileToStoredImage(file);
        await putMedia(record);
        added.push({
          id: record.id,
          product_id: draft.id,
          url: record.dataUrl,
          alt_text: file.name.replace(/\.[^.]+$/, ""),
          sort_order: draft.images.length + added.length + 1,
          is_primary: draft.images.length === 0 && added.length === 0,
          shot: "hero",
        });
      }
      set("images", [...draft.images, ...added]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "That upload did not work.");
    } finally {
      setUploading(false);
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const next = [...draft.images];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    set(
      "images",
      next.map((image, position) => ({
        ...image,
        sort_order: position + 1,
        is_primary: position === 0,
      })),
    );
  }

  const canSave = Boolean(draft.name.trim() && draft.slug.trim() && draft.hs_code.trim());

  return (
    <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
      <form
        className="grid gap-8 xl:col-span-7"
        onSubmit={(event) => {
          event.preventDefault();
          if (!canSave) return;
          saveProduct(draft);
          onDone();
        }}
      >
        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Basics</h2>

          <Row label="Product name">
            <input className={FIELD} value={draft.name} onChange={(e) => setName(e.target.value)} required />
          </Row>

          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Slug" hint="Used in the URL. Change it only before the page has been shared.">
              <input
                className={FIELD}
                value={draft.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                required
              />
            </Row>

            <Row label="Category">
              <select
                className={FIELD}
                value={draft.category_id}
                onChange={(e) => set("category_id", e.target.value as CategorySlug)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Row>

            <Row label="Sub-category" hint="Drives the filter rail on the category page.">
              <input
                className={FIELD}
                value={draft.sub_category}
                onChange={(e) => set("sub_category", e.target.value)}
              />
            </Row>

            <Row label="HS code" hint="Format 0000.00.00, as it appears on your shipping bill.">
              <input
                className={FIELD}
                value={draft.hs_code}
                onChange={(e) => set("hs_code", e.target.value)}
                required
              />
            </Row>
          </div>

          <Row
            label="Short description"
            hint={`Card text. ${draft.short_description.length} characters — aim for about 160.`}
          >
            <textarea
              className={FIELD}
              rows={3}
              value={draft.short_description}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </Row>

          <Row label="Full description" hint="One box per paragraph on the product page." plain>
            <div className="grid gap-3">
              {draft.long_description.map((paragraph, index) => (
                <div key={index} className="flex gap-2">
                  <textarea
                    className={FIELD}
                    rows={4}
                    value={paragraph}
                    onChange={(e) => {
                      const next = [...draft.long_description];
                      next[index] = e.target.value;
                      set("long_description", next);
                    }}
                  />
                  <button
                    type="button"
                    aria-label={`Remove paragraph ${index + 1}`}
                    onClick={() =>
                      set(
                        "long_description",
                        draft.long_description.filter((_, i) => i !== index),
                      )
                    }
                    className="h-10 shrink-0 rounded-crate border border-harbour/20 px-2.5 text-slate hover:border-harbour/50"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-self-start"
                onClick={() => set("long_description", [...draft.long_description, ""])}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add paragraph
              </Button>
            </div>
          </Row>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Export specification</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Grade / variety">
              <input className={FIELD} value={draft.variety} onChange={(e) => set("variety", e.target.value)} />
            </Row>
            <Row label="Origin cluster">
              <input className={FIELD} value={draft.origin} onChange={(e) => set("origin", e.target.value)} />
            </Row>
            <Row label="Season">
              <input className={FIELD} value={draft.season} onChange={(e) => set("season", e.target.value)} />
            </Row>
            <Row label="Packing">
              <input className={FIELD} value={draft.packing} onChange={(e) => set("packing", e.target.value)} />
            </Row>
            <Row label="MOQ">
              <input className={FIELD} value={draft.moq} onChange={(e) => set("moq", e.target.value)} />
            </Row>
            <Row label="Shelf life">
              <input className={FIELD} value={draft.shelf_life} onChange={(e) => set("shelf_life", e.target.value)} />
            </Row>
            <Row label="Storage">
              <input className={FIELD} value={draft.storage_temp} onChange={(e) => set("storage_temp", e.target.value)} />
            </Row>
            <Row label="Lead time">
              <input className={FIELD} value={draft.lead_time} onChange={(e) => set("lead_time", e.target.value)} />
            </Row>
            <Row label="Payment terms">
              <input className={FIELD} value={draft.payment_terms} onChange={(e) => set("payment_terms", e.target.value)} />
            </Row>
            <Row label="Incoterms">
              <input className={FIELD} value={draft.incoterms} onChange={(e) => set("incoterms", e.target.value)} />
            </Row>
          </div>

          <Row label="Loading ports" hint="Separate with a comma.">
            <input
              className={FIELD}
              value={draft.loading_ports.join(", ")}
              onChange={(e) =>
                set(
                  "loading_ports",
                  e.target.value
                    .split(",")
                    .map((port) => port.trim())
                    .filter(Boolean),
                )
              }
            />
          </Row>

          <Row label="Shipping months" hint="Drives the availability filter and the season calendar." plain>
            <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
              {MONTHS.map((month, index) => {
                const value = index + 1;
                const active = draft.season_months.includes(value);

                return (
                  <button
                    key={month}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      set(
                        "season_months",
                        active
                          ? draft.season_months.filter((m) => m !== value)
                          : [...draft.season_months, value].sort((a, b) => a - b),
                      )
                    }
                    className={`rounded-crate border px-1 py-2 font-mono text-[0.625rem] uppercase ${
                      active ? "border-brass bg-brass/15 text-harbour" : "border-harbour/15 text-slate"
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>
          </Row>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Container loadability</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {(["20ft", "40ft", "40ft_hq", "reefer"] as const).map((key) => (
              <Row key={key} label={key.replace("_", " ").toUpperCase()}>
                <input
                  className={FIELD}
                  value={draft.loadability[key]}
                  placeholder="18 MT · 720 bags"
                  onChange={(e) => set("loadability", { ...draft.loadability, [key]: e.target.value })}
                />
              </Row>
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Additional specification rows</h2>
          <p className="text-[0.8125rem] leading-relaxed text-slate-soft">
            Anything added here is appended to the shipping specification card, so a new
            field does not need a developer.
          </p>

          <div className="grid gap-3">
            {draft.specs.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <input
                  className={FIELD}
                  placeholder="Label"
                  value={spec.label}
                  onChange={(e) => {
                    const next = [...draft.specs];
                    next[index] = { ...spec, label: e.target.value };
                    set("specs", next);
                  }}
                />
                <input
                  className={FIELD}
                  placeholder="Value"
                  value={spec.value}
                  onChange={(e) => {
                    const next = [...draft.specs];
                    next[index] = { ...spec, value: e.target.value };
                    set("specs", next);
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove specification row ${index + 1}`}
                  onClick={() => set("specs", draft.specs.filter((_, i) => i !== index))}
                  className="shrink-0 rounded-crate border border-harbour/20 px-2.5 text-slate hover:border-harbour/50"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => set("specs", [...draft.specs, { label: "", value: "" }])}
            >
              <Plus className="size-4" aria-hidden="true" />
              Add specification row
            </Button>
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Quality parameters</h2>
          <div className="grid gap-3">
            {draft.quality_params.map((param, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  className={FIELD}
                  placeholder="Parameter"
                  value={param.parameter}
                  onChange={(e) => {
                    const next = [...draft.quality_params];
                    next[index] = { ...param, parameter: e.target.value };
                    set("quality_params", next);
                  }}
                />
                <input
                  className={FIELD}
                  placeholder="Specification"
                  value={param.specification}
                  onChange={(e) => {
                    const next = [...draft.quality_params];
                    next[index] = { ...param, specification: e.target.value };
                    set("quality_params", next);
                  }}
                />
                <input
                  className={FIELD}
                  placeholder="Method"
                  value={param.method ?? ""}
                  onChange={(e) => {
                    const next = [...draft.quality_params];
                    next[index] = { ...param, method: e.target.value };
                    set("quality_params", next);
                  }}
                />
                <button
                  type="button"
                  aria-label={`Remove quality parameter ${index + 1}`}
                  onClick={() =>
                    set("quality_params", draft.quality_params.filter((_, i) => i !== index))
                  }
                  className="shrink-0 rounded-crate border border-harbour/20 px-2.5 text-slate hover:border-harbour/50"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() =>
                set("quality_params", [
                  ...draft.quality_params,
                  { parameter: "", specification: "", method: "" },
                ])
              }
            >
              <Plus className="size-4" aria-hidden="true" />
              Add quality parameter
            </Button>
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Images</h2>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-crate border border-dashed border-brass/45 px-6 py-10 text-center">
            <Upload className="size-5 text-brass-ink" aria-hidden="true" />
            <span className="text-[0.9375rem]">
              {uploading ? "Processing…" : "Choose images to upload"}
            </span>
            <span className="mono-label normal-case tracking-[0.04em]">
              Resized to 1600px and stored as WebP in this browser
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>

          {uploadError ? (
            <p role="alert" className="text-[0.8125rem] text-[#9B2C1B]">
              {uploadError}
            </p>
          ) : null}

          {draft.images.length > 0 ? (
            <ul className="grid gap-3" role="list">
              {draft.images.map((image, index) => (
                <li
                  key={image.id}
                  className="flex items-center gap-3 rounded-crate border border-harbour/12 p-3"
                >
                  <GripVertical className="size-4 shrink-0 text-slate-soft" aria-hidden="true" />

                  <div className="relative size-16 shrink-0 overflow-hidden rounded-crate bg-harbour/5">
                    <Image src={withBase(image.url)} alt="" fill sizes="64px" unoptimized className="object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <input
                      className={FIELD}
                      placeholder="Alt text, describing the image"
                      value={image.alt_text}
                      onChange={(e) => {
                        const next = [...draft.images];
                        next[index] = { ...image, alt_text: e.target.value };
                        set("images", next);
                      }}
                    />
                    {index === 0 ? (
                      <Chip tone="brass" className="mt-2">
                        Main image
                      </Chip>
                    ) : null}
                  </div>

                  <div className="grid shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label={`Move image ${index + 1} up`}
                      onClick={() => moveImage(index, -1)}
                      className="rounded-crate border border-harbour/20 px-2 py-1 text-[0.75rem]"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move image ${index + 1} down`}
                      onClick={() => moveImage(index, 1)}
                      className="rounded-crate border border-harbour/20 px-2 py-1 text-[0.75rem]"
                    >
                      ↓
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => set("images", draft.images.filter((_, i) => i !== index))}
                    className="shrink-0 rounded-crate border border-harbour/20 px-2.5 py-2 text-slate hover:border-harbour/50"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Certifications</h2>
          <div className="flex flex-wrap gap-2">
            {CERTIFICATIONS.map((certification) => {
              const active = draft.certifications.includes(certification);

              return (
                <button
                  key={certification}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    set(
                      "certifications",
                      active
                        ? draft.certifications.filter((c) => c !== certification)
                        : [...draft.certifications, certification],
                    )
                  }
                  className={`rounded-crate border px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase ${
                    active ? "border-brass bg-brass/15 text-harbour" : "border-harbour/15 text-slate"
                  }`}
                >
                  {certification}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Publishing and SEO</h2>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 text-[0.9375rem]">
              <input
                type="checkbox"
                className="size-4 accent-brass"
                checked={draft.is_published}
                onChange={(e) => set("is_published", e.target.checked)}
              />
              Published
            </label>
            <label className="flex items-center gap-2.5 text-[0.9375rem]">
              <input
                type="checkbox"
                className="size-4 accent-brass"
                checked={draft.is_featured}
                onChange={(e) => set("is_featured", e.target.checked)}
              />
              Featured on the home page
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Row label="Display order" hint="Lower numbers come first.">
              <input
                type="number"
                className={FIELD}
                value={draft.sort_order}
                onChange={(e) => set("sort_order", Number(e.target.value))}
              />
            </Row>
            <Row label="Meta title">
              <input className={FIELD} value={draft.meta_title} onChange={(e) => set("meta_title", e.target.value)} />
            </Row>
          </div>

          <Row
            label="Meta description"
            hint={`${draft.meta_description.length} characters — search engines show about 155.`}
          >
            <textarea
              className={FIELD}
              rows={3}
              value={draft.meta_description}
              onChange={(e) => set("meta_description", e.target.value)}
            />
          </Row>
        </section>

        <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-brass/25 bg-paper py-4">
          <Button type="submit" size="lg" disabled={!canSave}>
            Save product
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={onDone}>
            Cancel
          </Button>
          {canSave ? (
            <p className="max-w-md self-center text-[0.8125rem] leading-relaxed text-slate-soft">
              A new product appears in the catalogue and filters straight away. Its own
              detail page is generated at build time, so it arrives on the next deploy.
            </p>
          ) : (
            <p className="self-center text-[0.8125rem] text-slate-soft">
              Name, slug and HS code are needed before this can be saved.
            </p>
          )}
        </div>
      </form>

      <aside className="xl:col-span-5">
        <div className="sticky top-6 grid gap-5">
          <h2 className="mono-label border-b border-brass/25 pb-3">Live preview</h2>
          <p className="text-[0.8125rem] leading-relaxed text-slate-soft">
            Exactly how the specification card and loadability strip will render on the
            public product page.
          </p>
          <ShippingSpecCard product={draft} />
          <ContainerLoadability loadability={draft.loadability} />
        </div>
      </aside>
    </div>
  );
}

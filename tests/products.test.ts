import { describe, expect, it } from "vitest";
import {
  filterProducts,
  getAllProducts,
  getCategories,
  getCategoryBySlug,
  getFeaturedProducts,
  getPrimaryImage,
  getProductBySlug,
  getProducts,
  getProductsByCategory,
  getRelatedProducts,
  sortProducts,
  toProductSummaries,
  toProductSummary,
} from "@/lib/products";

describe("seed catalogue", () => {
  it("carries all sixteen products across three categories", () => {
    expect(getAllProducts()).toHaveLength(16);
    expect(getCategories()).toHaveLength(3);
  });

  it("splits five fresh, six dehydrated and five furniture", () => {
    expect(getProductsByCategory("fresh-produce")).toHaveLength(5);
    expect(getProductsByCategory("dehydrated")).toHaveLength(6);
    expect(getProductsByCategory("furniture")).toHaveLength(5);
  });

  it("gives every product a unique slug and id", () => {
    const products = getAllProducts();
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  it("gives every product the export fields a buyer scans for", () => {
    for (const product of getAllProducts()) {
      expect(product.hs_code, product.slug).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
      expect(product.moq, product.slug).not.toBe("");
      expect(product.origin, product.slug).not.toBe("");
      expect(product.packing, product.slug).not.toBe("");
      expect(product.incoterms, product.slug).toContain("FOB");
      expect(product.loading_ports.length, product.slug).toBeGreaterThan(0);
      expect(product.long_description.length, product.slug).toBeGreaterThanOrEqual(3);
      expect(product.quality_params.length, product.slug).toBeGreaterThanOrEqual(4);
      expect(product.documents.length, product.slug).toBeGreaterThanOrEqual(6);
    }
  });

  it("gives every product four images with exactly one primary", () => {
    for (const product of getAllProducts()) {
      expect(product.images, product.slug).toHaveLength(4);
      expect(product.images.filter((i) => i.is_primary), product.slug).toHaveLength(1);
      for (const image of product.images) {
        expect(image.alt_text, `${product.slug} ${image.shot}`).not.toBe("");
      }
    }
  });

  it("fills all four loadability tiles so the strip never renders a gap", () => {
    for (const product of getAllProducts()) {
      const { "20ft": twenty, "40ft": forty, "40ft_hq": hq, reefer } = product.loadability;
      for (const value of [twenty, forty, hq, reefer]) {
        expect(value, product.slug).not.toBe("");
      }
    }
  });

  it("points every product at a category that exists", () => {
    const slugs = new Set(getCategories().map((c) => c.slug));
    for (const product of getAllProducts()) {
      expect(slugs.has(product.category_id), product.slug).toBe(true);
    }
  });

  it("gives every category a twelve-month calendar row per product", () => {
    for (const category of getCategories()) {
      const count = getProductsByCategory(category.slug).length;
      expect(category.season_calendar, category.slug).toHaveLength(count);
      for (const row of category.season_calendar) {
        expect(row.months, `${category.slug} ${row.item}`).toHaveLength(12);
      }
    }
  });
});

describe("lookups", () => {
  it("finds a product by slug", () => {
    expect(getProductBySlug("alphonso-mango")?.hs_code).toBe("0804.50.20");
  });

  it("returns undefined for an unknown slug rather than throwing", () => {
    expect(getProductBySlug("no-such-product")).toBeUndefined();
  });

  it("finds a category by slug", () => {
    expect(getCategoryBySlug("dehydrated")?.name).toBe("Dehydrated Products & Spices");
  });

  it("returns only published products from getProducts", () => {
    expect(getProducts().every((p) => p.is_published)).toBe(true);
  });

  it("returns featured products capped at the requested limit", () => {
    const featured = getFeaturedProducts(4);
    expect(featured).toHaveLength(4);
    expect(featured.every((p) => p.is_featured)).toBe(true);
  });
});

describe("getRelatedProducts", () => {
  it("returns same-category products and never the product itself", () => {
    const mango = getProductBySlug("alphonso-mango")!;
    const related = getRelatedProducts(mango, 4);
    expect(related).toHaveLength(4);
    expect(related.every((p) => p.category_id === "fresh-produce")).toBe(true);
    expect(related.some((p) => p.slug === "alphonso-mango")).toBe(false);
  });

  it("tops up from other categories when the category is too small", () => {
    const mango = getProductBySlug("alphonso-mango")!;
    // Fresh produce holds five products, so four siblings exist but six do not.
    expect(getRelatedProducts(mango, 6)).toHaveLength(6);
  });
});

describe("filterProducts", () => {
  const all = getAllProducts();

  it("returns everything when no filter is set", () => {
    expect(filterProducts(all, {})).toHaveLength(all.length);
  });

  it("filters by sub-category", () => {
    const result = filterProducts(all, { subCategories: ["Mango"] });
    expect(result.map((p) => p.slug)).toEqual(["alphonso-mango"]);
  });

  it("filters by certification", () => {
    const result = filterProducts(all, { certifications: ["GLOBALG.A.P."] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.certifications.includes("GLOBALG.A.P."))).toBe(true);
  });

  it("filters by availability month", () => {
    // Grapes ship January to April, so they are absent from a July requirement.
    const july = filterProducts(all, { months: [7] });
    expect(july.some((p) => p.slug === "thompson-seedless-grapes")).toBe(false);
    expect(july.some((p) => p.slug === "cavendish-banana")).toBe(true);
  });

  it("matches a search term against name, variety, HS code and origin", () => {
    expect(filterProducts(all, { search: "0910.30.20" }).map((p) => p.slug)).toEqual([
      "dried-turmeric-fingers",
    ]);
    expect(filterProducts(all, { search: "jodhpur" }).length).toBeGreaterThan(2);
    expect(filterProducts(all, { search: "HAPUS" }).map((p) => p.slug)).toEqual([
      "alphonso-mango",
    ]);
  });

  it("combines filters as AND, not OR", () => {
    const result = filterProducts(all, {
      certifications: ["ISPM-15"],
      search: "mango",
    });
    expect(result.map((p) => p.slug)).toEqual(["mango-wood-coffee-table"]);
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterProducts(all, { search: "zzzz" })).toEqual([]);
  });

  it("does not mutate the array it was given", () => {
    const input = getAllProducts();
    const before = input.map((p) => p.slug);
    filterProducts(input, { search: "mango" });
    expect(input.map((p) => p.slug)).toEqual(before);
  });
});

describe("sortProducts", () => {
  const all = getAllProducts();

  it("sorts A to Z by name", () => {
    const names = sortProducts(all, "name-asc").map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });

  it("sorts Z to A by name", () => {
    const names = sortProducts(all, "name-desc").map((p) => p.name);
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  it("sorts most recently added first", () => {
    const dates = sortProducts(all, "recent").map((p) => Date.parse(p.created_at));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("falls back to the curated display order", () => {
    const orders = sortProducts(all, "curated").map((p) => p.sort_order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
  });

  it("does not mutate the array it was given", () => {
    const input = getAllProducts();
    const before = input.map((p) => p.slug);
    sortProducts(input, "name-desc");
    expect(input.map((p) => p.slug)).toEqual(before);
  });
});

describe("getPrimaryImage", () => {
  it("returns the image flagged primary", () => {
    const mango = getProductBySlug("alphonso-mango")!;
    expect(getPrimaryImage(mango).is_primary).toBe(true);
  });

  it("falls back to the first image when none is flagged", () => {
    const mango = getProductBySlug("alphonso-mango")!;
    const unflagged = {
      ...mango,
      images: mango.images.map((image) => ({ ...image, is_primary: false })),
    };
    expect(getPrimaryImage(unflagged).id).toBe(mango.images[0].id);
  });

  it("returns a placeholder rather than undefined for a product with no images", () => {
    // A product created in the admin panel starts with none. Returning undefined here
    // crashed every card, gallery and table the moment it was published.
    const mango = getProductBySlug("alphonso-mango")!;
    const image = getPrimaryImage({ ...mango, images: [] });

    expect(image).toBeDefined();
    expect(image.url).toBe("/site/no-image.svg");
    expect(image.alt_text).not.toBe("");
  });
});

describe("toProductSummary", () => {
  const full = getProductBySlug("alphonso-mango")!;
  const summary = toProductSummary(full);

  it("keeps every field a card, a filter or the RFQ list reads", () => {
    for (const key of [
      "id",
      "name",
      "slug",
      "category_id",
      "sub_category",
      "variety",
      "origin",
      "hs_code",
      "short_description",
      "moq",
      "season",
      "season_months",
      "packing",
      "certifications",
      "is_featured",
      "is_published",
      "sort_order",
      "created_at",
    ] as const) {
      expect(summary[key], key).toEqual(full[key]);
    }
  });

  it("carries exactly one image — the primary", () => {
    expect(summary.image).toEqual(getPrimaryImage(full));
  });

  it("drops the heavy fields that never reach a card", () => {
    for (const key of [
      "long_description",
      "specs",
      "quality_params",
      "documents",
      "loadability",
      "images",
      "meta_description",
      "packing_note",
    ]) {
      expect(key in summary, key).toBe(false);
    }
  });

  it("is materially smaller than the full record", () => {
    const fullBytes = JSON.stringify(full).length;
    const summaryBytes = JSON.stringify(summary).length;
    // The whole point of the type. Guards against someone widening it back out.
    expect(summaryBytes).toBeLessThan(fullBytes * 0.45);
  });

  it("summarises the whole catalogue without losing a product", () => {
    const all = getAllProducts();
    const summaries = toProductSummaries(all);
    expect(summaries).toHaveLength(all.length);
    expect(summaries.map((s) => s.slug)).toEqual(all.map((p) => p.slug));
  });
});

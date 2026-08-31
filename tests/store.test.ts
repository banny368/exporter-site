import { describe, expect, it } from "vitest";
import {
  addRfqItem,
  emptyStore,
  inquiriesToCsv,
  mergeCategories,
  mergeOneById,
  mergeProducts,
  mergeSettings,
  removeRfqItem,
  setRfqQuantity,
} from "@/lib/store-core";
import { getAllProducts, getCategories } from "@/lib/products";
import { site } from "@/lib/site";
import type { Inquiry, Product } from "@/lib/types";

const seed = getAllProducts();

function draftProduct(overrides: Partial<Product> = {}): Product {
  return { ...seed[0], id: "prd-new", slug: "new-product", name: "New Product", ...overrides };
}

describe("mergeProducts", () => {
  it("returns the seed catalogue untouched when nothing is stored", () => {
    expect(mergeProducts(seed, emptyStore())).toHaveLength(seed.length);
  });

  it("replaces a seed product with the admin's edited version", () => {
    const edited = { ...seed[0], name: "Alphonso Mango — Devgad Select" };
    const merged = mergeProducts(seed, { ...emptyStore(), products: [edited] });

    expect(merged).toHaveLength(seed.length);
    expect(merged.find((p) => p.id === seed[0].id)?.name).toBe("Alphonso Mango — Devgad Select");
  });

  it("appends a product the admin created", () => {
    const merged = mergeProducts(seed, { ...emptyStore(), products: [draftProduct()] });

    expect(merged).toHaveLength(seed.length + 1);
    expect(merged.some((p) => p.slug === "new-product")).toBe(true);
  });

  it("removes a deleted product", () => {
    const merged = mergeProducts(seed, {
      ...emptyStore(),
      deletedProductIds: [seed[0].id],
    });

    expect(merged).toHaveLength(seed.length - 1);
    expect(merged.some((p) => p.id === seed[0].id)).toBe(false);
  });

  it("lets a deletion win over a stale edit of the same product", () => {
    const merged = mergeProducts(seed, {
      ...emptyStore(),
      products: [{ ...seed[0], name: "Edited then deleted" }],
      deletedProductIds: [seed[0].id],
    });

    expect(merged.some((p) => p.id === seed[0].id)).toBe(false);
  });

  it("returns products in display order", () => {
    const merged = mergeProducts(seed, {
      ...emptyStore(),
      products: [draftProduct({ sort_order: 0 })],
    });

    expect(merged[0].slug).toBe("new-product");
    expect(merged.map((p) => p.sort_order)).toEqual(
      [...merged.map((p) => p.sort_order)].sort((a, b) => a - b),
    );
  });

  it("does not mutate the seed catalogue", () => {
    const before = seed.map((p) => p.name);
    mergeProducts(seed, {
      ...emptyStore(),
      products: [{ ...seed[0], name: "Mutated" }],
      deletedProductIds: [seed[1].id],
    });
    expect(getAllProducts().map((p) => p.name)).toEqual(before);
  });
});

describe("mergeCategories and mergeSettings", () => {
  it("passes seed categories through when nothing is stored", () => {
    expect(mergeCategories(getCategories(), emptyStore())).toHaveLength(3);
  });

  it("replaces an edited category", () => {
    const edited = { ...getCategories()[0], name: "Fresh Produce" };
    const merged = mergeCategories(getCategories(), { ...emptyStore(), categories: [edited] });
    expect(merged.find((c) => c.id === edited.id)?.name).toBe("Fresh Produce");
  });

  it("deep merges settings so an edit to one field keeps the rest", () => {
    const merged = mergeSettings(site, {
      ...emptyStore(),
      settings: { company: { ...site.company, name: "Acme Exports LLP" } },
    });

    expect(merged.company.name).toBe("Acme Exports LLP");
    expect(merged.company.tagline).toBe(site.company.tagline);
    expect(merged.contact.email).toBe(site.contact.email);
    expect(merged.ports).toHaveLength(site.ports.length);
  });
});

describe("RFQ list", () => {
  it("adds an item", () => {
    const rfq = addRfqItem([], "prd-alphonso-mango", "1 x 20ft reefer");
    expect(rfq).toEqual([{ product_id: "prd-alphonso-mango", quantity: "1 x 20ft reefer" }]);
  });

  it("does not add the same product twice", () => {
    const once = addRfqItem([], "prd-alphonso-mango");
    const twice = addRfqItem(once, "prd-alphonso-mango");
    expect(twice).toHaveLength(1);
  });

  it("keeps an existing quantity when the product is added again", () => {
    const once = addRfqItem([], "prd-alphonso-mango", "10 MT");
    expect(addRfqItem(once, "prd-alphonso-mango")[0].quantity).toBe("10 MT");
  });

  it("updates a quantity", () => {
    const rfq = setRfqQuantity(addRfqItem([], "prd-alphonso-mango"), "prd-alphonso-mango", "5 MT");
    expect(rfq[0].quantity).toBe("5 MT");
  });

  it("removes an item without touching the others", () => {
    const rfq = addRfqItem(addRfqItem([], "a"), "b");
    expect(removeRfqItem(rfq, "a").map((i) => i.product_id)).toEqual(["b"]);
  });

  it("does not mutate the list it was given", () => {
    const rfq = addRfqItem([], "a");
    addRfqItem(rfq, "b");
    expect(rfq).toHaveLength(1);
  });
});

describe("inquiriesToCsv", () => {
  const base: Inquiry = {
    id: "inq-1",
    name: "A Buyer",
    company: "Importer BV",
    country: "Netherlands",
    email: "buyer@importer.nl",
    phone: "+31000000",
    message: "Need a first container.",
    product_ids: ["prd-alphonso-mango"],
    quantity: "1 x 20ft reefer",
    destination_port: "Rotterdam",
    incoterm: "CIF",
    source: "form",
    status: "new",
    internal_notes: "",
    created_at: "2026-02-01T10:00:00.000Z",
  };

  it("writes a header row followed by one row per inquiry", () => {
    const lines = inquiriesToCsv([base]).trim().split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("Company");
    expect(lines[1]).toContain("Importer BV");
  });

  it("quotes and escapes a message containing commas, quotes and newlines", () => {
    const csv = inquiriesToCsv([
      { ...base, message: 'Wants 5 MT, "urgent"\nSecond line' },
    ]);
    expect(csv).toContain('"Wants 5 MT, ""urgent""');
    // The embedded newline stays inside the quoted field rather than starting a row.
    expect(csv.trim().split("\n")).toHaveLength(3);
  });

  it("joins multiple product ids into one cell", () => {
    const csv = inquiriesToCsv([{ ...base, product_ids: ["a", "b"] }]);
    // Semicolon-separated, so the cell needs no quoting and no column is added.
    expect(csv).toContain(",a; b,");
    const [header, row] = csv.trim().split("\n");
    expect(row.split(",")).toHaveLength(header.split(",").length);
  });

  it("returns just the header for an empty list", () => {
    expect(inquiriesToCsv([]).trim().split("\n")).toHaveLength(1);
  });
});

describe("mergeOneById", () => {
  const seedProduct = draftProduct({ id: "prd-1", slug: "one", name: "One", sort_order: 1 });

  it("returns the seed record when nothing has been edited", () => {
    expect(mergeOneById(seedProduct, [], [])?.name).toBe("One");
  });

  it("applies an edit made to that record", () => {
    const edited = { ...seedProduct, name: "Edited" };
    expect(mergeOneById(seedProduct, [edited], [])?.name).toBe("Edited");
  });

  // The trap: mergeById() treats any override whose id is not in the seed as a newly
  // created record. Passing a single-record seed to it would make every other edited
  // product leak onto this one's page.
  it("ignores edits belonging to a different record", () => {
    const otherProduct = draftProduct({ id: "prd-2", slug: "two", name: "Two" });
    expect(mergeOneById(seedProduct, [otherProduct], [])?.name).toBe("One");
  });

  it("returns null once the record has been deleted", () => {
    expect(mergeOneById(seedProduct, [], ["prd-1"])).toBeNull();
  });

  it("treats deletion as final, even with a later edit stored", () => {
    const edited = { ...seedProduct, name: "Edited" };
    expect(mergeOneById(seedProduct, [edited], ["prd-1"])).toBeNull();
  });
});

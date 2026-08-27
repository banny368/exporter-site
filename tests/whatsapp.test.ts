import { describe, expect, it } from "vitest";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp";
import { getProductBySlug } from "@/lib/products";

const COMPANY = "Your Company Name";
const PHONE = "910000000000";

const mango = getProductBySlug("alphonso-mango")!;
const turmeric = getProductBySlug("dried-turmeric-fingers")!;

/** The text a wa.me link actually carries, decoded back to real newlines. */
function decodedText(link: string): string {
  return new URL(link).searchParams.get("text") ?? "";
}

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with a digits-only number", () => {
    const link = buildWhatsAppLink({ phone: "+91 00000-00000", companyName: COMPANY });
    expect(link.startsWith("https://wa.me/910000000000?text=")).toBe(true);
  });

  it("encodes line breaks so the message keeps its shape in WhatsApp", () => {
    const link = buildWhatsAppLink({ phone: PHONE, companyName: COMPANY, product: mango });
    expect(link).toContain("%0A");
    expect(link).not.toContain("\n");
    expect(decodedText(link)).toBe(
      buildWhatsAppMessage({ phone: PHONE, companyName: COMPANY, product: mango }),
    );
  });

  it("survives the punctuation the catalogue actually uses", () => {
    const link = buildWhatsAppLink({
      phone: PHONE,
      companyName: COMPANY,
      product: turmeric,
      requirement: { quantity: "5 MT", destinationPort: "Jebel Ali", incoterm: "CIF" },
    });
    const text = decodedText(link);
    expect(text).toContain("Dried Turmeric Fingers");
    // Middle dot and en dash are all over the catalogue and both encode to multi-byte.
    expect(text).toContain("Curcumin 2–3% or 3–5%");
    expect(text).toContain("·");
  });

  it("survives an ampersand, which breaks a naively built query string", () => {
    const garlic = getProductBySlug("garlic-flakes-granules")!;
    const link = buildWhatsAppLink({ phone: PHONE, companyName: COMPANY, product: garlic });
    expect(decodedText(link)).toContain("Dehydrated Garlic Flakes & Granules");
  });

  it("refuses to build a link without a number rather than opening a dead chat", () => {
    expect(() => buildWhatsAppLink({ phone: "", companyName: COMPANY })).toThrow();
    expect(() => buildWhatsAppLink({ phone: "+()- ", companyName: COMPANY })).toThrow();
  });
});

describe("buildWhatsAppMessage — single product", () => {
  const text = buildWhatsAppMessage({
    phone: PHONE,
    companyName: COMPANY,
    product: mango,
    pageUrl: "https://acme.github.io/exporter-site/products/fresh-produce/alphonso-mango/",
  });

  it("greets the company by name", () => {
    expect(text.startsWith(`Hello ${COMPANY},`)).toBe(true);
  });

  it("carries the three fields a supplier needs to identify the item", () => {
    expect(text).toContain("Product: Alphonso Mango");
    expect(text).toContain("Variety/Grade: Alphonso (Hapus) · Grade A, export");
    expect(text).toContain("HS Code: 0804.50.20");
  });

  it("leaves the requirement fields blank for the buyer to fill in", () => {
    expect(text).toContain("Quantity:\n");
    expect(text).toContain("Destination port:\n");
    expect(text).toContain("Incoterm (FOB/CIF/CFR):\n");
  });

  it("ends with the page the buyer was looking at", () => {
    expect(text.trimEnd().endsWith(
      "Page: https://acme.github.io/exporter-site/products/fresh-produce/alphonso-mango/",
    )).toBe(true);
  });

  it("pre-fills the requirement when the buyer already typed it", () => {
    const filled = buildWhatsAppMessage({
      phone: PHONE,
      companyName: COMPANY,
      product: mango,
      requirement: { quantity: "1 x 20ft reefer", destinationPort: "Rotterdam", incoterm: "CIF" },
    });
    expect(filled).toContain("Quantity: 1 x 20ft reefer");
    expect(filled).toContain("Destination port: Rotterdam");
    expect(filled).toContain("Incoterm (FOB/CIF/CFR): CIF");
  });

  it("omits the page line when there is no page to cite", () => {
    const noPage = buildWhatsAppMessage({ phone: PHONE, companyName: COMPANY, product: mango });
    expect(noPage).not.toContain("Page:");
  });
});

describe("buildWhatsAppMessage — RFQ list", () => {
  const text = buildWhatsAppMessage({
    phone: PHONE,
    companyName: COMPANY,
    items: [
      { product: mango, quantity: "1 x 20ft reefer" },
      { product: turmeric, quantity: "10 MT" },
    ],
    requirement: { destinationPort: "Jebel Ali", incoterm: "CIF" },
    pageUrl: "https://acme.github.io/exporter-site/rfq/",
  });

  it("sends one message covering every item, not one message per item", () => {
    expect(text).toContain("Alphonso Mango");
    expect(text).toContain("Dried Turmeric Fingers");
    expect(text.match(/HS Code:/g)).toHaveLength(2);
  });

  it("numbers the items so a supplier can quote line by line", () => {
    expect(text).toContain("1. Alphonso Mango");
    expect(text).toContain("2. Dried Turmeric Fingers");
  });

  it("carries the quantity the buyer set against each line", () => {
    expect(text).toContain("Quantity: 1 x 20ft reefer");
    expect(text).toContain("Quantity: 10 MT");
  });

  it("states the shared destination and Incoterm once", () => {
    expect(text.match(/Destination port: Jebel Ali/g)).toHaveLength(1);
    expect(text.match(/Incoterm \(FOB\/CIF\/CFR\): CIF/g)).toHaveLength(1);
  });
});

describe("buildWhatsAppMessage — form handoff", () => {
  const text = buildWhatsAppMessage({
    phone: PHONE,
    companyName: COMPANY,
    inquiry: {
      name: "A Buyer",
      company: "Importer BV",
      country: "Netherlands",
      email: "buyer@importer.nl",
      message: "Looking for a first trial container.",
    },
    items: [{ product: mango, quantity: "1 x 20ft reefer" }],
    requirement: { destinationPort: "Rotterdam", incoterm: "CIF" },
  });

  it("repeats what the buyer already typed so they do not type it twice", () => {
    expect(text).toContain("Name: A Buyer");
    expect(text).toContain("Company: Importer BV");
    expect(text).toContain("Country: Netherlands");
    expect(text).toContain("Email: buyer@importer.nl");
    expect(text).toContain("Looking for a first trial container.");
  });

  it("omits fields the buyer left empty instead of sending blank labels", () => {
    expect(text).not.toContain("Phone:");
  });
});

describe("buildWhatsAppMessage — general inquiry", () => {
  it("still produces a usable message with no product attached", () => {
    const text = buildWhatsAppMessage({ phone: PHONE, companyName: COMPANY });
    expect(text.startsWith(`Hello ${COMPANY},`)).toBe(true);
    expect(text.length).toBeGreaterThan(20);
    expect(text).not.toContain("undefined");
  });
});

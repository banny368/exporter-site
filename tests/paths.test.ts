import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { absoluteUrl, withBase } from "@/lib/paths";

const ORIGINAL_BASE = process.env.NEXT_PUBLIC_BASE_PATH;
const ORIGINAL_SITE = process.env.NEXT_PUBLIC_SITE_URL;

function setBase(value: string | undefined) {
  if (value === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = value;
}

beforeEach(() => setBase(undefined));

afterEach(() => {
  setBase(ORIGINAL_BASE);
  if (ORIGINAL_SITE === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = ORIGINAL_SITE;
});

describe("withBase", () => {
  it("returns root-relative paths unchanged when no base path is set", () => {
    expect(withBase("/products/alphonso-mango/hero.svg")).toBe(
      "/products/alphonso-mango/hero.svg",
    );
  });

  it("prefixes the base path on a GitHub Pages project site", () => {
    setBase("/exporter-site");
    expect(withBase("/products/alphonso-mango/hero.svg")).toBe(
      "/exporter-site/products/alphonso-mango/hero.svg",
    );
  });

  it("adds a leading slash to a bare relative path", () => {
    setBase("/exporter-site");
    expect(withBase("site/hero.svg")).toBe("/exporter-site/site/hero.svg");
  });

  it("is idempotent so a double-prefixed asset can never 404", () => {
    setBase("/exporter-site");
    const once = withBase("/site/hero.svg");
    expect(withBase(once)).toBe(once);
  });

  it("leaves absolute URLs, data URIs and protocol links alone", () => {
    setBase("/exporter-site");
    expect(withBase("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(withBase("//cdn.example.com/a.png")).toBe("//cdn.example.com/a.png");
    expect(withBase("mailto:export@yourcompany.com")).toBe(
      "mailto:export@yourcompany.com",
    );
    expect(withBase("tel:+910000000000")).toBe("tel:+910000000000");
    expect(withBase("data:image/svg+xml,<svg/>")).toBe("data:image/svg+xml,<svg/>");
  });

  it("leaves in-page anchors alone", () => {
    setBase("/exporter-site");
    expect(withBase("#loadability")).toBe("#loadability");
  });

  it("returns an empty string untouched", () => {
    expect(withBase("")).toBe("");
  });
});

describe("absoluteUrl", () => {
  it("falls back to the base-prefixed path when no site URL is configured", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    setBase("/exporter-site");
    expect(absoluteUrl("/contact")).toBe("/exporter-site/contact");
  });

  it("joins origin and base path without doubling the slash", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://acme.github.io/";
    setBase("/exporter-site");
    expect(absoluteUrl("/contact")).toBe("https://acme.github.io/exporter-site/contact");
  });
});

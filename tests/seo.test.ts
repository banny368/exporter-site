import { describe, expect, it } from "vitest";
import { truncateAtWord } from "@/lib/seo";

describe("truncateAtWord", () => {
  it("leaves text that already fits completely alone", () => {
    expect(truncateAtWord("Short enough", 40)).toBe("Short enough");
  });

  it("never returns more than the limit", () => {
    const long = "Fresh fruit and vegetables, dehydrated products and spices, and solid wood furniture from India";
    expect(truncateAtWord(long, 50).length).toBeLessThanOrEqual(50);
  });

  it("breaks on a word boundary rather than through a word", () => {
    expect(truncateAtWord("alpha beta gamma delta", 14)).toBe("alpha beta…");
  });

  it("drops trailing punctuation left behind by the cut", () => {
    expect(truncateAtWord("alpha, beta, gamma", 9)).toBe("alpha…");
  });

  it("hard-cuts a single word longer than the limit", () => {
    expect(truncateAtWord("supercalifragilistic", 10).length).toBeLessThanOrEqual(10);
  });

  it("collapses stray whitespace so the count reflects what renders", () => {
    expect(truncateAtWord("  alpha   beta  ", 40)).toBe("alpha beta");
  });
});

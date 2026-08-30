import { describe, expect, it } from "vitest";
import {
  DEFAULT_THEME,
  auditPalette,
  contrastRatio,
  deriveInk,
  hexToRgb,
  isValidHex,
  normaliseHex,
  themeToCssVars,
} from "@/lib/theme";

describe("hexToRgb", () => {
  it("reads a six-digit hex", () => {
    expect(hexToRgb("#0e2a33")).toEqual([14, 42, 51]);
  });

  it("expands a three-digit shorthand", () => {
    expect(hexToRgb("#abc")).toEqual([170, 187, 204]);
  });

  it("does not care about case or a missing hash", () => {
    expect(hexToRgb("FAF8F4")).toEqual(hexToRgb("#faf8f4"));
  });

  it("returns null for anything that is not a colour", () => {
    for (const bad of ["", "#12", "#12345", "rgb(1,2,3)", "#gggggg"]) {
      expect(hexToRgb(bad), bad).toBeNull();
    }
  });
});

describe("contrastRatio", () => {
  it("gives 21:1 for black on white", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
  });

  it("gives 1:1 for a colour against itself", () => {
    expect(contrastRatio("#c08a2e", "#c08a2e")).toBeCloseTo(1, 5);
  });

  it("is symmetrical", () => {
    expect(contrastRatio("#0e2a33", "#faf8f4")).toBeCloseTo(
      contrastRatio("#faf8f4", "#0e2a33"),
      5,
    );
  });

  it("agrees with the measurements that drove the palette by hand", () => {
    // Plain brass on paper failed AA, which is why brass-ink exists.
    expect(contrastRatio("#c08a2e", "#faf8f4")).toBeLessThan(4.5);
    expect(contrastRatio("#7e5814", "#faf8f4")).toBeGreaterThanOrEqual(4.5);
  });
});

describe("deriveInk", () => {
  it("darkens a colour until it clears AA on the given background", () => {
    const ink = deriveInk("#c08a2e", "#faf8f4");
    expect(contrastRatio(ink, "#faf8f4")).toBeGreaterThanOrEqual(4.5);
  });

  it("leaves a colour alone when it already passes", () => {
    expect(deriveInk("#0e2a33", "#faf8f4")).toBe("#0e2a33");
  });

  it("lightens instead when the background is dark", () => {
    const ink = deriveInk("#0e2a33", "#07171d");
    expect(contrastRatio(ink, "#07171d")).toBeGreaterThanOrEqual(4.5);
  });

  it("honours a stricter target", () => {
    const ink = deriveInk("#c08a2e", "#faf8f4", 7);
    expect(contrastRatio(ink, "#faf8f4")).toBeGreaterThanOrEqual(7);
  });

  it("returns a usable hex even for an impossible request", () => {
    // Nothing reaches 21:1 against mid grey; it must still return a colour.
    const ink = deriveInk("#808080", "#808080", 21);
    expect(isValidHex(ink)).toBe(true);
  });
});

describe("auditPalette", () => {
  it("passes the palette the site ships with", () => {
    expect(auditPalette(DEFAULT_THEME.colors).filter((r) => !r.passes)).toEqual([]);
  });

  it("flags body text that has been made unreadable", () => {
    const broken = { ...DEFAULT_THEME.colors, slate: "#f2f0ec" };
    const failures = auditPalette(broken).filter((r) => !r.passes);
    expect(failures.length).toBeGreaterThan(0);
    expect(failures.some((r) => r.foreground === "slate")).toBe(true);
  });

  it("reports the ratio and the requirement so the panel can explain itself", () => {
    const row = auditPalette(DEFAULT_THEME.colors)[0];
    expect(row.ratio).toBeGreaterThan(0);
    expect(row.required).toBeGreaterThan(0);
    expect(row.label.length).toBeGreaterThan(0);
  });
});

describe("themeToCssVars", () => {
  it("emits only the roles that were actually changed", () => {
    const css = themeToCssVars({ harbour: "#123456" });
    expect(css).toContain("--color-harbour: #123456");
    expect(css).not.toContain("--color-brass");
  });

  it("returns an empty string when nothing is overridden", () => {
    expect(themeToCssVars({})).toBe("");
  });

  it("ignores a value that is not a colour rather than emitting broken CSS", () => {
    expect(themeToCssVars({ harbour: "javascript:alert(1)" as string })).toBe("");
  });
});

describe("normaliseHex", () => {
  it("returns a canonical lowercase six-digit hex", () => {
    expect(normaliseHex("ABC")).toBe("#aabbcc");
    expect(normaliseHex("#0E2A33")).toBe("#0e2a33");
  });

  it("returns null for junk", () => {
    expect(normaliseHex("nope")).toBeNull();
  });
});

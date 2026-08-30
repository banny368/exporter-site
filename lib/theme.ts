/**
 * Colour maths for the admin theming panel.
 *
 * Pure and dependency-free so it can be tested in Node and reused on both sides of the
 * render boundary. The rules here are the ones that were applied by hand when the palette
 * was built: plain brass fails AA on paper at 2.9:1, which is why a darkened `brass-ink`
 * exists. `deriveInk` does that derivation automatically for whatever colour a client
 * picks, and `auditPalette` reports every pair that would ship unreadable.
 */

export type ColorRole =
  | "harbour"
  | "harbour-deep"
  | "harbour-soft"
  | "brass"
  | "brass-ink"
  | "brass-bright"
  | "kraft"
  | "kraft-edge"
  | "amber"
  | "paper"
  | "slate"
  | "slate-soft";

export type ThemeColors = Partial<Record<ColorRole, string>>;

export interface Theme {
  colors: ThemeColors;
}

/** Mirrors the @theme block in app/globals.css. Keep the two in step. */
export const DEFAULT_THEME: { colors: Record<ColorRole, string> } = {
  colors: {
    harbour: "#0e2a33",
    "harbour-deep": "#07171d",
    "harbour-soft": "#163a45",
    brass: "#c08a2e",
    "brass-ink": "#7e5814",
    "brass-bright": "#dda84a",
    kraft: "#e8dfd0",
    "kraft-edge": "#d5c7ae",
    amber: "#f2a93b",
    paper: "#faf8f4",
    slate: "#46545a",
    "slate-soft": "#556269",
  },
};

export const COLOR_ROLE_LABELS: Record<ColorRole, string> = {
  harbour: "Header and dark sections",
  "harbour-deep": "Deepest background",
  "harbour-soft": "Raised dark surface",
  brass: "Rules, borders and dark-ground text",
  "brass-ink": "Brass text on light backgrounds",
  "brass-bright": "Brass hover",
  kraft: "Light section background",
  "kraft-edge": "Kraft borders",
  amber: "Call-to-action buttons",
  paper: "Page background",
  slate: "Body text",
  "slate-soft": "Secondary and label text",
};

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isValidHex(value: string): boolean {
  return HEX.test(String(value).trim());
}

export function normaliseHex(value: string): string | null {
  const raw = String(value).trim().replace(/^#/, "");
  if (!HEX.test(raw)) return null;
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return `#${full.toLowerCase()}`;
}

export function hexToRgb(value: string): [number, number, number] | null {
  const hex = normaliseHex(value);
  if (!hex) return null;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
}

/** WCAG 2.1 relative luminance. */
export function relativeLuminance(value: string): number {
  const rgb = hexToRgb(value);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Walk a colour towards black or white — whichever direction the background calls for —
 * until it clears the target ratio. Returns the input unchanged when it already passes,
 * and the best colour found when the target is unreachable, so a caller always gets
 * something renderable.
 */
export function deriveInk(color: string, background: string, target = 4.5): string {
  const start = hexToRgb(color);
  if (!start) return color;
  if (contrastRatio(color, background) >= target) return normaliseHex(color) ?? color;

  // A light background needs darker ink, and the other way round.
  const towards = relativeLuminance(background) > 0.5 ? 0 : 255;

  let best = normaliseHex(color) ?? color;
  let bestRatio = contrastRatio(best, background);

  for (let step = 1; step <= 100; step += 1) {
    const mix = step / 100;
    const candidate = rgbToHex([
      start[0] + (towards - start[0]) * mix,
      start[1] + (towards - start[1]) * mix,
      start[2] + (towards - start[2]) * mix,
    ]);
    const ratio = contrastRatio(candidate, background);

    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= target) return candidate;
  }

  return best;
}

export interface ContrastCheck {
  foreground: ColorRole;
  background: ColorRole;
  label: string;
  ratio: number;
  required: number;
  passes: boolean;
}

/**
 * The pairs that actually appear on the site. Large text is held to 3:1 and normal text
 * to 4.5:1, per WCAG AA.
 */
const CHECKED_PAIRS: { fg: ColorRole; bg: ColorRole; label: string; required: number }[] = [
  { fg: "slate", bg: "paper", label: "Body text on the page background", required: 4.5 },
  { fg: "slate", bg: "kraft", label: "Body text on light sections", required: 4.5 },
  { fg: "slate-soft", bg: "paper", label: "Labels on the page background", required: 4.5 },
  { fg: "slate-soft", bg: "kraft", label: "Labels on light sections", required: 4.5 },
  { fg: "harbour", bg: "paper", label: "Headings on the page background", required: 4.5 },
  { fg: "harbour", bg: "kraft", label: "Headings on light sections", required: 4.5 },
  { fg: "brass-ink", bg: "paper", label: "Brass text on the page background", required: 4.5 },
  { fg: "brass-ink", bg: "kraft", label: "Brass text on light sections", required: 4.5 },
  { fg: "kraft", bg: "harbour", label: "Text on dark sections", required: 4.5 },
  { fg: "kraft", bg: "harbour-deep", label: "Text on the deepest background", required: 4.5 },
  { fg: "brass", bg: "harbour", label: "Brass labels on dark sections", required: 4.5 },
  { fg: "brass", bg: "harbour-deep", label: "Brass labels on the deepest background", required: 4.5 },
  { fg: "harbour", bg: "amber", label: "Button text on a call to action", required: 4.5 },
];

export function auditPalette(colors: ThemeColors): ContrastCheck[] {
  const resolved = { ...DEFAULT_THEME.colors, ...colors };

  return CHECKED_PAIRS.map(({ fg, bg, label, required }) => {
    const ratio = contrastRatio(resolved[fg], resolved[bg]);
    return {
      foreground: fg,
      background: bg,
      label,
      ratio: Math.round(ratio * 100) / 100,
      required,
      passes: ratio >= required,
    };
  });
}

/**
 * Only the roles that were actually changed are emitted. Tailwind v4 already declares
 * every colour as a --color-* custom property on :root, so redeclaring one later in the
 * cascade re-skins every utility that uses it without a rebuild.
 *
 * Values that are not colours are dropped rather than interpolated, so nothing a client
 * types can escape into the stylesheet.
 */
export function themeToCssVars(colors: ThemeColors): string {
  return (Object.entries(colors) as [ColorRole, string][])
    .map(([role, value]) => [role, normaliseHex(value)] as const)
    .filter(([, hex]) => hex !== null)
    .map(([role, hex]) => `  --color-${role}: ${hex};`)
    .join("\n");
}

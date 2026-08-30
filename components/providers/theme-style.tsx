"use client";

import { getFontPair } from "@/lib/fonts";
import { themeToCssVars } from "@/lib/theme";
import { useSiteSettings } from "./store-provider";

/**
 * Applies the client's chosen palette and font pair at runtime.
 *
 * Tailwind v4 already declares every colour as a --color-* custom property inside its
 * `theme` layer. This emits an unlayered :root rule, which beats a layered one whatever
 * the source order, so redeclaring a role re-skins every utility that uses it with no
 * rebuild and no class changes.
 *
 * Only roles the client actually changed are emitted, and themeToCssVars drops anything
 * that is not a valid hex, so nothing typed into the admin panel can escape into the
 * stylesheet. The font pair comes from a fixed registry for the same reason.
 *
 * Before hydration this renders the seed settings, which is exactly what the server
 * rendered — so there is no flash and no mismatch.
 */
export function ThemeStyle() {
  const settings = useSiteSettings();

  const colorVars = themeToCssVars(settings.theme?.colors ?? {});
  const pair = getFontPair(settings.typography?.pair_id);

  const declarations = [
    colorVars,
    `  --font-display: ${pair.display};`,
    `  --font-sans: ${pair.sans};`,
  ]
    .filter(Boolean)
    .join("\n");

  return <style>{`:root {\n${declarations}\n}`}</style>;
}

/**
 * The font pairs the client can choose between.
 *
 * All self-hosted through next/font, so switching a pair never adds a request to Google
 * and never causes a flash of unstyled text. Only the default pair is preloaded; the rest
 * carry `preload: false`, so their files are fetched only when a pair is actually
 * selected. The mono face is deliberately fixed — it carries the HS codes, MOQ and port
 * names, and is part of the identity rather than a style choice.
 *
 * Each pair is checked against the layout: the display face has to hold a two-line
 * headline at 3rem without overflowing, and the body face has to stay readable at
 * 0.6875rem for the mono-adjacent labels.
 */
import {
  Archivo,
  Bitter,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  IBM_Plex_Sans,
  Inter_Tight,
  JetBrains_Mono,
  Karla,
  Libre_Baskerville,
  Newsreader,
  Playfair_Display,
  Source_Sans_3,
  Spectral,
  Work_Sans,
} from "next/font/google";

// Default pair. Preloaded, because it is what most visitors actually render.
export const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
export const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight", display: "swap" });
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

// Alternates carry preload: false, so their files are fetched only once a pair is chosen.
export const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", display: "swap", preload: false });
export const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap", preload: false });
export const libreBaskerville = Libre_Baskerville({ subsets: ["latin"], variable: "--font-libre-baskerville", display: "swap", preload: false, weight: ["400", "700"] });
export const spectral = Spectral({ subsets: ["latin"], variable: "--font-spectral", display: "swap", preload: false, weight: ["400", "600"] });
export const bitter = Bitter({ subsets: ["latin"], variable: "--font-bitter", display: "swap", preload: false });
export const dmSerif = DM_Serif_Display({ subsets: ["latin"], variable: "--font-dm-serif", display: "swap", preload: false, weight: ["400"] });
export const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", preload: false });
export const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap", preload: false });
export const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-ibm-plex-sans", display: "swap", preload: false, weight: ["400", "500", "600"] });
export const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", display: "swap", preload: false });
export const karla = Karla({ subsets: ["latin"], variable: "--font-karla", display: "swap", preload: false });
export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap", preload: false });

/** Every font variable, applied to <html> so any pair can be switched to at runtime. */
export const FONT_VARIABLES = [
  fraunces,
  interTight,
  jetbrainsMono,
  newsreader,
  playfair,
  libreBaskerville,
  spectral,
  bitter,
  dmSerif,
  archivo,
  sourceSans,
  ibmPlexSans,
  workSans,
  karla,
  dmSans,
]
  .map((font) => font.variable)
  .join(" ");

export interface FontPair {
  id: string;
  name: string;
  note: string;
  /** CSS value for --font-display, including its fallback stack. */
  display: string;
  /** CSS value for --font-sans. */
  sans: string;
}

const SERIF_FALLBACK = 'Georgia, "Times New Roman", serif';
const SANS_FALLBACK = "ui-sans-serif, system-ui, sans-serif";

export const FONT_PAIRS: FontPair[] = [
  {
    id: "harbour",
    name: "Harbour",
    note: "The default. Warm high-contrast serif against a tight neutral sans.",
    display: `var(--font-fraunces), ${SERIF_FALLBACK}`,
    sans: `var(--font-inter-tight), ${SANS_FALLBACK}`,
  },
  {
    id: "manifest",
    name: "Manifest",
    note: "Quieter serif, slightly wider body. Reads calmer on long pages.",
    display: `var(--font-newsreader), ${SERIF_FALLBACK}`,
    sans: `var(--font-inter-tight), ${SANS_FALLBACK}`,
  },
  {
    id: "consulate",
    name: "Consulate",
    note: "High-contrast classical serif. Formal, best with short headlines.",
    display: `var(--font-playfair), ${SERIF_FALLBACK}`,
    sans: `var(--font-source-sans), ${SANS_FALLBACK}`,
  },
  {
    id: "ledger",
    name: "Ledger",
    note: "Sturdy bookish serif with a technical sans. Document-like.",
    display: `var(--font-libre-baskerville), ${SERIF_FALLBACK}`,
    sans: `var(--font-ibm-plex-sans), ${SANS_FALLBACK}`,
  },
  {
    id: "monsoon",
    name: "Monsoon",
    note: "Literary serif, humanist sans. Softer and more editorial.",
    display: `var(--font-spectral), ${SERIF_FALLBACK}`,
    sans: `var(--font-work-sans), ${SANS_FALLBACK}`,
  },
  {
    id: "dockside",
    name: "Dockside",
    note: "Slab-leaning serif with a compact grotesque. Industrial.",
    display: `var(--font-bitter), ${SERIF_FALLBACK}`,
    sans: `var(--font-karla), ${SANS_FALLBACK}`,
  },
  {
    id: "consignment",
    name: "Consignment",
    note: "Modern display serif, geometric sans. The most contemporary pair.",
    display: `var(--font-dm-serif), ${SERIF_FALLBACK}`,
    sans: `var(--font-dm-sans), ${SANS_FALLBACK}`,
  },
  {
    id: "stencil",
    name: "Stencil",
    note: "No serif at all. Grotesque headlines, closest to a shipping label.",
    display: `var(--font-archivo), ${SANS_FALLBACK}`,
    sans: `var(--font-archivo), ${SANS_FALLBACK}`,
  },
];

export const DEFAULT_FONT_PAIR_ID = "harbour";

export function getFontPair(id: string | undefined): FontPair {
  return FONT_PAIRS.find((pair) => pair.id === id) ?? FONT_PAIRS[0];
}

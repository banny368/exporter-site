/**
 * Generates every placeholder image on the site.
 *
 * These are deliberately graphic rather than photographic. A fake photo invites a
 * client to ship the site as-is; a stencilled crate panel stamped with the product
 * name and HS code reads as "your photograph goes here" while still looking like it
 * belongs to this design. Replace them with real product photography before go-live.
 *
 * Run: npm run gen:images
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

const PALETTE = {
  harbour: "#0E2A33",
  harbourDeep: "#07171D",
  harbourSoft: "#163A45",
  brass: "#C08A2E",
  brassBright: "#DDA84A",
  kraft: "#E8DFD0",
  kraftEdge: "#D5C7AE",
  amber: "#F2A93B",
  paper: "#FAF8F4",
  slate: "#46545A",
};

/** Each category gets its own ground so a mixed grid still reads as three ranges. */
const CATEGORY_THEME = {
  "fresh-produce": { ground: PALETTE.harbour, ink: PALETTE.kraft, accent: PALETTE.amber },
  dehydrated: { ground: PALETTE.harbourDeep, ink: PALETTE.kraft, accent: PALETTE.brassBright },
  furniture: { ground: PALETTE.kraft, ink: PALETTE.harbour, accent: PALETTE.brass },
};

const SHOT_LABEL = {
  hero: "HERO · PRODUCT",
  macro: "MACRO · DETAIL",
  packing: "EXPORT PACKING",
  context: "IN CONTEXT",
};

const MONO = "ui-monospace, 'JetBrains Mono', 'DejaVu Sans Mono', 'Courier New', monospace";
const SERIF = "'Fraunces', Georgia, 'Times New Roman', serif";

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** djb2 — stable across runs so regenerating does not reshuffle every image. */
function hash(value) {
  let h = 5381;
  for (let i = 0; i < value.length; i += 1) h = (h * 33) ^ value.charCodeAt(i);
  return Math.abs(h);
}

/** Wrap a long product name onto at most three lines without a text-measuring pass. */
function wrap(text, perLine) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  return lines.slice(0, 3);
}

function defs(theme, seed) {
  const angle = 30 + (seed % 4) * 15;
  return `
  <defs>
    <pattern id="hatch" width="96" height="96" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})">
      <line x1="0" y1="0" x2="0" y2="96" stroke="${theme.ink}" stroke-opacity="0.06" stroke-width="30"/>
    </pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${theme.ground}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${theme.ground}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>`;
}

/** Registration ticks in the corners — the marks a crate stencil actually leaves. */
function corners(w, h, theme, inset = 56, len = 34) {
  const s = `stroke="${theme.accent}" stroke-width="3" stroke-opacity="0.85"`;
  return `
  <g ${s} fill="none">
    <path d="M${inset} ${inset + len} V${inset} H${inset + len}"/>
    <path d="M${w - inset - len} ${inset} H${w - inset} V${inset + len}"/>
    <path d="M${inset} ${h - inset - len} V${h - inset} H${inset + len}"/>
    <path d="M${w - inset - len} ${h - inset} H${w - inset} V${h - inset - len}"/>
  </g>`;
}

function stencilFrame(w, h, theme, inset = 56) {
  return `<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}"
    fill="none" stroke="${theme.ink}" stroke-opacity="0.28" stroke-width="2" stroke-dasharray="14 10"/>`;
}

/** The honest strip. Every placeholder says what it is. */
function stamp(w, h, theme) {
  return `
  <g>
    <rect x="${w - 356}" y="${h - 104}" width="300" height="44" fill="${theme.accent}" fill-opacity="0.14"
      stroke="${theme.accent}" stroke-opacity="0.5" stroke-width="1.5"/>
    <text x="${w - 206}" y="${h - 75}" text-anchor="middle" font-family="${MONO}" font-size="17"
      letter-spacing="2.6" fill="${theme.accent}">PLACEHOLDER IMAGE</text>
  </g>`;
}

function shotArtwork(shot, w, h, theme, seed) {
  const cx = w / 2;
  const cy = h / 2;

  if (shot === "macro") {
    // A magnified crop: concentric arcs reading as an extreme close-up.
    const rings = [0, 1, 2, 3]
      .map((i) => {
        const r = 120 + i * 92 + (seed % 40);
        return `<circle cx="${cx}" cy="${cy - 40}" r="${r}" fill="none" stroke="${theme.ink}"
          stroke-opacity="${0.22 - i * 0.04}" stroke-width="${12 - i * 2}"/>`;
      })
      .join("");
    return `${rings}<circle cx="${cx}" cy="${cy - 40}" r="64" fill="${theme.accent}" fill-opacity="0.2"/>`;
  }

  if (shot === "packing") {
    // A carton: top flaps, body, and two strapping bands.
    const bw = w * 0.44;
    const bh = h * 0.4;
    const bx = cx - bw / 2;
    const by = cy - bh / 2 - 30;
    return `
      <g stroke="${theme.ink}" stroke-opacity="0.5" stroke-width="3" fill="none">
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}"/>
        <path d="M${bx} ${by} L${bx + bw * 0.2} ${by - 60} H${bx + bw * 0.8} L${bx + bw} ${by}"/>
        <line x1="${cx}" y1="${by}" x2="${cx}" y2="${by + bh}"/>
      </g>
      <g stroke="${theme.accent}" stroke-opacity="0.75" stroke-width="7">
        <line x1="${bx - 24}" y1="${by + bh * 0.34}" x2="${bx + bw + 24}" y2="${by + bh * 0.34}"/>
        <line x1="${bx - 24}" y1="${by + bh * 0.7}" x2="${bx + bw + 24}" y2="${by + bh * 0.7}"/>
      </g>`;
  }

  if (shot === "context") {
    // A horizon: ground band plus a stacked-container silhouette.
    const horizon = h * 0.62;
    const stacks = [0, 1, 2, 3, 4]
      .map((i) => {
        const bw = 150;
        const bx = w * 0.12 + i * (bw + 26);
        const bhh = 70 + ((seed >> i) % 3) * 44;
        return `<rect x="${bx}" y="${horizon - bhh}" width="${bw}" height="${bhh}"
          fill="${theme.ink}" fill-opacity="${0.07 + (i % 3) * 0.025}"/>`;
      })
      .join("");
    return `
      <rect x="0" y="${horizon}" width="${w}" height="${h - horizon}" fill="${theme.ink}" fill-opacity="0.1"/>
      ${stacks}
      <line x1="0" y1="${horizon}" x2="${w}" y2="${horizon}" stroke="${theme.accent}" stroke-opacity="0.5" stroke-width="2"/>`;
  }

  // hero — a single bold crate panel behind the type.
  const pw = w * 0.56;
  const ph = h * 0.5;
  return `<rect x="${cx - pw / 2}" y="${cy - ph / 2 - 20}" width="${pw}" height="${ph}"
    fill="${theme.ink}" fill-opacity="0.07" stroke="${theme.accent}" stroke-opacity="0.35" stroke-width="2"/>`;
}

function productSvg({ name, hsCode, origin, shot, category }) {
  const w = 1600;
  const h = 1200;
  const theme = CATEGORY_THEME[category] ?? CATEGORY_THEME["fresh-produce"];
  const seed = hash(`${name}${shot}`);
  const lines = wrap(name, 18);
  const startY = h / 2 - (lines.length - 1) * 42 - 10;

  const title = lines
    .map(
      (line, i) =>
        `<text x="${w / 2}" y="${startY + i * 84}" text-anchor="middle" font-family="${SERIF}"
          font-size="76" font-weight="600" fill="${theme.ink}">${esc(line)}</text>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${defs(theme, seed)}
  <rect width="${w}" height="${h}" fill="${theme.ground}"/>
  <rect width="${w}" height="${h}" fill="url(#hatch)"/>
  ${shotArtwork(shot, w, h, theme, seed)}
  <rect width="${w}" height="${h}" fill="url(#fade)"/>
  ${stencilFrame(w, h, theme)}
  ${corners(w, h, theme)}
  <text x="90" y="128" font-family="${MONO}" font-size="22" letter-spacing="4"
    fill="${theme.accent}">${esc(SHOT_LABEL[shot])}</text>
  ${title}
  <text x="${w / 2}" y="${startY + lines.length * 84 + 24}" text-anchor="middle" font-family="${MONO}"
    font-size="26" letter-spacing="3" fill="${theme.ink}" fill-opacity="0.75">HS ${esc(hsCode)}</text>
  <text x="90" y="${h - 78}" font-family="${MONO}" font-size="22" letter-spacing="2.4"
    fill="${theme.ink}" fill-opacity="0.6">${esc(origin.toUpperCase())}</text>
  ${stamp(w, h, theme)}
</svg>`;
}

/**
 * Wide banner art.
 *
 * The wording is drawn only for Open Graph cards, which stand alone in a Slack or
 * WhatsApp preview. On the site these panels sit behind an HTML heading and are cropped
 * by object-cover at card sizes, which would slice the first letters off any text baked
 * into them — and repeat a title the page already states.
 */
function bannerSvg({ title, subtitle, category, w = 2400, h = 900, showText = false }) {
  const theme = CATEGORY_THEME[category] ?? CATEGORY_THEME["fresh-produce"];
  const seed = hash(title);

  let wording = "";

  if (showText) {
    const lines = wrap(title, 24);
    const longest = Math.max(...lines.map((line) => line.length));
    // No text measurement available here, so size from character count: this serif runs
    // about 0.52em per character. Capped so a short title does not fill the card.
    const size = Math.min(Math.round(h / 7), Math.round((w * 0.86) / (longest * 0.52)));
    const top = h / 2 - ((lines.length - 1) * size * 1.1) / 2 - size / 6;

    const titleLines = lines
      .map(
        (line, index) =>
          `<text x="${w / 2}" y="${top + index * size * 1.1}" text-anchor="middle"
            font-family="${SERIF}" font-size="${size}" font-weight="600"
            fill="${theme.ink}">${esc(line)}</text>`,
      )
      .join("");

    wording = `${titleLines}
      <text x="${w / 2}" y="${top + lines.length * size * 1.1 + size / 6}" text-anchor="middle"
        font-family="${MONO}" font-size="${Math.round(h / 26)}" letter-spacing="4"
        fill="${theme.accent}">${esc(subtitle)}</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${defs(theme, seed)}
  <rect width="${w}" height="${h}" fill="${theme.ground}"/>
  <rect width="${w}" height="${h}" fill="url(#hatch)"/>
  ${shotArtwork("context", w, h, theme, seed)}
  <rect width="${w}" height="${h}" fill="url(#fade)"/>
  ${corners(w, h, theme, 64, 40)}
  ${wording}
  ${stamp(w, h, theme)}
</svg>`;
}

function portraitSvg({ role }) {
  const w = 900;
  const h = 1100;
  const theme = CATEGORY_THEME.furniture;
  const seed = hash(role);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
  ${defs(theme, seed)}
  <rect width="${w}" height="${h}" fill="${theme.ground}"/>
  <rect width="${w}" height="${h}" fill="url(#hatch)"/>
  <circle cx="${w / 2}" cy="${h * 0.42}" r="150" fill="${theme.ink}" fill-opacity="0.12"/>
  <path d="M${w / 2 - 230} ${h * 0.88} a230 200 0 0 1 460 0 Z" fill="${theme.ink}" fill-opacity="0.12"/>
  ${stencilFrame(w, h, theme, 44)}
  <text x="${w / 2}" y="${h - 92}" text-anchor="middle" font-family="${MONO}" font-size="24"
    letter-spacing="3" fill="${theme.accent}">${esc(role.toUpperCase())}</text>
  <text x="${w / 2}" y="${h - 54}" text-anchor="middle" font-family="${MONO}" font-size="17"
    letter-spacing="2.4" fill="${theme.ink}" fill-opacity="0.55">PHOTO PLACEHOLDER</text>
</svg>`;
}

function logoSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80" role="img">
  <rect x="1" y="1" width="78" height="78" fill="none" stroke="${PALETTE.brass}" stroke-width="2"/>
  <path d="M18 56 L40 22 L62 56 Z" fill="none" stroke="${PALETTE.brass}" stroke-width="3"/>
  <line x1="18" y1="56" x2="62" y2="56" stroke="${PALETTE.amber}" stroke-width="4"/>
  <text x="98" y="42" font-family="${SERIF}" font-size="30" font-weight="600" fill="${PALETTE.harbour}">Your Logo</text>
  <text x="99" y="64" font-family="${MONO}" font-size="12" letter-spacing="3.4" fill="${PALETTE.slate}">EXPORT HOUSE</text>
</svg>`;
}

async function writeSvg(relPath, contents) {
  const full = path.join(PUBLIC, relPath);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, contents, "utf8");
  return full;
}

async function loadProducts() {
  const files = ["fresh-produce.json", "dehydrated.json", "furniture.json"];
  const groups = await Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(path.join(ROOT, "data", "products", file), "utf8")),
    ),
  );
  return groups.flat();
}

async function main() {
  const products = await loadProducts();
  const categories = JSON.parse(
    await readFile(path.join(ROOT, "data", "categories.json"), "utf8"),
  );

  let count = 0;

  for (const product of products) {
    for (const image of product.images) {
      const rel = image.url.replace(/^\//, "");
      await writeSvg(
        rel,
        productSvg({
          name: product.name,
          hsCode: product.hs_code,
          origin: product.origin,
          shot: image.shot,
          category: product.category_id,
        }),
      );
      count += 1;
    }
  }

  for (const category of categories) {
    await writeSvg(
      category.banner_url.replace(/^\//, ""),
      bannerSvg({
        title: category.name,
        subtitle: `${category.slug.toUpperCase()} · EXPORT RANGE`,
        category: category.slug,
      }),
    );
    count += 1;
  }

  const site = [
    ["site/hero.svg", { title: "From Indian soil to your port", subtitle: "LOADED AT NHAVA SHEVA · MUNDRA · CHENNAI", category: "fresh-produce", w: 2400, h: 1350 }],
    ["site/packhouse.svg", { title: "Pack House", subtitle: "GRADING · WASHING · PACKING", category: "fresh-produce" }],
    ["site/infra-packhouse.svg", { title: "Pack House", subtitle: "12 MT PER DAY", category: "fresh-produce", w: 1600, h: 1100 }],
    ["site/infra-coldstorage.svg", { title: "Cold Storage", subtitle: "600 MT · 4 CHAMBERS", category: "dehydrated", w: 1600, h: 1100 }],
    ["site/infra-warehouse.svg", { title: "Dry Warehouse", subtitle: "1,500 MT", category: "dehydrated", w: 1600, h: 1100 }],
    ["site/infra-loading.svg", { title: "Fumigation & Loading", subtitle: "4 CONTAINERS PER DAY", category: "furniture", w: 1600, h: 1100 }],
    ["site/quality.svg", { title: "Quality Assurance", subtitle: "SIX STAGE PROCESS", category: "dehydrated" }],
    ["site/about.svg", { title: "About the company", subtitle: "EST. 20XX", category: "furniture" }],
  ];

  for (const [rel, options] of site) {
    await writeSvg(rel, bannerSvg(options));
    count += 1;
  }

  const roles = ["Managing Director", "Head of Exports", "Quality Assurance Manager", "Logistics Head"];
  for (let i = 0; i < roles.length; i += 1) {
    await writeSvg(`site/team-${i + 1}.svg`, portraitSvg({ role: roles[i] }));
    count += 1;
  }

  await writeSvg("site/logo.svg", logoSvg());
  count += 1;

  // Shown for a product created in the admin panel before any photograph is added.
  await writeSvg(
    "site/no-image.svg",
    bannerSvg({ title: "", subtitle: "", category: "dehydrated", w: 1600, h: 1200 }),
  );
  count += 1;

  // GitHub Pages strips paths beginning with an underscore unless this file exists.
  await writeFile(path.join(PUBLIC, ".nojekyll"), "", "utf8");

  await generateOgImages(products, categories);

  console.log(`Generated ${count} placeholder SVGs in public/.`);
}

/**
 * Open Graph cards must be raster — Slack, WhatsApp and LinkedIn all refuse SVG.
 * Best effort: if sharp cannot rasterise here, the site still builds and simply has
 * no OG art, which is a cosmetic loss rather than a broken page.
 */
async function generateOgImages(products, categories) {
  let sharp;
  try {
    ({ default: sharp } = await import("sharp"));
  } catch {
    console.warn("sharp unavailable — skipping OG images.");
    return;
  }

  const targets = [
    ...products.map((product) => ({
      out: `og/products/${product.slug}.png`,
      svg: bannerSvg({
        title: product.name,
        subtitle: `HS ${product.hs_code} · ${product.origin.toUpperCase()}`,
        category: product.category_id,
        w: 1200,
        h: 630,
        showText: true,
      }),
    })),
    ...categories.map((category) => ({
      out: `og/categories/${category.slug}.png`,
      svg: bannerSvg({
        title: category.name,
        subtitle: "EXPORT RANGE",
        category: category.slug,
        w: 1200,
        h: 630,
        showText: true,
      }),
    })),
    {
      out: "og/default.png",
      svg: bannerSvg({
        title: "Your Company Name",
        subtitle: "FROM INDIAN SOIL TO YOUR PORT",
        category: "fresh-produce",
        w: 1200,
        h: 630,
        showText: true,
      }),
    },
  ];

  // Every image rendered with `priority` is a largest-contentful-paint candidate. As an
  // SVG the browser rasterises a full-viewport vector with a tiled pattern on the
  // critical path; as a WebP it decodes once. Product card art stays SVG — it is small,
  // lazy-loaded and never the LCP.
  for (const category of categories) {
    targets.push({
      out: `categories/${category.slug}.webp`,
      svg: bannerSvg({ title: "", subtitle: "", category: category.slug, w: 2400, h: 900 }),
      format: "webp",
      width: 1600,
    });
  }

  for (const name of ["about", "quality", "packhouse"]) {
    targets.push({
      out: `site/${name}.webp`,
      svg: bannerSvg({ title: "", subtitle: "", category: "furniture", w: 2400, h: 900 }),
      format: "webp",
      width: 1600,
    });
  }

  targets.push({
    out: "site/hero.webp",
    svg: bannerSvg({ title: "", subtitle: "", category: "fresh-produce", w: 2400, h: 1350 }),
    format: "webp",
    width: 1920,
  });

  let written = 0;
  for (const target of targets) {
    const full = path.join(PUBLIC, target.out);
    await mkdir(path.dirname(full), { recursive: true });

    try {
      let pipeline = sharp(Buffer.from(target.svg));
      if (target.width) pipeline = pipeline.resize({ width: target.width });
      pipeline = target.format === "webp" ? pipeline.webp({ quality: 82 }) : pipeline.png();

      await pipeline.toFile(full);
      written += 1;
    } catch (error) {
      console.warn(`Raster render failed for ${target.out}: ${error.message}`);
    }
  }

  console.log(`Generated ${written} Open Graph PNGs in public/og/.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

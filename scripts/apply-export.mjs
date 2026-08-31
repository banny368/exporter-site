/**
 * Turns a publish file from the admin panel into committed files.
 *
 * The admin panel saves everything in one browser — settings in localStorage, uploaded
 * images in IndexedDB — so nothing a client changes is visible to anyone else. This is
 * the bridge: it writes the uploads into `public/uploads/` as ordinary image files,
 * rewrites the data files to point at them, and leaves a normal git diff to commit.
 *
 * Images end up in the repository on purpose. Anything hosted elsewhere is a free tier
 * that can pause, expire or start charging; a file in `public/` is served by the same
 * CDN as the rest of the site and costs nothing for as long as the site exists.
 *
 * Run: npm run apply-export <path-to-exporter-publish.json>
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const DATA = path.join(ROOT, "data");
const UPLOADS = path.join(PUBLIC, "uploads");

/** Extensions we are willing to write, keyed by the mime the browser recorded. */
const EXTENSIONS = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/** Decode one data URL to bytes plus the extension it should be written with. */
function decodeDataUrl(dataUrl) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(dataUrl ?? "");
  if (!match) return null;

  const extension = EXTENSIONS[match[1]];
  if (!extension) return null;

  return { buffer: Buffer.from(match[2], "base64"), extension };
}

async function main() {
  const source = process.argv[2];
  if (!source) {
    fail(
      "Give it the publish file:\n" +
        "    npm run apply-export ~/Downloads/exporter-publish.json\n\n" +
        "  Download it from the admin panel under Site settings → Publish these changes.",
    );
  }

  let payload;
  try {
    payload = JSON.parse(await readFile(path.resolve(source), "utf8"));
  } catch (error) {
    fail(`Could not read ${source}\n  ${error.message}`);
  }

  if (!payload?.settings) {
    fail("That file has no settings in it — is it the publish file from Site settings?");
  }

  await mkdir(UPLOADS, { recursive: true });

  // ---------------------------------------------------------------- images --
  // Every upload becomes a real file. The id is the filename, so re-running this
  // overwrites rather than accumulating a second copy of the same image.
  const mediaPaths = new Map();
  let written = 0;
  let skipped = 0;

  for (const record of payload.media ?? []) {
    const decoded = decodeDataUrl(record.dataUrl);
    if (!decoded) {
      console.warn(`  skipped ${record.name ?? record.id} — unrecognised image type`);
      skipped += 1;
      continue;
    }

    const filename = `${record.id}.${decoded.extension}`;
    await writeFile(path.join(UPLOADS, filename), decoded.buffer);
    mediaPaths.set(record.id, `/uploads/${filename}`);
    written += 1;
  }

  // -------------------------------------------------------------- settings --
  const settings = structuredClone(payload.settings);

  // Image slots hold an uploaded id while editing. Swap each one for the path the
  // file now lives at; a slot already pointing at a path is left alone.
  let slotsRepointed = 0;
  for (const [slot, value] of Object.entries(settings.images ?? {})) {
    const resolved = mediaPaths.get(value);
    if (resolved) {
      settings.images[slot] = resolved;
      slotsRepointed += 1;
    }
  }

  // A logo is uploaded the same way but stored on its own key.
  if (settings.branding?.logo_media_id) {
    const resolved = mediaPaths.get(settings.branding.logo_media_id);
    if (resolved) {
      settings.branding.logo_path = resolved;
      settings.branding.logo_media_id = null;
      slotsRepointed += 1;
    }
  }

  await writeFile(path.join(DATA, "site.json"), JSON.stringify(settings, null, 2) + "\n");

  // -------------------------------------------------------------- products --
  // Product photographs are held on the product record itself as data URLs, so they
  // need the same treatment before the catalogue is written back.
  const CATEGORY_FILES = {
    "fresh-produce": "fresh-produce.json",
    dehydrated: "dehydrated.json",
    furniture: "furniture.json",
  };

  const deleted = new Set(payload.deletedProductIds ?? []);
  const overrides = new Map((payload.products ?? []).map((p) => [p.id, p]));
  let productImages = 0;
  let productsChanged = 0;

  for (const [slug, file] of Object.entries(CATEGORY_FILES)) {
    const target = path.join(DATA, "products", file);
    const seed = JSON.parse(await readFile(target, "utf8"));
    const list = Array.isArray(seed) ? seed : seed.products;

    const merged = list
      .map((product) => overrides.get(product.id) ?? product)
      .filter((product) => !deleted.has(product.id));

    // Products created in the admin panel are not in any seed file yet.
    for (const product of overrides.values()) {
      if (product.category_id !== slug) continue;
      if (merged.some((existing) => existing.id === product.id)) continue;
      if (deleted.has(product.id)) continue;
      merged.push(product);
    }

    for (const product of merged) {
      for (const image of product.images ?? []) {
        if (!String(image.url).startsWith("data:")) continue;

        const decoded = decodeDataUrl(image.url);
        if (!decoded) continue;

        const filename = `${product.slug}-${image.id ?? productImages}.${decoded.extension}`;
        await writeFile(path.join(UPLOADS, filename), decoded.buffer);
        image.url = `/uploads/${filename}`;
        productImages += 1;
        written += 1;
      }
    }

    const before = JSON.stringify(list);
    const after = JSON.stringify(merged);
    if (before !== after) productsChanged += 1;

    const out = Array.isArray(seed) ? merged : { ...seed, products: merged };
    await writeFile(target, JSON.stringify(out, null, 2) + "\n");
  }

  // ------------------------------------------------------------ categories --
  if (payload.categories?.length) {
    const target = path.join(DATA, "categories.json");
    const seed = JSON.parse(await readFile(target, "utf8"));
    const out = Array.isArray(seed) ? payload.categories : { ...seed, categories: payload.categories };
    await writeFile(target, JSON.stringify(out, null, 2) + "\n");
  }

  console.log(`
  Applied the publish file.

    ${written} image${written === 1 ? "" : "s"} written to public/uploads/${skipped ? ` (${skipped} skipped)` : ""}
    ${slotsRepointed} image slot${slotsRepointed === 1 ? "" : "s"} repointed at the new files
    ${productImages} product photograph${productImages === 1 ? "" : "s"} saved
    ${productsChanged} catalogue file${productsChanged === 1 ? "" : "s"} updated
    data/site.json rewritten

  Check it locally, then commit and push:

    npm run build && npm start
    git add -A && git commit -m "Publish content and images from the admin panel"
    git push
`);
}

main();

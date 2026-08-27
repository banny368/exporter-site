/**
 * Post-build fix for Next 16 segment prefetch on a plain file host.
 *
 * The static export writes per-segment prefetch payloads as a directory tree —
 * `about/__next.<key>/about/__PAGE__.txt` — but the client requests them with dots where
 * the export put slashes: `about/__next.<key>.about.__PAGE__.txt`. On a host with
 * rewrites that difference is invisible; on GitHub Pages every prefetch 404s, navigation
 * silently falls back to a full request, and the console fills with errors.
 *
 * This writes each payload under the name the client actually asks for, alongside the
 * original. It only touches files Next generated, and becomes a harmless no-op once the
 * mismatch is fixed upstream.
 */
import { readdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");

let copied = 0;

/** Every file inside a segment directory, as a path relative to it. */
async function filesUnder(dir, prefix = []) {
  const found = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await filesUnder(full, [...prefix, entry.name])));
    } else if (entry.isFile()) {
      found.push({ source: full, parts: [...prefix, entry.name] });
    }
  }

  return found;
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "_next") continue;

    const full = path.join(dir, entry.name);

    if (entry.name.startsWith("__next.")) {
      for (const { source, parts } of await filesUnder(full)) {
        await copyFile(source, path.join(dir, [entry.name, ...parts].join(".")));
        copied += 1;
      }
      continue;
    }

    await walk(full);
  }
}

try {
  await stat(OUT);
} catch {
  console.error("No out/ directory — run the build first.");
  process.exit(1);
}

await walk(OUT);
console.log(`Segment prefetch: aliased ${copied} payload${copied === 1 ? "" : "s"}.`);

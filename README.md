# B2B Exporter Website — demo build

A production-quality B2B export company website: fresh produce, dehydrated products and
spices, and solid wood furniture. Sixteen products with real export specifications,
a WhatsApp-first inquiry funnel, and a working admin panel.

Built to run **free**, deployed as a **static export on GitHub Pages**.

---

## Quick start

```bash
npm install
npm run gen:images   # regenerate placeholder artwork (already committed)
npm run dev          # http://localhost:3000
```

Admin panel: <http://localhost:3000/admin> — passcode `demo1234`.

```bash
npm test             # Vitest: data layer, WhatsApp links, store, base paths
npm run build        # static export into ./out
npm run serve        # serve ./out on http://localhost:3000
```

---

## What is real, what is a placeholder

| Real | Placeholder |
|---|---|
| All 16 products: HS codes, origins, seasons, packing, MOQ, loadability, quality parameters | Company name, logo, address, IEC/GST/APEDA numbers |
| Export process, Incoterm cost split, document sets, transit times | Statistics, team names, testimonials |
| Every page's copy | All product and facility photography |

Identity strings read `Your Company Name`, `Your Logo`, `+91 XXXXX XXXXX`. Copy is written
so a real name drops in without rewriting the sentence around it. Everything is editable
in **Admin → Site settings**, or in `data/site.json`.

**Replace the product images before going live.** An importer who receives a shipment that
does not match the website photos will not order again.

---

## Architecture

```
app/(site)/…      public routes (header, footer, floating actions)
app/admin/…       admin panel, client-side only, outside the public chrome
components/…      UI, product, admin, whatsapp, providers
data/             the seed catalogue and site settings
lib/              data layer, WhatsApp links, browser store, paths, analytics
scripts/          placeholder image generator
tests/            Vitest specs for the logic that is easy to get quietly wrong
```

### The one file that matters

`lib/products.ts` is the single seam between this demo and a real backend. Every page and
component reads the catalogue through its functions. Moving to Supabase means replacing
those function bodies with queries — no component changes.

### How the admin panel works without a server

GitHub Pages serves static files, so there is no API to write to.

- Public pages are prerendered from `data/`, which is what crawlers and first paint get.
- `StoreProvider` merges the browser's saved edits over that seed **after mount**, never
  during render, so hydration always matches.
- Records live in `localStorage`; uploaded images are resized to WebP and stored in
  IndexedDB, because localStorage caps around 5 MB.
- **Admin → Reset to seed data** wipes both. Use it before showing the demo to someone new.

### WhatsApp

`lib/whatsapp.ts` builds every `wa.me` URL — nothing string-concatenates one inline. While
`contact.whatsapp_configured` is false, buttons show a preview of the exact message rather
than opening a dead chat. Tick the box in Site settings once a real number is in.

Five touchpoints: floating button, per-product deep link, form handoff, RFQ multi-product
cart, and click tracking that feeds the admin dashboard.

---

## Environment variables

Copy `.env.example` to `.env.local`. All are optional; the site builds with none of them.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_PATH` | `/repo-name` for a GitHub Pages project site. CI sets it. |
| `NEXT_PUBLIC_SITE_URL` | Absolute origin for canonicals, sitemap and OG tags. |
| `NEXT_PUBLIC_ADMIN_PASSCODE` | Admin gate. Defaults to `demo1234`. |
| `NEXT_PUBLIC_GA4_ID` and friends | Analytics. Nothing loads without both an ID and consent. |

---

## Placeholder images

`npm run gen:images` regenerates everything in `public/products`, `public/categories`,
`public/site` and `public/og` — 80 SVGs and 20 Open Graph PNGs. Output is deterministic,
so rerunning does not reshuffle the artwork. Edit `scripts/gen-placeholders.mjs` to change
the treatment.

To use real photographs, drop files into `public/products/<slug>/` with the names
`hero`, `macro`, `packing`, `context`, and update the `url` values in
`data/products/*.json`.

---

## Accessibility and performance

Lighthouse on the production export, mobile profile: **accessibility 100, best practices
100, SEO 100** on the home, category and contact pages. Performance scores 46-63 and
misses the 90 target; the measured cause and the one tractable fix are written up in
ROADMAP.md.

Keyboard navigable end to end with visible focus rings, AA contrast, semantic heading
order, alt text on every image, and `prefers-reduced-motion` respected in both CSS and the
reveal hook. No motion library, no map library, no icon CDN — the page makes no external
request except self-hosted fonts, which are bundled at build.

---

## Deployment

See `DEPLOY.md`. Short version: push to GitHub, set Pages to "GitHub Actions", done.

## Roadmap

See `ROADMAP.md` for the phase 2–5 features and where each one plugs in.

## Notes for the client conversation

See `CLIENT-NOTES.md`.

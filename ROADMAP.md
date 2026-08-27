# Roadmap

What was deliberately left out of the demo, and where each piece plugs in. Nothing here
needs a rewrite — the seams already exist.

## Phase 1 — the real backend

Replacing the browser store with Supabase is the one change that unlocks most of the rest.

| Piece | Where it goes |
|---|---|
| Postgres | Replace the function bodies in `lib/products.ts`. `lib/types.ts` already mirrors the schema. |
| Auth | Swap `components/admin/admin-gate.tsx` for Supabase Auth and add a middleware guard on `/admin`. Needs a server runtime, so hosting moves from Pages to Vercel. |
| Storage | Replace `putMedia` and `listMedia` in `lib/store.ts` with a Supabase Storage bucket. |
| Inquiries | `addInquiry` in `components/providers/store-provider.tsx` becomes an insert. |

**Do not skip RLS.** Public SELECT on `products`, `product_images` and `categories` where
`is_published` is true; public INSERT on `inquiries`; everything else authenticated only.
An open table on a client site is a real problem, not a theoretical one.

## Phase 2 — conversion

- **RFQ to PDF.** `components/rfq/rfq-list.tsx` already holds the items, quantities, port
  and Incoterm. Render that same object to a PDF instead of a message.
- **Catalogue PDF behind an email capture.** Generate it from `data/products` at build time
  and gate the download through the existing inquiry form.
- **Sample request flow.** A third source value on `Inquiry`, plus a courier tracking field.
- **Auto-responder and sales notification.** Needs a server; add it on the same insert as
  the inquiry.
- **Live chat fallback** outside working hours — the hours already live in `data/site.json`.

## Phase 3 — buyer tools

This is what separates an exporter site from a brochure.

- **Container load calculator.** `Loadability` and `packing` are already structured. Enter a
  quantity, get cartons, CBM, gross weight and a container recommendation.
- **Interactive Incoterm explainer.** The static table on the export process page becomes
  interactive; the cost split data is already written.
- **Season calendar across all products.** `season_months` exists on every product and
  `SeasonCalendar` already renders a grid — widen it beyond one category.
- **Shipment tracker.** A container or B/L number against a carrier API.
- **Buyer portal.** Past orders, invoices, packing lists, certificates. Needs Auth first.

## Phase 4 — reach

- **Multi-language**, Arabic with full RTL. All copy sits in `data/` and page files; no
  strings are buried in components.
- **Country landing pages.** A route with `generateStaticParams` over a country list,
  reusing the product data. Strong for "mango exporter to Dubai" style queries.
- **Blog or market insights** for organic traffic.
- **Trade show calendar** — Gulfood, Anuga, SIAL, Fruit Logistica, IFEX.
- **WhatsApp Business Cloud API** for broadcast lists and templated replies.
- **CRM webhook** on every inquiry insert.
- **Multi-currency indicative pricing.**

## Phase 5 — operations

- **ERP and inventory sync** so availability updates itself.
- **Quotation builder** producing a branded proforma invoice PDF.
- **Document repository per shipment**, which is the buyer portal's back end.

## Performance

Measured with Lighthouse (mobile profile) against the **live site on GitHub Pages**, which
is what actually matters:

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 68 | 100 | 100 | 100 |
| Product detail | 69 | 97 | 100 | 100 |

LCP is around 3.1s on that throttled mobile profile. Accessibility, best practices and SEO
meet the target; performance does not reach 90.

A note on measuring this: served from a local static file server without compression the
same build scores 46 with an LCP near 7.5s. Compression on GitHub's CDN is worth roughly
20 points, so measure against the deployed URL rather than a local server or you will
chase the wrong thing.

What is left, in order of value:

| Slice | Size | Fix |
|---|---|---|
| React and the Next App Router client runtime | ~495 KB | Structural — fewer client components, or a framework with less client runtime. |
| The seed catalogue and site settings | ~110 KB | **The tractable one.** `StoreProvider` imports the whole catalogue so it can merge admin edits over it. Pass server-rendered products in as props instead and add a `useMergedProducts(seed)` hook; the catalogue then lands only in the admin chunk. Roughly ten files. |
| Radix and lucide | ~41 KB | Lift the WhatsApp preview dialog to one app-level instance instead of one per product card. |

Ruled out by measurement, so nobody repeats the work: the placeholder SVGs and their hatch
pattern, `text-wrap: balance`, and the three self-hosted font families (all loaded inside
1.7s). zod and react-hook-form are already correctly split out of the pages that do not
use them.

## Known limitations in this build

- The admin passcode is not authentication.
- Admin edits are per-browser and per-device.
- The contact form does not send email. It saves locally, then hands off to WhatsApp or a
  mailto link.
- Next.js segment prefetch files return 404 on plain static hosting. Navigation falls back
  to a normal request, so this costs a little speed and nothing else.

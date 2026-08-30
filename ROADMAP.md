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

Measured with Lighthouse (mobile profile) against the **deployed site on Vercel**, which
is the only measurement worth quoting — a local file server without compression
understates the score by roughly twenty points.

| Page | Performance | Accessibility | Best practices | SEO | JS shipped |
|---|---|---|---|---|---|
| Home | 75 | 100 | 100 | 100 | 218 KB |
| Products listing | 88 | 100 | 100 | 100 | 224 KB |
| Product detail | 79 | 100 | 100 | 100 | 224 KB |
| Contact | 79 | 100 | 100 | 100 | 295 KB |

Baseline before the move off static export was 68 with 600 KB of JavaScript. Accessibility,
best practices and SEO are at target. Performance is not yet at 90 on three of the four.

What produced the gain, in case it needs repeating elsewhere:

- **The catalogue left the client bundle.** `store-provider` imported `getAllProducts()`
  at module scope, so all sixteen full records reached every visitor on every page.
  Server components now pass only the products a page renders, trimmed to `ProductSummary`.
- **Reveal stopped being a client component.** One shared IntersectionObserver replaced
  one React tree per revealed block. This alone took home-page blocking time from 1,090ms
  to about 490ms.
- **The quote form loads on demand.** zod and react-hook-form were in every product page
  bundle for a modal that starts closed. `next/dynamic` took the product page from 302 KB
  to 224 KB.
- **Images are optimised.** AVIF with a real srcset per device width, which static export
  could not do.

What is left, in order of value:

| Item | Where it costs | Fix |
|---|---|---|
| `ProductCard` is a client component | 8 instances on the home page, 16 on the products listing, each hydrating its own tree and its own WhatsApp dialog | Split it: server-render the card body, keep a small client island for the RFQ and WhatsApp buttons. This is the largest remaining item. |
| One WhatsApp dialog per card | Same pages | Lift to a single app-level dialog driven by context. |
| React and the App Router client runtime | Every page, ~150 KB | Structural. Only fewer client components move it. |

Ruled out by measurement, so nobody repeats the work: the placeholder artwork, the fonts
(all three families load inside 1.7s), and CSS (11 KB total).

A note on measuring SEO: Vercel adds `X-Robots-Tag: noindex` to generated `*.vercel.app`
URLs so they do not compete with the real domain. Lighthouse reads that as "blocked from
indexing" and scores SEO 66 regardless of the markup. Measure on the custom domain.

## Known limitations in this build

- The admin passcode is not authentication.
- Admin edits are per-browser and per-device.
- The contact form does not send email. It saves locally, then hands off to WhatsApp or a
  mailto link.
- Next.js segment prefetch files return 404 on plain static hosting. Navigation falls back
  to a normal request, so this costs a little speed and nothing else.

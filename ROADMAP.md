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

Measured with Lighthouse (mobile profile) against the **deployed site on Vercel**. A local
file server without compression understates the score by roughly twenty points, so it is
not worth quoting.

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Home | 72–78 | 100 | 100 | 100 |
| Products listing | 76–88 | 100 | 100 | 100 |
| Global reach | 74–81 | 100 | 100 | 100 |
| Product detail | 77–79 | 100 | 100 | 100 |
| Contact | 75–79 | 100 | 100 | 100 |

Performance is quoted as a range on purpose: repeated runs of the same build vary by up to
ten points on a throttled mobile profile. Treat a single number as noise and re-measure
before acting on it.

Baseline before the move off static export was 68 with 600 KB of JavaScript, and around
220–255 KB now. Accessibility, best practices and SEO are at target on every page.
Performance is not.

What produced the gain:

- **The catalogue left the client bundle.** `store-provider` imported `getAllProducts()`
  at module scope, so all sixteen full records reached every visitor on every page. Server
  components now pass only what a page renders, trimmed to `ProductSummary`.
- **Reveal stopped being a client component.** One shared IntersectionObserver replaced one
  React tree per revealed block — home-page blocking time fell from 1,090ms to about 490ms.
- **The quote form loads on demand**, taking the product page from 302 KB to 224 KB.
- **The world map is lazy.** react-simple-maps and its topology are around 130 KB and load
  only when the section scrolls into view, on the two pages that show it.
- **Images are optimised** — AVIF with a real srcset per device width.

What is left — and what was tried and did not work:

| Attempted | Result |
|---|---|
| Lift the WhatsApp dialog to one app-level instance instead of one per card | **No measurable change.** 24 Radix dialog roots became one. JS went 227KB to 226KB, blocking time was unchanged. Kept anyway: one dialog is the right structure. |
| Set a modern browserslist to drop legacy polyfills | **No measurable change.** The polyfills are inside the Next runtime chunk and Turbopack does not drop them for a narrower target. Config kept because declaring a target is correct, but it buys nothing here. |

| Still untried | Where it costs |
|---|---|
| `ProductCard` as a server component with a small client island | 8 cards on the home page, 16 on the products listing. Blocked by its parents: FeaturedProducts and ProductBrowser are client components because they merge admin edits and run filters, and a server component cannot render inside one except as `children`. Doing this properly means restructuring how seed and overrides meet. |
| React and the App Router client runtime | ~150KB, and 794ms of evaluation on a throttled phone. This is the floor. |

An honest read of the remaining gap: blocking time sits around 700-900ms and most of it is
React evaluating plus style and layout on a content-heavy page. Reaching 90 means
materially less client React — and the interactive features this site was asked for
(catalogue filters, the carousel, the RFQ list, admin-driven theming) are exactly what
require it. The trade is real and worth making deliberately rather than by accident.

Ruled out by measurement, so nobody repeats the work: the placeholder artwork, the fonts
(all load inside 1.7s), and CSS at 11 KB.

Measuring SEO: Vercel adds `X-Robots-Tag: noindex` to generated `*.vercel.app` URLs so they
do not compete with the real domain. Lighthouse reads that as "blocked from indexing" and
scores SEO 66 regardless of the markup. Measure on the custom domain, or on the stable
project alias.

## Known limitations in this build

- The admin passcode is not authentication.
- Admin edits are per-browser and per-device.
- The contact form does not send email. It saves locally, then hands off to WhatsApp or a
  mailto link.
- Next.js segment prefetch files return 404 on plain static hosting. Navigation falls back
  to a normal request, so this costs a little speed and nothing else.

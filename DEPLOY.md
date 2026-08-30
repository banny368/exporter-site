# Deploying

The site runs on **Vercel**, server-rendered. It was a static export on GitHub Pages
during the demo phase; that changed when the client moved to a real domain, because
static hosting blocks image optimisation, the inquiry endpoint, and server rendering.

Live: https://exporter-site.vercel.app

## Everyday deploys

The GitHub repository is connected to the Vercel project, so:

```bash
git push
```

is the deploy. Every push to `main` builds and goes to production; every other branch
gets its own preview URL.

To deploy from your machine without pushing:

```bash
npm run deploy:preview   # preview URL
npm run deploy           # production
```

## First-time setup on a new machine

```bash
npm install
vercel login
vercel link --yes --project exporter-site
vercel env pull          # writes .env.local
npm run dev
```

## Environment variables

Set in the Vercel dashboard, or with `vercel env add <NAME> <environment>`.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical URLs, sitemap, `robots.txt`, OG tags | Must be the full origin with no trailing slash. Set this to the real domain once it is bought. If it is missing the build falls back to `VERCEL_PROJECT_PRODUCTION_URL`, then `VERCEL_URL`, so a deployment still emits absolute URLs rather than `http://localhost:3000` — but only this variable survives a move to a custom domain. |
| `NEXT_PUBLIC_ADMIN_PASSCODE` | the `/admin` gate | Defaults to `demo1234`. Change it before the site is public. |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics | Optional. Analytics stays off until the visitor accepts the cookie banner, whatever this is set to. |

After changing any of these, redeploy — they are read at build time.

## Adding the custom domain

1. Vercel dashboard → the project → **Settings → Domains** → add the domain.
2. At the registrar, point DNS at Vercel: an `A` record to `76.76.21.21` for the apex,
   and a `CNAME` to `cname.vercel-dns.com` for `www`. Vercel shows the exact values.
3. SSL is issued automatically, usually within a minute of DNS resolving.
4. Update `NEXT_PUBLIC_SITE_URL` to the new origin and redeploy, so canonical URLs, the
   sitemap and OG tags all point at the real domain.

**Measure SEO only after this step.** Vercel adds `X-Robots-Tag: noindex` to the
generated `*.vercel.app` URLs to stop them competing with your real domain in search
results. Lighthouse reads that as "blocked from indexing" and scores SEO 66 no matter how
correct the markup is. On the custom domain the header is gone and the score is 100.

## Deployment protection

Production is public. Vercel Authentication is off for this project — with it on, every
URL returns a 302 to a login page, including for Google's crawler.

## Checks before a production deploy

```bash
npm run lint
npm test
npm run build
```

## The old GitHub Pages route

`deploy/github-pages-workflow.yml` is kept for reference only. It does not run, and the
site can no longer be served as a static export — the inquiry endpoint and image
optimisation both need a server. Delete it once the domain is live and nobody is asking
about the old link.

# Deploying to GitHub Pages

The site is a static export. Hosting is free and there is nothing to keep running.

This repository is currently deployed the **branch way**: the built site lives on a
`gh-pages` branch and GitHub Pages serves it directly. That needs no special token
permissions, which is why it was used.

The **Actions way** is nicer once it is available — it rebuilds on every push and runs
the test suite first. The workflow is ready at `deploy/github-pages-workflow.yml`; it is
not at `.github/workflows/` because pushing a file to that path requires a token with the
`workflow` scope.

## Redeploying, as set up today

```bash
npm run deploy
```

That builds the static export and force-pushes `out/` to the `gh-pages` branch. Pages
picks it up within a minute or so.

## Switching to the Actions way

1. Give your GitHub CLI the extra scope:

   ```bash
   gh auth refresh -h github.com -s workflow
   ```

2. Move the workflow into place and push it:

   ```bash
   mkdir -p .github/workflows
   git mv deploy/github-pages-workflow.yml .github/workflows/deploy.yml
   git commit -m "Deploy from GitHub Actions"
   git push
   ```

3. Repository, then Settings, then Pages, and set *Source* to **GitHub Actions**.

From then on every push to `main` runs the tests, builds, and publishes.

## Why the base path matters



A GitHub Pages *project* site is served from `/<repo>`, not from the domain root, so every
asset URL needs that prefix. The workflow sets it from the repository name, so renaming the
repository follows automatically. Two things depend on it:

- `next.config.ts` passes it to `basePath` and `assetPrefix`.
- `lib/paths.ts` exposes `withBase()` for any raw path read out of JSON. `next/link` and
  `next/image` handle the prefix themselves.

Test the prefixed build locally — this is where base-path bugs surface, not in dev:

```bash
NEXT_PUBLIC_BASE_PATH=/your-repo npm run build
npm run serve
```

Then open `http://localhost:3000/your-repo/`.

## Using a root domain instead

For a user site named `<you>.github.io`, remove the `NEXT_PUBLIC_BASE_PATH` line from the
workflow — no prefix is needed.

For a custom domain, add it under Settings, then Pages; create `public/CNAME` containing
the domain; drop `NEXT_PUBLIC_BASE_PATH`; and set `NEXT_PUBLIC_SITE_URL` to the domain so
canonicals and the sitemap point at the right origin.

## What is already handled

- `public/.nojekyll` — without it, Pages strips `_next/`.
- `trailingSlash: true` — directory-style URLs, which Pages serves as `index.html`.
- `app/not-found.tsx` exports `404.html`, which Pages serves for unmatched paths.
- `images: { unoptimized: true }` — there is no Image Optimization API on static hosting.

## Before you call it live

- Replace every product photograph. Do not ship the placeholders.
- Put a real WhatsApp number in Admin, then Site settings, and tick "this number is real".
- Replace registration numbers, address, statistics, team names and testimonials.
- Change `NEXT_PUBLIC_ADMIN_PASSCODE` from `demo1234`, and understand that it is a demo
  gate, not authentication — anyone can read the page source. Move to Supabase Auth before
  the admin panel holds anything real.
- Set `NEXT_PUBLIC_SITE_URL` so canonicals, the sitemap and OG tags are absolute.
- Submit `sitemap.xml` in Google Search Console.

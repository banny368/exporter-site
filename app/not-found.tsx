import Link from "next/link";

/**
 * Exported as 404.html, which GitHub Pages serves for any unmatched path. It sits
 * outside the (site) group, so it carries its own minimal chrome rather than the full
 * header and footer — a 404 should load fast and offer a way out.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-harbour">
      <div className="page-shell py-24">
        <span className="mono-label text-brass">Error 404</span>

        <h1 className="mt-6 max-w-3xl text-[2rem] leading-[1.1] text-kraft md:text-[2.75rem]">
          That page is not in the manifest
        </h1>

        <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-kraft/75">
          The link may be out of date, or the product may have been renamed. The full
          catalogue is one click away.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="inline-flex h-12 items-center rounded-crate bg-amber px-6 font-medium text-harbour transition-colors hover:bg-brass-bright"
          >
            Browse all products
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-crate border border-kraft/30 px-6 font-medium text-kraft transition-colors hover:border-kraft/70 hover:bg-kraft/10"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center rounded-crate px-6 font-medium text-kraft/80 transition-colors hover:text-kraft"
          >
            Contact us
          </Link>
        </div>
      </div>
    </main>
  );
}

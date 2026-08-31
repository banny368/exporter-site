"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SiteImage } from "@/components/site-image";
import { useStore } from "@/components/providers/store-provider";
import { useScrolledPast } from "@/lib/client-hooks";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/quality", label: "Quality" },
  { href: "/export-process", label: "Export process" },
  { href: "/global-reach", label: "Global reach" },
  { href: "/contact", label: "Contact" },
];

export function Header({ categoryCounts = {} }: { categoryCounts?: Record<string, number> }) {
  const pathname = usePathname();
  const { categories, settings } = useStore();

  // Only the home page has a full-bleed hero for the header to sit over.
  const overHero = pathname === "/";
  const scrolled = useScrolledPast(24);
  const [menuOpen, setMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);

  // Any navigation closes whatever was open. Adjusting state during render is React's
  // documented alternative to an effect here: it happens before the browser paints, so
  // the menu never flashes open on the new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenuOpen(false);
    setProductsOpen(false);
  }

  useEffect(() => {
    if (!productsOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProductsOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!productsRef.current?.contains(event.target as Node)) setProductsOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [productsOpen]);

  const solid = scrolled || !overHero || menuOpen || productsOpen;
  const registrationStrip = settings.registrations
    .slice(0, 3)
    .map((registration) => registration.label)
    .join(" · ");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        solid
          ? "border-b border-brass/25 bg-harbour"
          // Not fully transparent: a scrim keeps the logo and nav legible over whatever
          // photograph a client drops into the hero slot.
          : "bg-gradient-to-b from-harbour-deep/85 via-harbour-deep/45 to-transparent",
      )}
    >
      <div className="page-shell flex h-18 items-center justify-between gap-6">
        <Logo onDark />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <div ref={productsRef} className="relative">
            <button
              type="button"
              aria-expanded={productsOpen}
              aria-controls="products-menu"
              onClick={() => setProductsOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-crate px-3 py-2 text-[0.9375rem] text-kraft/85 transition-colors hover:text-kraft"
            >
              Products
              <ChevronDown
                className={cn("size-4 transition-transform", productsOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>

            {productsOpen ? (
              <div
                id="products-menu"
                className="absolute top-full left-1/2 mt-3 w-[46rem] -translate-x-1/2 rounded-crate border border-brass/30 bg-paper p-3 shadow-2xl"
              >
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const count = categoryCounts[category.slug] ?? 0;

                    return (
                      <Link
                        key={category.id}
                        href={`/products/${category.slug}`}
                        className="group rounded-crate border border-transparent p-3 transition-colors hover:border-brass/30 hover:bg-kraft/50"
                      >
                        <div className="relative mb-3 aspect-4/3 overflow-hidden rounded-crate bg-harbour/5">
                          {/*
                            Through the slot registry, not the raw banner_url. This was
                            the one image on the site still reading its shipped path
                            directly, so replacing a category banner in the admin panel
                            changed the home page and the category page and left this
                            menu showing the placeholder.
                          */}
                          <SiteImage
                            slot={`category.${category.slug}.banner`}
                            fallback={category.banner_url}
                            alt=""
                            fill
                            sizes="240px"
                            className="object-cover"
                          />
                        </div>
                        <span className="block font-display text-[1.0625rem] font-semibold text-harbour">
                          {category.name}
                        </span>
                        <span className="mono-label mt-1.5 block">{count} products</span>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/products"
                  className="mono-label mt-2 block border-t border-brass/25 px-3 pt-3 pb-1 transition-colors hover:text-harbour"
                >
                  View the full catalogue →
                </Link>
              </div>
            ) : null}
          </div>

          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "rounded-crate px-3 py-2 text-[0.9375rem] transition-colors",
                pathname === link.href ? "text-kraft" : "text-kraft/85 hover:text-kraft",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <span className="mono-label hidden text-brass xl:block">{registrationStrip}</span>

          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/contact">Get a quote</Link>
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="rounded-crate p-2 text-kraft lg:hidden"
          >
            {menuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="mobile-menu"
          className="max-h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-brass/25 bg-harbour lg:hidden"
        >
          <nav aria-label="Mobile" className="page-shell grid gap-1 py-5">
            <span className="mono-label mb-1 text-brass">Product range</span>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products/${category.slug}`}
                className="rounded-crate px-2 py-2.5 text-kraft/90"
              >
                {category.name}
              </Link>
            ))}
            <Link href="/products" className="rounded-crate px-2 py-2.5 text-kraft/90">
              All products
            </Link>

            <hr className="my-3 border-0 border-t border-brass/25" />

            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-crate px-2 py-2.5 text-kraft/90">
                {link.label}
              </Link>
            ))}

            <Button size="md" asChild className="mt-4">
              <Link href="/contact">Get a quote</Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

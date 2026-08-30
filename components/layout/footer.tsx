"use client";

import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { SOCIAL_ICONS } from "@/components/social-icons";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/vision-mission", label: "Vision & mission" },
  { href: "/quality", label: "Quality assurance" },
  { href: "/export-process", label: "Export process" },
  { href: "/infrastructure", label: "Infrastructure" },
  { href: "/global-reach", label: "Global reach" },
  { href: "/faq", label: "Buyer FAQs" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const { settings, categories } = useStore();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-harbour to-harbour-deep text-kraft/75">
      <div className="page-shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo onDark />
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed">
              {settings.company.blurb}
            </p>

            <div className="mt-7">
              <span className="mono-label text-brass">Follow our shipments</span>
              <ul className="mt-3 flex flex-wrap items-center gap-2">
                {settings.socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.network];
                  if (!Icon) return null;

                  return (
                    <li key={social.network}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${settings.company.name} on ${social.network}`}
                        className={cn(
                          "flex items-center justify-center rounded-crate border border-kraft/20 text-kraft/70 transition-colors hover:border-brass hover:text-brass",
                          // LinkedIn goes first and larger: B2B buyers check it before Instagram.
                          social.emphasis ? "size-12" : "size-10",
                        )}
                      >
                        <Icon className={social.emphasis ? "size-6" : "size-[1.125rem]"} />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-6">
              <span className="mono-label text-brass">Verify us on</span>
              <ul className="mt-3 flex flex-wrap gap-2">
                {settings.marketplaces.map((marketplace) => (
                  <li key={marketplace.network}>
                    <a
                      href={marketplace.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-crate border border-kraft/20 px-2.5 py-1.5 font-mono text-[0.6875rem] tracking-[0.1em] uppercase transition-colors hover:border-brass hover:text-brass"
                    >
                      {marketplace.network}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mono-label text-brass">Product range</h2>
            <ul className="mt-4 grid gap-2.5">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products/${category.slug}`}
                    className="text-[0.9375rem] transition-colors hover:text-kraft"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-[0.9375rem] transition-colors hover:text-kraft">
                  All products
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="mono-label text-brass">Company</h2>
            <ul className="mt-4 grid gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[0.9375rem] transition-colors hover:text-kraft">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="mono-label text-brass">Get in touch</h2>

            <address className="mt-4 grid gap-4 not-italic">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden="true" />
                <span className="text-[0.9375rem] leading-relaxed">
                  {settings.contact.address_lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
              </div>

              <div className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden="true" />
                <a
                  href={`tel:${settings.contact.phone}`}
                  className="font-mono text-[0.875rem] transition-colors hover:text-kraft"
                >
                  {settings.contact.phone_display}
                </a>
              </div>

              <div className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brass" aria-hidden="true" />
                <a
                  href={`mailto:${settings.contact.email}`}
                  className="font-mono text-[0.875rem] break-all transition-colors hover:text-kraft"
                >
                  {settings.contact.email}
                </a>
              </div>
            </address>

            <p className="mt-5 font-mono text-[0.75rem] leading-relaxed tracking-[0.04em] text-kraft/70">
              {settings.contact.hours}
            </p>

            <dl className="mt-6 grid gap-1.5 border-t border-brass/25 pt-5">
              {settings.registrations.map((registration) => (
                <div key={registration.label} className="flex gap-3 font-mono text-[0.75rem]">
                  <dt className="w-28 shrink-0 tracking-[0.12em] text-brass uppercase">
                    {registration.label}
                  </dt>
                  <dd className="text-kraft/60">{registration.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      <div className="border-t border-brass/25">
        <div className="page-shell flex flex-col items-start justify-between gap-4 py-6 text-[0.8125rem] sm:flex-row sm:items-center">
          <p>
            © {year} {settings.company.legal_name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-kraft">
              Privacy policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-kraft">
              Terms
            </Link>
            <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-brass uppercase">
              Made in India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

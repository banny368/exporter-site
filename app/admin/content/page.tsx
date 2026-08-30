"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/admin/admin-shell";
import { CollectionEditor } from "@/components/admin/collection-editor";
import { COLLECTIONS } from "@/lib/collections";

export default function AdminContentPage() {
  const [active, setActive] = useState(COLLECTIONS[0].key);
  const schema = COLLECTIONS.find((collection) => collection.key === active) ?? COLLECTIONS[0];

  return (
    <>
      <AdminHeader
        title="Content"
        lead="Every list of copy on the site — capability points, certifications, the timeline, FAQs and the rest."
      />

      {/*
        Saying plainly where this copy applies. Unlike colours, images and the map — which
        the browser resolves and so change instantly — these lists are rendered on the
        server so that search engines read them. The FAQ list in particular is emitted as
        FAQPage structured data, which only works from server-rendered markup. That is
        worth keeping, and it means edits here reach visitors on the next deploy.
      */}
      <p className="mb-8 max-w-3xl rounded-crate border border-brass/35 bg-brass/5 p-4 text-[0.9375rem] leading-relaxed">
        Edits here are saved as you type and go live on the next deploy. This copy is
        rendered on the server so search engines can read it — the FAQs are published as
        structured data — which is why it does not swap instantly the way colours and
        images do. Use{" "}
        <Link href="/admin/settings" className="underline underline-offset-4">
          Export settings
        </Link>{" "}
        when you are finished.
      </p>

      {/*
        A list of lists is easier to navigate than thirteen screens in the sidebar, and it
        keeps the nav readable.
      */}
      <nav aria-label="Content lists" className="mb-8">
        <ul className="flex flex-wrap gap-2" role="list">
          {COLLECTIONS.map((collection) => (
            <li key={collection.key}>
              <button
                type="button"
                onClick={() => setActive(collection.key)}
                aria-current={collection.key === active ? "true" : undefined}
                className={`rounded-crate border px-3 py-2 text-[0.875rem] transition-colors ${
                  collection.key === active
                    ? "border-brass bg-brass/10 text-harbour"
                    : "border-harbour/15 text-slate hover:border-harbour/40"
                }`}
              >
                {collection.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <CollectionEditor key={schema.key} schema={schema} />

      <p className="mt-12 max-w-3xl border-t border-brass/25 pt-6 text-[0.9375rem] leading-relaxed">
        Products, categories and inquiries are not here — each has its own screen, because
        each does things a generic form cannot. Products are under{" "}
        <Link href="/admin/products" className="underline underline-offset-4">
          Products
        </Link>
        , ports and map locations under{" "}
        <Link href="/admin/map" className="underline underline-offset-4">
          Map
        </Link>
        .
      </p>
    </>
  );
}

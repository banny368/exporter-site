"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import { useMediaDataUrl } from "@/lib/client-hooks";
import { groupedImageSlots, type ImageSlot } from "@/lib/image-slots";
import { withBase } from "@/lib/paths";
import { fileToStoredImage, putMedia } from "@/lib/store";

const ASPECT: Record<ImageSlot["aspect"], string> = {
  wide: "aspect-[21/9]",
  landscape: "aspect-4/3",
  portrait: "aspect-3/4",
};

function SlotCard({ slot }: { slot: ImageSlot }) {
  const { settings, saveSettings } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const override = settings.images?.[slot.id];
  const isPath = Boolean(override && (override.startsWith("/") || override.startsWith("http")));
  const uploaded = useMediaDataUrl(isPath ? null : override);

  const preview = isPath ? withBase(override!) : (uploaded ?? withBase(slot.fallback));
  const replaced = Boolean(override);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      // 2000px covers the largest width the layout requests for a full-bleed banner.
      const record = await fileToStoredImage(file, 2000);
      await putMedia(record);
      saveSettings({ images: { ...(settings.images ?? {}), [slot.id]: record.id } });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That file could not be read.");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    const next = { ...(settings.images ?? {}) };
    delete next[slot.id];
    saveSettings({ images: next });
  }

  return (
    <li className="rounded-crate border border-harbour/12 p-4">
      <div className={`relative ${ASPECT[slot.aspect]} overflow-hidden rounded-crate bg-harbour/5`}>
        <Image
          src={preview}
          alt={`${slot.label} preview`}
          fill
          unoptimized={Boolean(uploaded)}
          sizes="(min-width: 1024px) 30vw, 90vw"
          className="object-cover"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[0.9375rem] leading-snug text-harbour">{slot.label}</p>
          <p className="mono-label mt-1">{replaced ? "Replaced" : "Shipped image"}</p>
        </div>
        {replaced ? (
          <button
            type="button"
            onClick={reset}
            className="mono-label shrink-0 underline underline-offset-4 hover:text-harbour"
          >
            <RotateCcw className="mr-1 inline size-3" aria-hidden="true" />
            Reset
          </button>
        ) : null}
      </div>

      {slot.note ? <p className="mt-2 text-[0.8125rem] text-slate-soft">{slot.note}</p> : null}

      <label className="mt-3 block">
        <span className="sr-only">Replace {slot.label}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          onChange={(event) => void onFile(event.target.files?.[0])}
          className="block w-full text-[0.8125rem] file:mr-3 file:rounded-crate file:border file:border-harbour/25 file:bg-paper file:px-3 file:py-1.5 file:text-[0.75rem] file:text-harbour"
        />
      </label>

      {busy ? <p className="mono-label mt-2">Processing…</p> : null}
      {error ? (
        <p role="alert" className="mt-2 text-[0.8125rem] text-[#9B2C1B]">
          {error}
        </p>
      ) : null}
    </li>
  );
}

export default function AdminImagesPage() {
  const groups = groupedImageSlots();

  return (
    <>
      <AdminHeader
        title="Images"
        lead="Every photograph on the site that is not part of a product. Replacing one takes effect immediately in this browser; Export settings publishes it."
      />

      {/*
        Saying where the product photographs are, rather than duplicating that editor
        here. Two places to change the same image is two places to disagree.
      */}
      <p className="mb-8 max-w-3xl rounded-crate border border-brass/35 bg-brass/5 p-4 text-[0.9375rem] leading-relaxed">
        Product photographs are edited on the product itself, under{" "}
        <Link href="/admin/products" className="underline underline-offset-4">
          Products
        </Link>
        , where they sit alongside that product&rsquo;s specification.
      </p>

      <div className="grid gap-12">
        {groups.map((group) => (
          <section key={group.group}>
            <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">{group.group}</h2>
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
              {group.slots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-12 border-t border-brass/25 pt-8">
        <h2 className="mono-label mb-3">Before the site goes live</h2>
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed">
          Every image here is placeholder artwork. Replace them with the company&rsquo;s own
          photographs before launch — an importer who receives a shipment that does not
          match the website will not order again, and in some markets misleading product
          imagery is a compliance problem.
        </p>
        <Button variant="outline" className="mt-5" asChild>
          <Link href="/admin/settings">Go to Export settings</Link>
        </Button>
      </section>
    </>
  );
}

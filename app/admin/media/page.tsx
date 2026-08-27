"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/components/providers/store-provider";
import { deleteMedia, listMedia, type MediaRecord } from "@/lib/store";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const { products } = useStore();
  const [media, setMedia] = useState<MediaRecord[] | null>(null);
  const [search, setSearch] = useState("");
  const [blocked, setBlocked] = useState<MediaRecord | null>(null);

  useEffect(() => {
    void listMedia().then((records) => setMedia(records ?? []));
  }, []);

  /** Which products reference an uploaded image, so an in-use file cannot vanish. */
  function usedIn(record: MediaRecord): string[] {
    return products
      .filter((product) => product.images.some((image) => image.id === record.id))
      .map((product) => product.name);
  }

  async function remove(record: MediaRecord) {
    const uses = usedIn(record);
    if (uses.length > 0) {
      setBlocked(record);
      return;
    }
    await deleteMedia(record.id);
    setMedia((previous) => (previous ?? []).filter((item) => item.id !== record.id));
  }

  const rows = (media ?? []).filter((record) =>
    record.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <>
      <AdminHeader
        title="Media library"
        lead="Images uploaded through the product editor. Placeholder artwork that ships with the build lives in the repository, not here."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="media-search" className="sr-only">
          Search media
        </label>
        <input
          id="media-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by file name"
          className="min-w-56 flex-1 rounded-crate border border-harbour/20 bg-paper px-3 py-2 text-[0.875rem] focus-visible:border-brass"
        />
        <span className="mono-label">{rows.length} files</span>
      </div>

      {media === null ? (
        <p className="mono-label">Reading the library…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-crate border border-dashed border-brass/40 px-6 py-14 text-center">
          <p className="font-display text-[1.25rem] text-harbour">Nothing uploaded yet</p>
          <p className="mx-auto mt-3 max-w-md text-[0.9375rem] leading-relaxed">
            Open a product, upload an image in the editor, and it will appear here with the
            products that use it.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" role="list">
          {rows.map((record) => {
            const uses = usedIn(record);

            return (
              <li key={record.id} className="overflow-hidden rounded-crate border border-harbour/12">
                <div className="relative aspect-4/3 bg-harbour/5">
                  <Image
                    src={record.dataUrl}
                    alt={record.name}
                    fill
                    sizes="(min-width: 1280px) 25vw, 45vw"
                    unoptimized
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="truncate text-[0.9375rem] text-harbour">{record.name}</p>
                  <p className="mono-label mt-1.5">
                    {record.width}×{record.height} · {formatBytes(record.bytes)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {uses.length > 0 ? (
                      uses.map((name) => (
                        <Chip key={name} tone="brass">
                          {name}
                        </Chip>
                      ))
                    ) : (
                      <Chip tone="muted">Not used</Chip>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => void remove(record)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={Boolean(blocked)} onOpenChange={(open) => !open && setBlocked(null)}>
        <DialogContent
          title="Image is still in use"
          description="Remove it from the product first, so nothing on the public site ends up with a broken image."
        >
          <p className="text-[0.9375rem] leading-relaxed">
            <strong>{blocked?.name}</strong> is used by{" "}
            {blocked ? usedIn(blocked).join(", ") : ""}.
          </p>
          <div className="mt-6">
            <Button variant="outline" onClick={() => setBlocked(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

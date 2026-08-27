import { emptyStore, type StoreState } from "./store-core";

/**
 * Browser persistence for the demo.
 *
 * Records go to localStorage; uploaded images go to IndexedDB, because localStorage
 * caps around 5 MB and a single product photo can exceed that on its own. Everything
 * here is browser-only and no-ops during the static export build.
 *
 * In the real build this file is replaced by Supabase calls. Nothing above it changes.
 */

const KEY = "exporter-demo:v1:store";
const MEDIA_DB = "exporter-demo-media";
const MEDIA_STORE = "images";

export const STORAGE_KEY = KEY;

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

/**
 * The store is exposed as an external store so React can read it with
 * useSyncExternalStore: one stable snapshot for the server, one for the client, and a
 * subscription for changes. That needs the snapshot to be referentially stable, so the
 * parsed state is cached here and only replaced when it actually changes.
 */
const SERVER_SNAPSHOT: StoreState = emptyStore();
let snapshot: StoreState | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

/** Called for the server render, and before hydration completes. */
export function getServerSnapshot(): StoreState {
  return SERVER_SNAPSHOT;
}

export function subscribeToStore(listener: () => void): () => void {
  listeners.add(listener);

  // Another tab writing to localStorage invalidates our cache.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== KEY) return;
    snapshot = null;
    notify();
  };

  if (hasWindow()) window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    if (hasWindow()) window.removeEventListener("storage", onStorage);
  };
}

export function readStore(): StoreState {
  if (!hasWindow()) return SERVER_SNAPSHOT;
  if (snapshot) return snapshot;

  try {
    const raw = window.localStorage.getItem(KEY);
    // Spread over a fresh empty store so a state saved by an older build, missing a
    // slice added since, still loads instead of crashing on `undefined.map`.
    snapshot = raw
      ? { ...emptyStore(), ...(JSON.parse(raw) as Partial<StoreState>) }
      : emptyStore();
  } catch {
    snapshot = emptyStore();
  }

  return snapshot;
}

export function writeStore(state: StoreState): boolean {
  snapshot = state;
  notify();

  if (!hasWindow()) return false;

  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    // Quota exceeded, or storage blocked in a private window. The in-memory snapshot
    // still holds, so the demo keeps working for this page view.
    return false;
  }
}

export function clearStore(): void {
  snapshot = emptyStore();
  notify();

  if (!hasWindow()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to remove */
  }
}

/* ------------------------------------------------------------------ media ---- */

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(MEDIA_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface MediaRecord {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

async function withMediaStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
): Promise<T | undefined> {
  if (!hasWindow() || !("indexedDB" in window)) return undefined;

  try {
    const db = await openMediaDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, mode);
      const request = run(tx.objectStore(MEDIA_STORE));
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return undefined;
  }
}

export function putMedia(record: MediaRecord) {
  return withMediaStore<IDBValidKey>("readwrite", (store) => store.put(record));
}

export function getMedia(id: string) {
  return withMediaStore<MediaRecord>("readonly", (store) => store.get(id));
}

export function listMedia() {
  return withMediaStore<MediaRecord[]>("readonly", (store) => store.getAll());
}

export function deleteMedia(id: string) {
  return withMediaStore<undefined>("readwrite", (store) => store.delete(id));
}

export async function clearMedia(): Promise<void> {
  await withMediaStore<undefined>("readwrite", (store) => store.clear());
}

/**
 * Downscale and re-encode an uploaded image before it is stored, so a 6 MB phone photo
 * becomes a ~150 KB WebP rather than filling the quota on the first upload.
 */
export function fileToStoredImage(file: File, maxEdge = 1600): Promise<MediaRecord> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That file is not an image we can read."));
      image.onload = () => {
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("This browser cannot process images."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", 0.82);

        resolve({
          id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          dataUrl,
          width,
          height,
          bytes: Math.round((dataUrl.length * 3) / 4),
          created_at: new Date().toISOString(),
        });
      };
      image.src = String(reader.result);
    };

    reader.readAsDataURL(file);
  });
}

/** Browser download for the CSV export. */
export function downloadTextFile(filename: string, contents: string, mime = "text/csv") {
  if (!hasWindow()) return;

  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

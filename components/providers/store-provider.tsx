"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getCategories, toProductSummary, type ProductSummary } from "@/lib/products";
import { site as seedSite } from "@/lib/site";
import {
  addRfqItem,
  createId,
  mergeById,
  mergeCategories,
  mergeSettings,
  removeRfqItem,
  setRfqQuantity,
  type ActivityEntry,
  type AnalyticsEvent,
  type StoreState,
} from "@/lib/store-core";
import {
  clearMedia,
  clearStore,
  getServerSnapshot,
  readStore,
  subscribeToStore,
  writeStore,
} from "@/lib/store";
import type { Category, Inquiry, Product, SiteSettings } from "@/lib/types";

/**
 * Merges the browser store over the seed data.
 *
 * Read through useSyncExternalStore, so the server snapshot is the empty store — exactly
 * what the static HTML on GitHub Pages was rendered from — and the client snapshot is
 * whatever this browser has saved. That keeps hydration honest without an effect, and a
 * write in another tab reaches this one through the storage event.
 *
 * `hydrated` tells components that must not flash (the RFQ counter, admin tables) that
 * the real snapshot is now in play.
 */

interface StoreContextValue {
  hydrated: boolean;
  /**
   * Admin edits and admin-created products only — never the catalogue. Pages pass the
   * products they render and merge through useMergedProducts / useMergedSummaries, so a
   * visitor downloads the eight cards on the home page rather than all sixteen records.
   */
  productOverrides: Product[];
  deletedProductIds: string[];
  categories: Category[];
  settings: SiteSettings;
  inquiries: Inquiry[];
  rfq: { product_id: string; quantity: string }[];
  activity: ActivityEntry[];
  events: AnalyticsEvent[];

  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  saveSettings: (settings: Partial<SiteSettings>) => void;

  addInquiry: (inquiry: Omit<Inquiry, "id" | "created_at">) => Inquiry;
  updateInquiry: (id: string, patch: Partial<Inquiry>) => void;

  addToRfq: (productId: string, quantity?: string) => void;
  updateRfqQuantity: (productId: string, quantity: string) => void;
  removeFromRfq: (productId: string) => void;
  clearRfq: () => void;

  trackEvent: (name: string, detail?: { source?: string; productSlug?: string }) => void;
  resetToSeed: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const SEED_CATEGORIES = getCategories();

export function StoreProvider({ children }: { children: ReactNode }) {
  // Before hydration this is the empty seed-only snapshot, which is exactly what the
  // static HTML was rendered from; afterwards it is whatever this browser has saved.
  const state = useSyncExternalStore(subscribeToStore, readStore, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribeToStore,
    () => true,
    () => false,
  );

  const commit = useCallback((update: (previous: StoreState) => StoreState) => {
    writeStore(update(readStore()));
  }, []);

  const logActivity = useCallback(
    (previous: StoreState, action: string, entity: string, entityId: string): ActivityEntry[] =>
      [
        {
          id: createId("act"),
          action,
          entity,
          entity_id: entityId,
          created_at: new Date().toISOString(),
        },
        ...previous.activity,
      ].slice(0, 200),
    [],
  );

  const value = useMemo<StoreContextValue>(() => {
    const categories = mergeCategories(SEED_CATEGORIES, state);
    const settings = mergeSettings(seedSite, state);

    return {
      hydrated,
      productOverrides: state.products,
      deletedProductIds: state.deletedProductIds,
      categories,
      settings,
      inquiries: state.inquiries,
      rfq: state.rfq,
      activity: state.activity,
      events: state.events,

      saveProduct: (product) =>
        commit((previous) => ({
          ...previous,
          products: [
            ...previous.products.filter((existing) => existing.id !== product.id),
            { ...product, updated_at: new Date().toISOString() },
          ],
          deletedProductIds: previous.deletedProductIds.filter((id) => id !== product.id),
          activity: logActivity(previous, "Saved product", "product", product.id),
        })),

      deleteProduct: (id) =>
        commit((previous) => ({
          ...previous,
          products: previous.products.filter((existing) => existing.id !== id),
          deletedProductIds: [...new Set([...previous.deletedProductIds, id])],
          activity: logActivity(previous, "Deleted product", "product", id),
        })),

      saveCategory: (category) =>
        commit((previous) => ({
          ...previous,
          categories: [
            ...previous.categories.filter((existing) => existing.id !== category.id),
            category,
          ],
          activity: logActivity(previous, "Saved category", "category", category.id),
        })),

      saveSettings: (patch) =>
        commit((previous) => ({
          ...previous,
          settings: { ...previous.settings, ...patch },
          activity: logActivity(previous, "Updated site settings", "settings", "site"),
        })),

      addInquiry: (draft) => {
        const inquiry: Inquiry = {
          ...draft,
          id: createId("inq"),
          created_at: new Date().toISOString(),
        };
        commit((previous) => ({
          ...previous,
          inquiries: [inquiry, ...previous.inquiries],
          activity: logActivity(previous, "New inquiry received", "inquiry", inquiry.id),
        }));
        return inquiry;
      },

      updateInquiry: (id, patch) =>
        commit((previous) => ({
          ...previous,
          inquiries: previous.inquiries.map((inquiry) =>
            inquiry.id === id ? { ...inquiry, ...patch } : inquiry,
          ),
          activity: logActivity(previous, "Updated inquiry", "inquiry", id),
        })),

      addToRfq: (productId, quantity) =>
        commit((previous) => ({
          ...previous,
          rfq: addRfqItem(previous.rfq, productId, quantity),
        })),

      updateRfqQuantity: (productId, quantity) =>
        commit((previous) => ({
          ...previous,
          rfq: setRfqQuantity(previous.rfq, productId, quantity),
        })),

      removeFromRfq: (productId) =>
        commit((previous) => ({ ...previous, rfq: removeRfqItem(previous.rfq, productId) })),

      clearRfq: () => commit((previous) => ({ ...previous, rfq: [] })),

      trackEvent: (name, detail) =>
        commit((previous) => ({
          ...previous,
          events: [
            {
              id: createId("evt"),
              name,
              source: detail?.source ?? "unknown",
              product_slug: detail?.productSlug,
              created_at: new Date().toISOString(),
            },
            ...previous.events,
          ].slice(0, 500),
        })),

      resetToSeed: () => {
        // clearStore() resets the snapshot and notifies subscribers, so the tree
        // re-renders from the seed data with no local state to keep in step.
        clearStore();
        void clearMedia();
      },
    };
  }, [state, hydrated, commit, logActivity]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside <StoreProvider>");
  return context;
}

/** Settings for client components, with any admin edits already applied. */
export function useSiteSettings(): SiteSettings {
  return useStore().settings;
}

/**
 * Merge admin edits over the products a server component handed in.
 *
 * Pages pass only what they render — eight summaries on the home page, one full record
 * plus four summaries on a product page — so the catalogue never reaches the client
 * bundle whole. `mergeById` is the same tested rule the admin panel uses.
 */
export function useMergedProducts(seed: Product[]): Product[] {
  const { productOverrides, deletedProductIds } = useStore();
  return useMemo(
    () => mergeById(seed, productOverrides, deletedProductIds),
    [seed, productOverrides, deletedProductIds],
  );
}

export function useMergedSummaries(seed: ProductSummary[]): ProductSummary[] {
  const { productOverrides, deletedProductIds } = useStore();
  return useMemo(
    () => mergeById(seed, productOverrides.map(toProductSummary), deletedProductIds),
    [seed, productOverrides, deletedProductIds],
  );
}

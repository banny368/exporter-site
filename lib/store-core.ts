import type {
  Category,
  Inquiry,
  InquiryStatus,
  Product,
  RfqItem,
  SiteSettings,
} from "./types";

/**
 * Pure state logic for the browser store.
 *
 * Nothing here touches localStorage, IndexedDB or React — that lives in lib/store.ts.
 * Keeping the merge and export rules pure is what makes them testable in Node, and
 * these are the rules most likely to break silently: a stale edit resurrecting a
 * deleted product, or a CSV that splits a row on a comma inside a buyer's message.
 */

export interface ActivityEntry {
  id: string;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  source: string;
  product_slug?: string;
  created_at: string;
}

export interface StoreState {
  /** Full product records: edits to seed products and newly created ones. */
  products: Product[];
  deletedProductIds: string[];
  categories: Category[];
  /** Partial overlay on top of data/site.json. */
  settings: Partial<SiteSettings> | null;
  inquiries: Inquiry[];
  rfq: RfqItem[];
  activity: ActivityEntry[];
  events: AnalyticsEvent[];
}

export function emptyStore(): StoreState {
  return {
    products: [],
    deletedProductIds: [],
    categories: [],
    settings: null,
    inquiries: [],
    rfq: [],
    activity: [],
    events: [],
  };
}

export function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${random}`;
}

/**
 * Seed catalogue, with admin edits applied and deletions removed.
 * Deletion is applied last so a stale edit can never resurrect a deleted product.
 */
export function mergeProducts(seed: Product[], state: StoreState): Product[] {
  const overrides = new Map(state.products.map((product) => [product.id, product]));
  const deleted = new Set(state.deletedProductIds);

  const merged = seed.map((product) => overrides.get(product.id) ?? product);
  const seedIds = new Set(seed.map((product) => product.id));
  const created = state.products.filter((product) => !seedIds.has(product.id));

  return [...merged, ...created]
    .filter((product) => !deleted.has(product.id))
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function mergeCategories(seed: Category[], state: StoreState): Category[] {
  const overrides = new Map(state.categories.map((category) => [category.id, category]));
  return seed
    .map((category) => overrides.get(category.id) ?? category)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * One level of merge is enough: the admin form always writes a complete top-level
 * group (the whole `company` object, the whole `contact` object), never a lone key.
 */
export function mergeSettings(seed: SiteSettings, state: StoreState): SiteSettings {
  if (!state.settings) return seed;
  return { ...seed, ...state.settings };
}

export function addRfqItem(rfq: RfqItem[], productId: string, quantity = ""): RfqItem[] {
  if (rfq.some((item) => item.product_id === productId)) return [...rfq];
  return [...rfq, { product_id: productId, quantity }];
}

export function setRfqQuantity(rfq: RfqItem[], productId: string, quantity: string): RfqItem[] {
  return rfq.map((item) =>
    item.product_id === productId ? { ...item, quantity } : item,
  );
}

export function removeRfqItem(rfq: RfqItem[], productId: string): RfqItem[] {
  return rfq.filter((item) => item.product_id !== productId);
}

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  sample_sent: "Sample sent",
  won: "Won",
  lost: "Lost",
};

const CSV_COLUMNS: { header: string; get: (inquiry: Inquiry) => string }[] = [
  { header: "Date", get: (i) => i.created_at },
  { header: "Name", get: (i) => i.name },
  { header: "Company", get: (i) => i.company },
  { header: "Country", get: (i) => i.country },
  { header: "Email", get: (i) => i.email },
  { header: "Phone", get: (i) => i.phone },
  { header: "Products", get: (i) => i.product_ids.join("; ") },
  { header: "Quantity", get: (i) => i.quantity },
  { header: "Destination port", get: (i) => i.destination_port },
  { header: "Incoterm", get: (i) => i.incoterm },
  { header: "Source", get: (i) => i.source },
  { header: "Status", get: (i) => STATUS_LABELS[i.status] ?? i.status },
  { header: "Message", get: (i) => i.message },
  { header: "Internal notes", get: (i) => i.internal_notes },
];

/** RFC 4180 quoting: a field containing a comma, quote or newline is quoted. */
function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function inquiriesToCsv(inquiries: Inquiry[]): string {
  const header = CSV_COLUMNS.map((column) => csvCell(column.header)).join(",");
  const rows = inquiries.map((inquiry) =>
    CSV_COLUMNS.map((column) => csvCell(column.get(inquiry) ?? "")).join(","),
  );
  return [header, ...rows].join("\n");
}

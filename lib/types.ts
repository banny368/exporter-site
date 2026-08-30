/**
 * Domain types.
 *
 * These deliberately mirror the Supabase schema in the build brief (§10.3) so the
 * real build swaps lib/products.ts from "read JSON" to "query Postgres" without
 * touching a single component. Where the shape differs from SQL it is noted.
 */

export type CategorySlug = "fresh-produce" | "dehydrated" | "furniture";

export interface SeasonRow {
  /** Product or variety this row describes. */
  item: string;
  /** Twelve booleans, Jan → Dec. True = available for shipment. */
  months: boolean[];
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  /** Banner intro copy, written for buyers. */
  description: string;
  banner_url: string;
  icon: string;
  sort_order: number;
  /** Category-level export note shown under the product grid. */
  export_note: string;
  season_calendar: SeasonRow[];
  /** Typical packing summary for the whole category. */
  packing_summary: string;
}

/** A row in the dynamic spec table the admin panel can extend without a developer. */
export interface SpecRow {
  label: string;
  value: string;
}

/** A testable quality parameter — the numbers a buyer's QA team checks. */
export interface QualityParam {
  parameter: string;
  specification: string;
  method?: string;
}

/**
 * Units or tonnage that fit each container type.
 * SQL: products.loadability jsonb.
 */
export interface Loadability {
  "20ft": string;
  "40ft": string;
  "40ft_hq": string;
  reefer: string;
}

export type ProductShot = "hero" | "macro" | "packing" | "context";

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  sort_order: number;
  is_primary: boolean;
  shot: ProductShot;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  /** Category slug. SQL: category_id uuid FK. */
  category_id: CategorySlug;
  sub_category: string;
  /** Card text, ~160 chars. */
  short_description: string;
  /** SQL stores one rich-text column; here, one entry per paragraph. */
  long_description: string[];

  hs_code: string;
  variety: string;
  origin: string;
  season: string;
  /** Months this product ships, Jan → Dec. Powers the availability filter. */
  season_months: number[];
  packing: string;
  moq: string;
  shelf_life: string;
  storage_temp: string;
  lead_time: string;
  payment_terms: string;
  incoterms: string;
  loading_ports: string[];

  loadability: Loadability;
  specs: SpecRow[];
  quality_params: QualityParam[];
  certifications: string[];
  markets: string[];
  packing_note: string;
  documents: string[];

  is_featured: boolean;
  is_published: boolean;
  sort_order: number;

  meta_title: string;
  meta_description: string;
  og_image: string;

  images: ProductImage[];

  created_at: string;
  updated_at: string;
}

export type InquirySource = "form" | "whatsapp" | "rfq";

export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "sample_sent",
  "won",
  "lost",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface Inquiry {
  id: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  message: string;
  product_ids: string[];
  quantity: string;
  destination_port: string;
  incoterm: string;
  source: InquirySource;
  status: InquiryStatus;
  internal_notes: string;
  created_at: string;
}

/** One line of the RFQ list a buyer builds across the catalogue. */
export interface RfqItem {
  product_id: string;
  quantity: string;
}

export interface Certification {
  id: string;
  name: string;
  abbr: string;
  description: string;
  sort_order: number;
}

export interface HeroSlide {
  image: string;
  heading: string;
  sub: string;
  primary_cta: { label: string; href: string };
  secondary_cta: { label: string; href: string };
}

export interface StatCounter {
  value: number;
  suffix: string;
  label: string;
}

export interface TeamMember {
  name: string;
  role: string;
  photo: string;
}

export interface Milestone {
  year: string;
  title: string;
  body: string;
}

export interface InfrastructureItem {
  name: string;
  capacity: string;
  body: string;
  photo: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  company: string;
  country: string;
  flag: string;
}

export interface RegionReach {
  region: string;
  countries: string[];
  verticals: string[];
}

export interface PortRoute {
  port: string;
  code: string;
  lat: number;
  lon: number;
  transits: { to: string; days: string }[];
}

export interface SocialLink {
  network: string;
  url: string;
  /** LinkedIn leads and renders larger — B2B buyers check it first. */
  emphasis?: boolean;
}

/** Admin-chosen colour overrides. Only changed roles are stored. */
export type ThemeColorOverrides = Record<string, string>;

/** SQL: site_settings (key, value jsonb). Flattened here for ergonomics. */
export interface SiteSettings {
  /** Colour roles the client has changed. Empty means the shipped palette. */
  theme: { colors: ThemeColorOverrides };
  /** Which curated font pair is active. See lib/fonts.ts. */
  typography: { pair_id: string };
  branding: {
    /** Media id of an uploaded logo, or null to use the drawn mark. */
    logo_media_id: string | null;
    /** Shown beside the mark. Falls back to the company name. */
    logo_text: string;
    show_mark: boolean;
  };
  /** Packing formats offered in the catalogue filter rail. */
  packing_types: string[];
  company: {
    name: string;
    legal_name: string;
    tagline: string;
    established: string;
    blurb: string;
    logo_text: string;
  };
  contact: {
    whatsapp: string;
    whatsapp_display: string;
    /**
     * False while the number is still the placeholder. WhatsApp actions then open a
     * preview of the message they would send instead of navigating to a dead wa.me
     * link — a demo that explains itself beats one that errors in front of a client.
     */
    whatsapp_configured: boolean;
    phone: string;
    phone_display: string;
    email: string;
    hours: string;
    hours_note: string;
    address_lines: string[];
    map_query: string;
    /** A Google Maps embed URL pasted by the client. Overrides map_query when set. */
    map_embed_url: string;
  };
  registrations: { label: string; value: string }[];
  loading_ports: string[];
  markets: string[];
  socials: SocialLink[];
  marketplaces: SocialLink[];
  certifications: Certification[];
  hero: HeroSlide;
  stats: StatCounter[];
  differentiators: { title: string; body: string }[];
  documents: string[];
  testimonials: Testimonial[];
  team: TeamMember[];
  milestones: Milestone[];
  infrastructure: InfrastructureItem[];
  regions: RegionReach[];
  ports: PortRoute[];
  story: string[];
  vision: string;
  mission: { title: string; body: string }[];
  motive: string[];
  values: { name: string; body: string }[];
  export_process: { step: string; title: string; timeline: string; body: string }[];
  quality_stages: { stage: string; title: string; body: string }[];
  faqs: { question: string; answer: string }[];
}

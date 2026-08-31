import { site } from "./site";

/**
 * Every image on the site that has no other editor.
 *
 * Product photographs are deliberately absent: they are edited on the product itself,
 * and a second place to change them would only create somewhere for the two to disagree.
 * The admin screen says where to find them.
 *
 * A slot id is stable and content-addressed rather than positional where it can be —
 * `category.dehydrated.banner` survives a reordering of the category list, whereas
 * `infra.2.photo` does not, because that list is genuinely an ordered array.
 */
export interface ImageSlot {
  id: string;
  /** What the client calls it, not what the file is called. */
  label: string;
  /** Which page it appears on, for grouping in the admin panel. */
  group: string;
  /** Shipped image, used until the client replaces it. */
  fallback: string;
  /** Roughly the shape it renders at, so the panel can preview it honestly. */
  aspect: "wide" | "landscape" | "portrait";
  note?: string;
}

function categorySlots(): ImageSlot[] {
  return [
    { slug: "fresh-produce", name: "Fresh Fruits & Vegetables" },
    { slug: "dehydrated", name: "Dehydrated Products & Spices" },
    { slug: "furniture", name: "Wooden Furniture & Handicrafts" },
  ].map((category) => ({
    id: `category.${category.slug}.banner`,
    label: `${category.name} banner`,
    group: "Category pages",
    fallback: `/categories/${category.slug}.webp`,
    aspect: "landscape" as const,
  }));
}

function infrastructureSlots(): ImageSlot[] {
  return site.infrastructure.map((item, index) => ({
    id: `infra.${index}.photo`,
    label: item.name,
    group: "Infrastructure",
    fallback: item.photo,
    aspect: "landscape" as const,
    note: "Shown on About, Infrastructure and Contact.",
  }));
}

function teamSlots(): ImageSlot[] {
  return site.team.map((member, index) => ({
    id: `team.${index}.photo`,
    label: member.role,
    group: "Team",
    fallback: member.photo,
    aspect: "portrait" as const,
  }));
}

export const IMAGE_SLOTS: ImageSlot[] = [
  {
    id: "site.hero",
    label: "Home page hero",
    group: "Home",
    fallback: "/site/hero.webp",
    aspect: "wide",
    note: "The first thing a buyer sees. A loaded reefer or a pack house works best.",
  },
  {
    id: "site.about",
    label: "About page banner",
    group: "Inner page banners",
    fallback: "/site/about.webp",
    aspect: "landscape",
  },
  {
    id: "site.quality",
    label: "Quality page banner",
    group: "Inner page banners",
    fallback: "/site/quality.webp",
    aspect: "landscape",
  },
  {
    id: "site.packhouse",
    label: "Infrastructure page banner",
    group: "Inner page banners",
    fallback: "/site/packhouse.webp",
    aspect: "landscape",
  },
  // Every remaining page that opens with a banner. Without an entry here the page has
  // no image at all and the client has nothing to replace — which is exactly how the
  // Export process page came to open on a bare dark band.
  {
    id: "site.products",
    label: "Product catalogue banner",
    group: "Inner page banners",
    fallback: "/site/products.webp",
    aspect: "landscape",
  },
  {
    id: "site.export_process",
    label: "Export process banner",
    group: "Inner page banners",
    fallback: "/site/export-process.webp",
    aspect: "landscape",
  },
  {
    id: "site.global_reach",
    label: "Global reach banner",
    group: "Inner page banners",
    fallback: "/site/global-reach.webp",
    aspect: "landscape",
  },
  {
    id: "site.contact",
    label: "Contact page banner",
    group: "Inner page banners",
    fallback: "/site/contact.webp",
    aspect: "landscape",
  },
  {
    id: "site.faq",
    label: "Buyer FAQs banner",
    group: "Inner page banners",
    fallback: "/site/faq.webp",
    aspect: "landscape",
  },
  {
    id: "site.vision",
    label: "Vision & mission banner",
    group: "Inner page banners",
    fallback: "/site/vision-mission.webp",
    aspect: "landscape",
  },
  {
    id: "site.privacy",
    label: "Privacy policy banner",
    group: "Inner page banners",
    fallback: "/site/privacy.webp",
    aspect: "landscape",
  },
  {
    id: "site.terms",
    label: "Terms page banner",
    group: "Inner page banners",
    fallback: "/site/terms.webp",
    aspect: "landscape",
  },
  ...categorySlots(),
  ...infrastructureSlots(),
  ...teamSlots(),
];

export function getImageSlot(id: string): ImageSlot | undefined {
  return IMAGE_SLOTS.find((slot) => slot.id === id);
}

/** Slots grouped for the admin screen, in the order a client would look for them. */
export function groupedImageSlots(): { group: string; slots: ImageSlot[] }[] {
  const order = ["Home", "Inner page banners", "Category pages", "Infrastructure", "Team"];
  return order
    .map((group) => ({ group, slots: IMAGE_SLOTS.filter((slot) => slot.group === group) }))
    .filter((entry) => entry.slots.length > 0);
}

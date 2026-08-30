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
    aspect: "wide" as const,
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
    aspect: "wide",
  },
  {
    id: "site.quality",
    label: "Quality page banner",
    group: "Inner page banners",
    fallback: "/site/quality.webp",
    aspect: "wide",
  },
  {
    id: "site.packhouse",
    label: "Infrastructure page banner",
    group: "Inner page banners",
    fallback: "/site/packhouse.webp",
    aspect: "wide",
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

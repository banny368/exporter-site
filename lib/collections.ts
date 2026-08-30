import type { SiteSettings } from "./types";

/**
 * Schemas for the content lists the client can edit.
 *
 * Thirteen lists that would otherwise be thirteen admin screens. Describing them as data
 * means one editor component covers all of them, and adding a fourteenth is a few lines
 * here rather than a new page.
 *
 * Products, categories and inquiries are deliberately absent — each has its own editor
 * with behaviour a generic form cannot express.
 */

export type FieldType = "text" | "textarea" | "number" | "list";

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  /** Renders full width rather than sharing a row. */
  wide?: boolean;
}

export interface CollectionSchema {
  /** Key on SiteSettings. */
  key: keyof SiteSettings;
  label: string;
  description: string;
  /** Singular, for the add button and remove labels. */
  itemLabel: string;
  /** Which field to show as the row heading. */
  titleField: string;
  fields: FieldSchema[];
  blank: () => Record<string, unknown>;
  /**
   * This list is stored as plain strings rather than objects. The editor wraps each into
   * { value } to edit it and unwraps on save.
   */
  primitive?: boolean;
}

export const COLLECTIONS: CollectionSchema[] = [
  {
    key: "differentiators",
    label: "Capability points",
    description:
      "The six points under 'What actually differs between one Indian supplier and another'. Lead each with a number, not an adjective.",
    itemLabel: "point",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text", placeholder: "In-house pack house, 12 MT per day" },
      { key: "body", label: "Body", type: "textarea", wide: true },
    ],
    blank: () => ({ title: "New capability", body: "" }),
  },
  {
    key: "certifications",
    label: "Certifications",
    description: "Shown in the trust bar, on Quality, and on About.",
    itemLabel: "certification",
    titleField: "name",
    fields: [
      { key: "name", label: "Name", type: "text", placeholder: "ISO 22000" },
      { key: "abbr", label: "Short form", type: "text", hint: "Shown in the trust bar." },
      { key: "description", label: "What it covers", type: "textarea", wide: true },
      { key: "sort_order", label: "Order", type: "number" },
    ],
    blank: () => ({ id: "", name: "New certification", abbr: "NEW", description: "", sort_order: 99 }),
  },
  {
    key: "documents",
    label: "Documents provided",
    description: "The manifest-style list buyers scan for on the home page.",
    itemLabel: "document",
    titleField: "value",
    fields: [{ key: "value", label: "Document", type: "text", placeholder: "Certificate of Origin", wide: true }],
    blank: () => ({ value: "New document" }),
    primitive: true,
  },
  {
    key: "stats",
    label: "Headline figures",
    description: "The four counters on About. Replace the demo numbers with the company's real ones.",
    itemLabel: "figure",
    titleField: "label",
    fields: [
      { key: "value", label: "Number", type: "number" },
      { key: "suffix", label: "Suffix", type: "text", placeholder: "+" },
      { key: "label", label: "Label", type: "text", placeholder: "Countries served" },
    ],
    blank: () => ({ value: 0, suffix: "", label: "New figure" }),
  },
  {
    key: "team",
    label: "Team",
    description: "Photographs are replaced on the Images screen.",
    itemLabel: "person",
    titleField: "role",
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text", placeholder: "Head of Exports" },
    ],
    blank: () => ({ name: "Name to be added", role: "New role", photo: "/site/team-1.webp" }),
  },
  {
    key: "milestones",
    label: "Timeline",
    description: "The company history on About.",
    itemLabel: "milestone",
    titleField: "title",
    fields: [
      { key: "year", label: "Year", type: "text", placeholder: "2019" },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea", wide: true },
    ],
    blank: () => ({ year: "20XX", title: "New milestone", body: "" }),
  },
  {
    key: "infrastructure",
    label: "Infrastructure",
    description: "Facilities shown on About, Infrastructure and Contact. Photographs live on the Images screen.",
    itemLabel: "facility",
    titleField: "name",
    fields: [
      { key: "name", label: "Facility", type: "text" },
      { key: "capacity", label: "Capacity", type: "text", placeholder: "12 MT per day" },
      { key: "body", label: "Description", type: "textarea", wide: true },
    ],
    blank: () => ({ name: "New facility", capacity: "", body: "", photo: "/site/infra-packhouse.webp" }),
  },
  {
    key: "testimonials",
    label: "Testimonials",
    description:
      "Publish these only with the buyer's written permission. The demo entries are marked as sample content on the site.",
    itemLabel: "testimonial",
    titleField: "company",
    fields: [
      { key: "quote", label: "Quote", type: "textarea", wide: true },
      { key: "name", label: "Attribution", type: "text", placeholder: "Procurement Manager" },
      { key: "company", label: "Company", type: "text" },
      { key: "country", label: "Country", type: "text" },
      { key: "flag", label: "Flag", type: "text", placeholder: "🇳🇱" },
    ],
    blank: () => ({ quote: "", name: "", company: "New buyer", country: "", flag: "" }),
  },
  {
    key: "values",
    label: "Core values",
    description: "The six values on the Vision and mission page.",
    itemLabel: "value",
    titleField: "name",
    fields: [
      { key: "name", label: "Value", type: "text" },
      { key: "body", label: "Body", type: "textarea", wide: true },
    ],
    blank: () => ({ name: "New value", body: "" }),
  },
  {
    key: "mission",
    label: "Mission pillars",
    description: "The four commitments on the Vision and mission page.",
    itemLabel: "pillar",
    titleField: "title",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea", wide: true },
    ],
    blank: () => ({ title: "New pillar", body: "" }),
  },
  {
    key: "export_process",
    label: "Export process steps",
    description: "The six steps, with the timeline a buyer can plan against.",
    itemLabel: "step",
    titleField: "title",
    fields: [
      { key: "step", label: "Number", type: "text", placeholder: "01" },
      { key: "title", label: "Title", type: "text" },
      { key: "timeline", label: "Expected", type: "text", placeholder: "Within 48 hours" },
      { key: "body", label: "Body", type: "textarea", wide: true },
    ],
    blank: () => ({ step: "07", title: "New step", timeline: "", body: "" }),
  },
  {
    key: "quality_stages",
    label: "Quality stages",
    description: "The six-stage process on the Quality page.",
    itemLabel: "stage",
    titleField: "title",
    fields: [
      { key: "stage", label: "Number", type: "text", placeholder: "01" },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea", wide: true },
    ],
    blank: () => ({ stage: "07", title: "New stage", body: "" }),
  },
  {
    key: "faqs",
    label: "Buyer FAQs",
    description: "Also emitted as FAQ structured data, so search engines can show them directly.",
    itemLabel: "question",
    titleField: "question",
    fields: [
      { key: "question", label: "Question", type: "text", wide: true },
      { key: "answer", label: "Answer", type: "textarea", wide: true },
    ],
    blank: () => ({ question: "New question", answer: "" }),
  },
  {
    key: "regions",
    label: "Regions served",
    description: "Shown on Global reach. Countries and verticals are comma separated.",
    itemLabel: "region",
    titleField: "region",
    fields: [
      { key: "region", label: "Region", type: "text" },
      { key: "countries", label: "Countries", type: "list", wide: true, hint: "Comma separated." },
      { key: "verticals", label: "Ranges shipped", type: "list", wide: true, hint: "Comma separated." },
    ],
    blank: () => ({ region: "New region", countries: [], verticals: [] }),
  },
];

export function getCollection(key: string): CollectionSchema | undefined {
  return COLLECTIONS.find((collection) => collection.key === key);
}

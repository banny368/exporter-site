/**
 * The four fields a WhatsApp message quotes. Declared structurally rather than as
 * `Product` so a trimmed ProductSummary from a card can open a chat without dragging
 * the whole record — and the full record still satisfies it.
 */
export interface WhatsAppProduct {
  name: string;
  variety: string;
  hs_code: string;
  slug: string;
}

/**
 * Every wa.me URL on the site is built here. Nothing string-concatenates a WhatsApp
 * link inline: the message shape is a contract with the sales team, and the encoding
 * is easy to get subtly wrong in a way that only shows up as a mangled message on
 * someone's phone.
 */

export interface WhatsAppRequirement {
  quantity?: string;
  destinationPort?: string;
  incoterm?: string;
}

export interface WhatsAppInquiry {
  name?: string;
  company?: string;
  country?: string;
  email?: string;
  phone?: string;
  message?: string;
}

export interface WhatsAppOptions {
  /** Raw number from site settings. Punctuation is stripped before use. */
  phone: string;
  companyName: string;
  /** Single-product inquiry, from a card or a product page. */
  product?: WhatsAppProduct;
  /** Multi-product RFQ list. Takes precedence over `product` when both are given. */
  items?: { product: WhatsAppProduct; quantity?: string }[];
  requirement?: WhatsAppRequirement;
  inquiry?: WhatsAppInquiry;
  /** Absolute URL of the page the buyer was on. */
  pageUrl?: string;
}

const INCOTERM_LABEL = "Incoterm (FOB/CIF/CFR)";

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** `Label: value`, or a bare `Label:` when the buyer has not filled it in yet. */
function field(label: string, value?: string): string {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : `${label}:`;
}

function filledFields(entries: [string, string | undefined][]): string[] {
  return entries
    .filter(([, value]) => Boolean(value?.trim()))
    .map(([label, value]) => `${label}: ${value!.trim()}`);
}

function requirementBlock(
  requirement: WhatsAppRequirement | undefined,
  { allowBlank }: { allowBlank: boolean },
): string[] {
  if (allowBlank) {
    return [
      "My requirement:",
      field("Quantity", requirement?.quantity),
      field("Destination port", requirement?.destinationPort),
      field(INCOTERM_LABEL, requirement?.incoterm),
    ];
  }

  const filled = filledFields([
    ["Quantity", requirement?.quantity],
    ["Destination port", requirement?.destinationPort],
    [INCOTERM_LABEL, requirement?.incoterm],
  ]);

  return filled.length ? ["My requirement:", ...filled] : [];
}

export function buildWhatsAppMessage(options: WhatsAppOptions): string {
  const { companyName, product, items, requirement, inquiry, pageUrl } = options;
  const blocks: string[] = [`Hello ${companyName},`];

  if (items?.length) {
    blocks.push("I would like a quotation for the following products:");

    items.forEach((item, index) => {
      const lines = [
        `${index + 1}. ${item.product.name}`,
        `   HS Code: ${item.product.hs_code}`,
      ];
      if (item.quantity?.trim()) lines.push(`   Quantity: ${item.quantity.trim()}`);
      blocks.push(lines.join("\n"));
    });

    // Quantity is already stated per line above, so it is dropped from the shared block.
    const shared = filledFields([
      ["Destination port", requirement?.destinationPort],
      [INCOTERM_LABEL, requirement?.incoterm],
    ]);
    if (shared.length) blocks.push(shared.join("\n"));
  } else if (product) {
    blocks.push("I am interested in the following product:");
    blocks.push(
      [
        `Product: ${product.name}`,
        `Variety/Grade: ${product.variety}`,
        `HS Code: ${product.hs_code}`,
      ].join("\n"),
    );
    blocks.push(requirementBlock(requirement, { allowBlank: true }).join("\n"));
  } else {
    blocks.push("I would like to discuss an export requirement.");
    blocks.push(requirementBlock(requirement, { allowBlank: true }).join("\n"));
  }

  if (inquiry) {
    const details = filledFields([
      ["Name", inquiry.name],
      ["Company", inquiry.company],
      ["Country", inquiry.country],
      ["Email", inquiry.email],
      ["Phone", inquiry.phone],
    ]);
    if (details.length) blocks.push(["My details:", ...details].join("\n"));
    if (inquiry.message?.trim()) blocks.push(inquiry.message.trim());
  }

  if (pageUrl?.trim()) blocks.push(`Page: ${pageUrl.trim()}`);

  return blocks.filter(Boolean).join("\n\n");
}

/**
 * @throws when the number has no digits — better a loud failure in development than a
 * button that silently opens an empty WhatsApp chat in front of a buyer.
 */
export function buildWhatsAppLink(options: WhatsAppOptions): string {
  const number = digitsOnly(options.phone);
  if (!number) {
    throw new Error("buildWhatsAppLink: no digits in the configured WhatsApp number");
  }

  const text = encodeURIComponent(buildWhatsAppMessage(options));
  return `https://wa.me/${number}?text=${text}`;
}

/** Same message, delivered by email, for buyers who do not use WhatsApp. */
export function buildMailtoLink(
  email: string,
  subject: string,
  options: WhatsAppOptions,
): string {
  const body = encodeURIComponent(buildWhatsAppMessage(options));
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
}

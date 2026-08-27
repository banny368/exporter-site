import { site } from "@/lib/site";
import { absoluteUrl } from "@/lib/paths";
import type { Product } from "@/lib/types";

/**
 * Structured data is emitted from the seed settings rather than the browser store:
 * crawlers read the static HTML, and that HTML must describe the deployed company,
 * not one demo visitor's local edits.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Content is our own data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: site.company.name,
        legalName: site.company.legal_name,
        description: site.company.blurb,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/site/logo.svg"),
        address: {
          "@type": "PostalAddress",
          streetAddress: site.contact.address_lines.slice(0, 2).join(", "),
          addressLocality: site.contact.address_lines[2] ?? "",
          addressCountry: "IN",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: site.contact.email,
            telephone: site.contact.phone,
            areaServed: site.markets,
            availableLanguage: ["English", "Hindi"],
          },
        ],
        sameAs: [...site.socials, ...site.marketplaces].map((link) => link.url),
      }}
    />
  );
}

export function ProductJsonLd({ product }: { product: Product }) {
  const primary = product.images.find((image) => image.is_primary) ?? product.images[0];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.short_description,
        sku: product.hs_code,
        category: product.sub_category,
        image: primary ? absoluteUrl(primary.url) : undefined,
        countryOfOrigin: { "@type": "Country", name: "India" },
        brand: { "@type": "Organization", name: site.company.name },
        additionalProperty: [
          { "@type": "PropertyValue", name: "HS Code", value: product.hs_code },
          { "@type": "PropertyValue", name: "Origin", value: product.origin },
          { "@type": "PropertyValue", name: "Season", value: product.season },
          { "@type": "PropertyValue", name: "Minimum order quantity", value: product.moq },
          { "@type": "PropertyValue", name: "Packing", value: product.packing },
          { "@type": "PropertyValue", name: "Incoterms", value: product.incoterms },
        ],
      }}
    />
  );
}

export function BreadcrumbJsonLd({ trail }: { trail: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: absoluteUrl(crumb.href),
        })),
      }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      }}
    />
  );
}

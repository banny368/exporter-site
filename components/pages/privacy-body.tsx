"use client";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/ui/section";
import { useSiteSettings } from "@/components/providers/store-provider";

/**
 * Written to describe what this build actually does. The demo has no server, so an
 * inquiry never leaves the visitor's browser — say that plainly rather than copying a
 * generic policy that claims otherwise. Revise this page when a real form endpoint,
 * analytics ID or CRM is connected.
 */

export function PrivacyBody() {
  const site = useSiteSettings();

  const SECTIONS: { heading: string; body: string[] }[] = [
    {
      heading: "Who we are",
      body: [
        `This website is operated by ${site.company.legal_name}, an export house registered in India. For any question about this policy or about data we hold, write to ${site.contact.email}.`,
      ],
    },
    {
      heading: "What we collect",
      body: [
        "When you send an inquiry we collect the name, company, country, email, phone number, product interest, quantity, destination port, Incoterm and message that you type into the form. We ask for these because we cannot quote an export price without them.",
        "If you accept analytics cookies we also collect standard measurement data: pages viewed, approximate region, referring site, device type, and which products generate the most inquiry clicks. This is aggregate and is not used to identify you.",
      ],
    },
    {
      heading: "How this demo build handles inquiries",
      body: [
        "This site is currently deployed as a static demonstration with no server component. An inquiry submitted through the form is stored in your own browser's local storage so the admin panel can demonstrate the inquiry pipeline. It is not transmitted to us, to any third party, or to any other device.",
        "Clearing your browser data removes it permanently. When the site goes live with a real form endpoint, this section will be replaced with the actual processing, retention and transfer details.",
      ],
    },
    {
      heading: "Cookies and similar technologies",
      body: [
        "No analytics or advertising cookie is set until you accept them in the banner. If you reject them, no measurement script loads at all — we do not run analytics on a legitimate-interest basis.",
        "We store two things in your browser regardless of consent, because the site cannot work without them: your cookie choice, and your RFQ list. Both are functional, stay on your device, and are never transmitted.",
        "The Google Maps panel on the contact page is not loaded until you accept cookies or press the button to load it, because Google sets its own cookies when the map renders.",
      ],
    },
    {
      heading: "Legal basis for processing",
      body: [
        "For inquiries: performance of a contract, or steps taken at your request before entering into one. For analytics: your consent, which you may withdraw at any time by clearing this site's data in your browser.",
      ],
    },
    {
      heading: "Sharing and international transfer",
      body: [
        "We do not sell personal data. Inquiry details are shared only where a shipment requires it — with a freight forwarder, a testing laboratory, an inspection agency or a customs broker acting on your consignment.",
        "We are based in India. If you are in the EEA or the UK, sending us an inquiry involves a transfer of your data to India, which is a country without an EU adequacy decision. We handle it under the standard contractual clauses where a customer requires them.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "Inquiry records are kept for three years from the last contact, so we can honour a repeat order on the terms previously agreed. Shipment documentation is kept for eight years, as Indian customs and tax law requires. Analytics data is retained for fourteen months.",
      ],
    },
    {
      heading: "Your rights",
      body: [
        "You may ask for a copy of the data we hold about you, ask us to correct it, ask us to delete it, object to processing, or ask for it in a portable format. Write to the email address above and we will respond within thirty days.",
        "If you are in the EEA or the UK you may also complain to your national supervisory authority. In India you may raise a grievance under the Digital Personal Data Protection Act with the same contact address.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "We will update this page when the site's processing changes — in particular when the inquiry form begins transmitting to a server. The date of the most recent change is shown at the top of this page.",
      ],
    },
  ];

  return (
    <>
      <PageHero
        imageSlot="site.privacy"
        eyebrow="Legal"
        title="Privacy policy"
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Privacy", href: "/privacy" },
        ]}
        lead={
          <p>
            Written to describe what this website actually does, rather than what a
            template says. Last updated when this demo was built.
          </p>
        }
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <nav aria-label="On this page" className="sticky top-24">
              <h2 className="mono-label border-t border-brass/30 pt-4">Contents</h2>
              <ol className="mt-4 grid gap-2" role="list">
                {SECTIONS.map((section, index) => (
                  <li key={section.heading}>
                    <a
                      href={`#s${index + 1}`}
                      className="text-[0.875rem] leading-snug hover:text-brass-ink"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="grid max-w-3xl gap-10 lg:col-span-9">
            {SECTIONS.map((section, index) => (
              <section key={section.heading} id={`s${index + 1}`} className="scroll-mt-28">
                <h2 className="text-[1.375rem] leading-snug">{section.heading}</h2>
                <div className="mt-4 grid gap-4">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-[1.0625rem] leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

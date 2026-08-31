import type { Metadata } from "next";
import { canonicalFor, withBase } from "@/lib/paths";
import { ContactBody } from "@/components/pages/contact-body";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Send a product, quantity, destination port and Incoterm and get a written quotation within 48 hours. WhatsApp, phone and email, Mon–Sat 9:30 AM – 7:00 PM IST.",
  openGraph: { images: [withBase("/og/default.png")] },
  alternates: canonicalFor("/contact/"),
};

export default function ContactPage() {
  return <ContactBody />;
}

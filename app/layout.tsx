import type { Metadata } from "next";
import { FONT_VARIABLES } from "@/lib/fonts";
import type { ReactNode } from "react";
import { StoreProvider } from "@/components/providers/store-provider";
import { ThemeStyle } from "@/components/providers/theme-style";
import { WhatsAppDialogProvider } from "@/components/whatsapp/whatsapp-dialog-provider";
import { site } from "@/lib/site";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: `${site.company.name} — Indian exporter of fresh produce, spices and furniture`,
    template: `%s — ${site.company.name}`,
  },
  description: site.company.blurb,
  applicationName: site.company.name,
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${FONT_VARIABLES} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <ThemeStyle />
          <WhatsAppDialogProvider>{children}</WhatsAppDialogProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

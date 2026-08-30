import type { Metadata } from "next";
import { FONT_VARIABLES } from "@/lib/fonts";
import type { ReactNode } from "react";
import { StoreProvider } from "@/components/providers/store-provider";
import { ThemeStyle } from "@/components/providers/theme-style";
import { WhatsAppDialogProvider } from "@/components/whatsapp/whatsapp-dialog-provider";
import { siteOrigin } from "@/lib/paths";
import { site } from "@/lib/site";
import "./globals.css";

// Resolved through the same helper as canonicals and the sitemap, so metadataBase and
// absoluteUrl() can never disagree about what this deployment's origin is.
const origin = siteOrigin();

export const metadata: Metadata = {
  metadataBase: origin ? new URL(origin) : undefined,
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

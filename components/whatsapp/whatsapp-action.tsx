"use client";

import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import { useWhatsAppDialog } from "./whatsapp-dialog-provider";
import { buildWhatsAppLink, type WhatsAppOptions, type WhatsAppProduct } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./whatsapp-icon";

/**
 * Every WhatsApp action on the site goes through here.
 *
 * While the site still carries a placeholder number, clicking shows the exact message
 * that would be sent instead of opening a dead wa.me chat — the buyer-facing behaviour is
 * demonstrated without a broken link in front of a client. Once a real number is set in
 * Site settings, the same button navigates to WhatsApp.
 *
 * This is now just a button. The preview modal lives once at app level rather than once
 * per card; sixteen dialog roots on the products listing were sixteen React trees for a
 * modal only one of them could ever open.
 */

export interface WhatsAppActionProps
  extends Pick<WhatsAppOptions, "product" | "items" | "requirement" | "inquiry"> {
  /** Where the click came from, recorded against the analytics event. */
  source: string;
  label?: ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  onSent?: () => void;
}

function currentPageUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.href;
}

export function WhatsAppAction({
  product,
  items,
  requirement,
  inquiry,
  source,
  label = "Chat on WhatsApp",
  variant = "whatsapp",
  size = "md",
  className,
  onSent,
}: WhatsAppActionProps) {
  const { settings, trackEvent } = useStore();
  const { openPreview } = useWhatsAppDialog();

  function handleClick() {
    const options: WhatsAppOptions = {
      phone: settings.contact.whatsapp,
      companyName: settings.company.name,
      product,
      items,
      requirement,
      inquiry,
      pageUrl: currentPageUrl(),
    };

    trackEvent("whatsapp_click", { source, productSlug: product?.slug });
    onSent?.();

    if (!settings.contact.whatsapp_configured) {
      openPreview(options, product ? `Inquiry — ${product.name}` : "Export inquiry");
      return;
    }

    window.open(buildWhatsAppLink(options), "_blank", "noopener,noreferrer");
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      <WhatsAppIcon className="size-4" />
      {label}
    </Button>
  );
}

/** Icon-only variant for product cards, where a full button would crowd the grid. */
export function WhatsAppIconAction({
  product,
  source,
  className,
}: {
  product: WhatsAppProduct;
  source: string;
  className?: string;
}) {
  return (
    <WhatsAppAction
      product={product}
      source={source}
      label={<span className="sr-only">Inquire about {product.name} on WhatsApp</span>}
      className={cn("w-11 px-0", className)}
    />
  );
}

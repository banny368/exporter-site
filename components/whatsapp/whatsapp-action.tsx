"use client";

import { useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useStore } from "@/components/providers/store-provider";
import { buildWhatsAppLink, buildWhatsAppMessage, type WhatsAppOptions } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./whatsapp-icon";

/**
 * Every WhatsApp action on the site goes through here.
 *
 * While the demo still carries a placeholder number, clicking shows the exact message
 * that would be sent instead of opening a dead wa.me chat — the buyer-facing behaviour
 * is demonstrated without a broken link in front of a client. Once a real number is set
 * in Site Settings, the same button navigates to WhatsApp.
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const options: WhatsAppOptions = {
    phone: settings.contact.whatsapp,
    companyName: settings.company.name,
    product,
    items,
    requirement,
    inquiry,
    pageUrl: currentPageUrl(),
  };

  const message = buildWhatsAppMessage(options);
  const configured = settings.contact.whatsapp_configured;

  function handleClick() {
    trackEvent("whatsapp_click", { source, productSlug: product?.slug });
    onSent?.();

    if (!configured) {
      setPreviewOpen(true);
      return;
    }

    window.open(buildWhatsAppLink(options), "_blank", "noopener,noreferrer");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={handleClick}>
        <WhatsAppIcon className="size-4" />
        {label}
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          title="WhatsApp message preview"
          description="This is exactly what WhatsApp opens with. Add a real WhatsApp number in Site Settings and this button will send it."
        >
          <pre className="max-h-64 overflow-auto rounded-crate border border-brass/25 bg-harbour/[0.03] p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-harbour">
            {message}
          </pre>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" size="sm" onClick={copyMessage}>
              {copied ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy message"}
            </Button>
            <a
              href={`mailto:${settings.contact.email}?subject=${encodeURIComponent(
                product ? `Inquiry — ${product.name}` : "Export inquiry",
              )}&body=${encodeURIComponent(message)}`}
              className="inline-flex h-9 items-center rounded-crate border border-harbour/25 px-3.5 text-[0.8125rem] font-medium text-harbour transition-colors hover:border-harbour/60 hover:bg-harbour/5"
            >
              Send by email instead
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Icon-only variant for product cards, where a full button would crowd the grid. */
export function WhatsAppIconAction({
  product,
  source,
  className,
}: {
  product: Product;
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

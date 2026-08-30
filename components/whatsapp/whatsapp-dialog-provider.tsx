"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useSiteSettings } from "@/components/providers/store-provider";
import { buildWhatsAppMessage, type WhatsAppOptions } from "@/lib/whatsapp";

/**
 * One WhatsApp preview dialog for the whole app.
 *
 * Every product card used to carry its own — sixteen Radix dialog roots on the products
 * listing, eight on the home page, each with its own state and effects, all to show a
 * modal that only one of them can ever open. The cards now just ask this provider to
 * open, and the single dialog renders the message it is given.
 */

interface WhatsAppDialogValue {
  openPreview: (options: WhatsAppOptions, subject: string) => void;
}

const WhatsAppDialogContext = createContext<WhatsAppDialogValue | null>(null);

export function WhatsAppDialogProvider({ children }: { children: ReactNode }) {
  const settings = useSiteSettings();
  const [pending, setPending] = useState<{ options: WhatsAppOptions; subject: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const openPreview = useCallback((options: WhatsAppOptions, subject: string) => {
    setCopied(false);
    setPending({ options, subject });
  }, []);

  const value = useMemo(() => ({ openPreview }), [openPreview]);
  const message = pending ? buildWhatsAppMessage(pending.options) : "";

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
    <WhatsAppDialogContext.Provider value={value}>
      {children}

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent
          title="WhatsApp message preview"
          description="This is exactly what WhatsApp opens with. Add a real WhatsApp number in Site settings and this button will send it."
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
                pending?.subject ?? "Export inquiry",
              )}&body=${encodeURIComponent(message)}`}
              className="inline-flex h-9 items-center rounded-crate border border-harbour/25 px-3.5 text-[0.8125rem] font-medium text-harbour transition-colors hover:border-harbour/60 hover:bg-harbour/5"
            >
              Send by email instead
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </WhatsAppDialogContext.Provider>
  );
}

export function useWhatsAppDialog(): WhatsAppDialogValue {
  const context = useContext(WhatsAppDialogContext);
  // The provider wraps the whole app; falling back keeps a stray usage from crashing.
  return context ?? { openPreview: () => {} };
}

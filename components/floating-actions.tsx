"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { buildWhatsAppLink, buildWhatsAppMessage } from "@/lib/whatsapp";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useClientValue, useModalOpen, usePrefersReducedMotion } from "@/lib/client-hooks";
import { WhatsAppIcon } from "./whatsapp/whatsapp-icon";

/**
 * The two persistent conversion affordances, stacked above the mobile safe area.
 *
 * They hide while a modal is open — Radix locks body pointer events, and a floating
 * button sitting over a dialog is the kind of detail that makes a demo feel unfinished.
 */

const PULSE_KEY = "exporter-demo:pulsed";

/** Pulses once per session, and never when the visitor asks for reduced motion. */
function useFirstVisitPulse(): boolean {
  const reduced = usePrefersReducedMotion();
  const firstVisit = useClientValue(() => {
    try {
      return !window.sessionStorage.getItem(PULSE_KEY);
    } catch {
      // Private mode — pulse once and move on.
      return true;
    }
  }, false);

  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (reduced || !firstVisit) return;

    try {
      window.sessionStorage.setItem(PULSE_KEY, "1");
    } catch {
      /* nothing to persist — the pulse just repeats next load */
    }

    const timer = window.setTimeout(() => setExpired(true), 6000);
    return () => window.clearTimeout(timer);
  }, [reduced, firstVisit]);

  return firstVisit && !reduced && !expired;
}

export function FloatingActions() {
  const { settings, rfq, hydrated, trackEvent } = useStore();
  const modalOpen = useModalOpen();
  const pulse = useFirstVisitPulse();
  const [previewOpen, setPreviewOpen] = useState(false);

  if (modalOpen) return null;

  const options = {
    phone: settings.contact.whatsapp,
    companyName: settings.company.name,
    pageUrl: typeof window === "undefined" ? undefined : window.location.href,
  };

  function handleClick() {
    trackEvent("whatsapp_click", { source: "floating-button" });
    if (!settings.contact.whatsapp_configured) {
      setPreviewOpen(true);
      return;
    }
    window.open(buildWhatsAppLink(options), "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <div className="pointer-events-none fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3 pb-[env(safe-area-inset-bottom)] md:right-6 md:bottom-6">
        {hydrated && rfq.length > 0 ? (
          <Link
            href="/rfq"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-crate border border-brass/50 bg-harbour px-3.5 py-2.5 text-[0.8125rem] font-medium text-kraft shadow-lg transition-colors hover:bg-harbour-soft"
          >
            <ClipboardList className="size-4" aria-hidden="true" />
            RFQ list
            <span className="rounded-crate bg-amber px-1.5 py-0.5 font-mono text-[0.6875rem] text-harbour">
              {rfq.length}
            </span>
          </Link>
        ) : null}

        <div className="pointer-events-auto group relative flex items-center">
          <span className="pointer-events-none absolute right-full mr-3 hidden rounded-crate border border-brass/30 bg-harbour px-3 py-2 text-[0.8125rem] whitespace-nowrap text-kraft opacity-0 transition-opacity group-hover:opacity-100 md:block">
            Chat with our export team
          </span>

          {pulse ? (
            <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" />
          ) : null}

          <button
            type="button"
            onClick={handleClick}
            className="relative flex size-14 items-center justify-center rounded-full bg-[#25D366] text-[#062514] shadow-lg transition-colors hover:bg-[#1FBF5B] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass"
          >
            <WhatsAppIcon className="size-7" />
            <span className="sr-only">Chat with our export team on WhatsApp</span>
          </button>
        </div>

        <p className="pointer-events-none hidden max-w-[15rem] text-right font-mono text-[0.625rem] leading-relaxed tracking-[0.06em] text-slate-soft md:block">
          {settings.contact.hours}
        </p>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          title="WhatsApp message preview"
          description="Add a real WhatsApp number in Site Settings and this button will open WhatsApp with this message."
        >
          <pre className="rounded-crate border border-brass/25 bg-harbour/[0.03] p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-harbour">
            {buildWhatsAppMessage(options)}
          </pre>
          <div className="mt-5">
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${settings.contact.email}`}>Email us instead</a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

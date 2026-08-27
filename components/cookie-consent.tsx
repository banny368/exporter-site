"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readConsent, writeConsent } from "@/lib/analytics";
import { useClientValue } from "@/lib/client-hooks";

/**
 * European buyers are a core market, so consent is not optional. Analytics stays off
 * until the visitor accepts, and the banner renders only after mount so the static
 * HTML and the first client render agree.
 */
export function CookieConsent() {
  // The server snapshot says "already decided", so the static HTML ships without the
  // banner and it appears on hydration only for visitors who have not chosen yet.
  const alreadyDecided = useClientValue(() => readConsent() !== null, true);
  const [dismissed, setDismissed] = useState(false);

  if (alreadyDecided || dismissed) return null;

  function decide(value: "accepted" | "rejected") {
    writeConsent(value);
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-brass/40 bg-harbour text-kraft"
    >
      <div className="page-shell flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-kraft/80">
          We use cookies only to measure how buyers find and use this site. Nothing is
          loaded until you choose. Read what we collect in our{" "}
          <Link href="/privacy" className="text-brass underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-3">
          <Button variant="onDark" size="sm" onClick={() => decide("rejected")}>
            Reject analytics
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}

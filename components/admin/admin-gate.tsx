"use client";

import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientValue } from "@/lib/client-hooks";

/**
 * A passcode gate, not authentication.
 *
 * GitHub Pages serves static files with no server to check anything, so this keeps the
 * admin screens out of the way during a demo and nothing more. The banner in the layout
 * says so in the interface itself — a client must not be left thinking this protects
 * real data. Real auth arrives with the Supabase build, as middleware plus RLS.
 */
const PASSCODE = process.env.NEXT_PUBLIC_ADMIN_PASSCODE || "demo1234";
const SESSION_KEY = "exporter-demo:v1:admin";

export function AdminGate({ children }: { children: ReactNode }) {
  const alreadyUnlocked = useClientValue(() => {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Private mode — the passcode is simply asked for again.
      return false;
    }
  }, false);

  const [unlockedHere, setUnlockedHere] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  if (!alreadyUnlocked && !unlockedHere) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-harbour px-5">
        <div className="w-full max-w-md rounded-crate border border-brass/30 bg-paper p-8">
          <Lock className="size-5 text-brass-ink" aria-hidden="true" />
          <h1 className="mt-5 text-[1.5rem] leading-snug">Admin panel</h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed">
            Enter the demo passcode to open the product, inquiry and settings screens.
          </p>

          <form
            className="mt-7 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (value !== PASSCODE) {
                setError("That passcode is not right. Check the README, or ask whoever sent you the link.");
                return;
              }
              try {
                window.sessionStorage.setItem(SESSION_KEY, "1");
              } catch {
                /* not fatal — the session just will not persist across tabs */
              }
              setUnlockedHere(true);
            }}
          >
            <div className="grid gap-2">
              <label htmlFor="passcode" className="mono-label">
                Passcode
              </label>
              <input
                id="passcode"
                type="password"
                autoComplete="current-password"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                  setError("");
                }}
                className="w-full rounded-crate border border-harbour/20 bg-paper px-3.5 py-2.5 text-[0.9375rem] focus-visible:border-brass"
              />
            </div>

            {error ? (
              <p role="alert" className="text-[0.8125rem] leading-relaxed text-[#9B2C1B]">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg">
              Open admin panel
            </Button>
          </form>

          <p className="mono-label mt-6 leading-relaxed normal-case tracking-[0.04em]">
            Demo mode. This passcode is not authentication — it only hides these screens
            during a demo. Anything you change is saved in this browser alone.
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

export function adminSignOut() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}

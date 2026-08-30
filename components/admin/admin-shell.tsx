"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Images,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Package,
  Palette,
  RotateCcw,
  ScrollText,
  Settings,
  Tags,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useStore } from "@/components/providers/store-provider";
import { adminSignOut } from "./admin-gate";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
  { href: "/admin/branding", label: "Branding", icon: Palette },
  { href: "/admin/sections", label: "Sections", icon: LayoutTemplate },
  { href: "/admin/settings", label: "Site settings", icon: Settings },
  { href: "/admin/media", label: "Media library", icon: Images },
  { href: "/admin/activity", label: "Activity log", icon: ScrollText },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { inquiries, resetToSeed, settings } = useStore();
  const [resetOpen, setResetOpen] = useState(false);

  const unread = inquiries.filter((inquiry) => inquiry.status === "new").length;

  return (
    <div className="flex min-h-screen flex-col bg-paper lg:flex-row">
      <aside className="border-b border-brass/25 bg-harbour lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block">
          <div>
            <p className="font-display text-[1.0625rem] font-semibold text-kraft">
              {settings.company.name}
            </p>
            <p className="mono-label mt-1 text-brass">Admin panel</p>
          </div>

          <Link
            href="/"
            className="mono-label text-kraft/60 transition-colors hover:text-kraft lg:hidden"
          >
            View site
          </Link>
        </div>

        <nav aria-label="Admin" className="px-3 pb-4 lg:px-3">
          <ul className="flex gap-1 overflow-x-auto lg:grid lg:gap-0.5 lg:overflow-visible" role="list">
            {NAV.map((item) => {
              const active =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-crate px-3 py-2.5 text-[0.9375rem] whitespace-nowrap transition-colors",
                      active
                        ? "bg-kraft/12 text-kraft"
                        : "text-kraft/70 hover:bg-kraft/8 hover:text-kraft",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {item.label}
                    {item.href === "/admin/inquiries" && unread > 0 ? (
                      <span className="ml-auto rounded-crate bg-amber px-1.5 py-0.5 font-mono text-[0.625rem] text-harbour">
                        {unread}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden border-t border-brass/25 p-3 lg:block">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-crate px-3 py-2.5 text-[0.9375rem] text-kraft/70 transition-colors hover:bg-kraft/8 hover:text-kraft"
          >
            <LogOut className="size-4" aria-hidden="true" />
            View public site
          </Link>

          <button
            type="button"
            onClick={() => {
              adminSignOut();
              window.location.reload();
            }}
            className="flex w-full items-center gap-2.5 rounded-crate px-3 py-2.5 text-left text-[0.9375rem] text-kraft/70 transition-colors hover:bg-kraft/8 hover:text-kraft"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Lock the panel
          </button>

          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger className="flex w-full items-center gap-2.5 rounded-crate px-3 py-2.5 text-left text-[0.9375rem] text-kraft/70 transition-colors hover:bg-kraft/8 hover:text-kraft">
              <RotateCcw className="size-4" aria-hidden="true" />
              Reset to seed data
            </DialogTrigger>
            <DialogContent
              title="Reset to seed data"
              description="Every product edit, category change, settings change, saved inquiry and uploaded image in this browser is discarded and the demo returns to how it shipped."
            >
              <p className="text-[0.9375rem] leading-relaxed">
                Use this before showing the demo to someone new. It cannot be undone, and
                it only affects this browser.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  onClick={() => {
                    resetToSeed();
                    setResetOpen(false);
                  }}
                >
                  Reset everything
                </Button>
                <Button variant="outline" onClick={() => setResetOpen(false)}>
                  Keep my changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="border-b border-brass/30 bg-amber/15 px-5 py-2.5 font-mono text-[0.75rem] leading-relaxed tracking-[0.04em] text-harbour md:px-8">
          Demo mode — this passcode is not authentication, and changes are saved in this
          browser only. Connect Supabase before relying on it.
        </p>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

/** Shared page heading for admin screens. */
export function AdminHeader({
  title,
  lead,
  action,
}: {
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-brass/25 pb-6">
      <div>
        <h1 className="text-[1.75rem] leading-snug">{title}</h1>
        {lead ? <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed">{lead}</p> : null}
      </div>
      {action}
    </div>
  );
}

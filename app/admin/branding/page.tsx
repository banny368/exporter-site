"use client";

import Image from "next/image";
import { useState } from "react";
import { AlertTriangle, Check, RotateCcw } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/components/providers/store-provider";
import { fileToStoredImage, putMedia } from "@/lib/store";
import { FONT_PAIRS, getFontPair } from "@/lib/fonts";
import {
  COLOR_ROLE_LABELS,
  DEFAULT_THEME,
  auditPalette,
  contrastRatio,
  deriveInk,
  normaliseHex,
  type ColorRole,
} from "@/lib/theme";

const ROLES = Object.keys(DEFAULT_THEME.colors) as ColorRole[];

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3 py-2 font-mono text-[0.8125rem] focus-visible:border-brass-ink";

export default function AdminBrandingPage() {
  const { settings, saveSettings } = useStore();
  const [logoError, setLogoError] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const colors = settings.theme?.colors ?? {};
  const resolved = { ...DEFAULT_THEME.colors, ...colors };
  const audit = auditPalette(colors);
  const failures = audit.filter((row) => !row.passes);

  function setColor(role: ColorRole, value: string) {
    const hex = normaliseHex(value);
    if (!hex) return;
    saveSettings({ theme: { colors: { ...colors, [role]: hex } } });
  }

  function resetColor(role: ColorRole) {
    const next = { ...colors };
    delete next[role];
    saveSettings({ theme: { colors: next } });
  }

  async function onLogoFile(file: File | undefined) {
    if (!file) return;
    setLogoError("");
    setLogoBusy(true);
    try {
      const record = await fileToStoredImage(file, 640);
      await putMedia(record);
      setLogoPreview(record.dataUrl);
      saveSettings({ branding: { ...settings.branding, logo_media_id: record.id } });
    } catch (error) {
      setLogoError(error instanceof Error ? error.message : "That file could not be read.");
    } finally {
      setLogoBusy(false);
    }
  }

  return (
    <>
      <AdminHeader
        title="Branding"
        lead="Logo, colours and typography. Changes apply across the site immediately in this browser; use Export settings to publish them to real visitors."
      />

      <section className="mb-12">
        <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Logo</h2>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="grid gap-5">
            <div className="grid gap-2">
              <label htmlFor="logo-file" className="mono-label">
                Upload a logo
              </label>
              <input
                id="logo-file"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={(event) => void onLogoFile(event.target.files?.[0])}
                className="block w-full text-[0.875rem] file:mr-3 file:rounded-crate file:border file:border-harbour/25 file:bg-paper file:px-3 file:py-2 file:text-[0.8125rem] file:text-harbour"
              />
              <p className="text-[0.8125rem] text-slate-soft">
                Resized to 640px on its longest edge and stored in this browser. A
                transparent PNG or SVG sits best on the dark header.
              </p>
              {logoBusy ? <p className="mono-label">Processing…</p> : null}
              {logoError ? (
                <p role="alert" className="text-[0.8125rem] text-[#9B2C1B]">
                  {logoError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label htmlFor="logo-text" className="mono-label">
                Wordmark text
              </label>
              <input
                id="logo-text"
                value={settings.branding?.logo_text ?? ""}
                placeholder={settings.company.name}
                onChange={(event) =>
                  saveSettings({
                    branding: { ...settings.branding, logo_text: event.target.value },
                  })
                }
                className={FIELD}
              />
              <p className="text-[0.8125rem] text-slate-soft">
                Leave blank to use the company name from Site settings.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 text-[0.9375rem]">
              <input
                type="checkbox"
                checked={settings.branding?.show_mark ?? true}
                onChange={(event) =>
                  saveSettings({
                    branding: { ...settings.branding, show_mark: event.target.checked },
                  })
                }
                className="size-4 accent-brass"
              />
              Show the drawn crate mark beside the wordmark
            </label>

            {settings.branding?.logo_media_id ? (
              <Button
                variant="outline"
                size="sm"
                className="justify-self-start"
                onClick={() => {
                  setLogoPreview(null);
                  saveSettings({ branding: { ...settings.branding, logo_media_id: null } });
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Remove uploaded logo
              </Button>
            ) : null}
          </div>

          <div>
            <span className="mono-label mb-3 block">Preview on the header</span>
            <div className="flex items-center gap-3 rounded-crate bg-harbour p-5">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Uploaded logo preview"
                  width={160}
                  height={48}
                  unoptimized
                  className="h-12 w-auto object-contain"
                />
              ) : (
                <>
                  {settings.branding?.show_mark ?? true ? (
                    <span className="grid size-9 place-items-center rounded-crate border-2 border-brass text-brass">
                      ▲
                    </span>
                  ) : null}
                  <span className="font-display text-[1.0625rem] font-semibold text-kraft">
                    {settings.branding?.logo_text || settings.company.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-brass/25 pb-3">
          <h2 className="mono-label">Colours</h2>
          <Button variant="outline" size="sm" onClick={() => saveSettings({ theme: { colors: {} } })}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Reset all to default
          </Button>
        </div>

        {/*
          The guard. A free colour picker will otherwise ship an unreadable site, and the
          person choosing the colours is the least likely to notice.
        */}
        <div
          className={`mb-6 rounded-crate border p-4 ${
            failures.length ? "border-[#9B2C1B]/40 bg-[#9B2C1B]/5" : "border-brass/35 bg-brass/5"
          }`}
        >
          <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-harbour">
            {failures.length ? (
              <AlertTriangle className="size-4 text-[#9B2C1B]" aria-hidden="true" />
            ) : (
              <Check className="size-4 text-brass-ink" aria-hidden="true" />
            )}
            {failures.length
              ? `${failures.length} colour ${failures.length === 1 ? "pair fails" : "pairs fail"} the AA contrast minimum`
              : `All ${audit.length} colour pairs meet AA contrast`}
          </p>

          {failures.length ? (
            <ul className="mt-3 grid gap-1.5" role="list">
              {failures.map((row) => (
                <li key={`${row.foreground}-${row.background}`} className="text-[0.875rem]">
                  {row.label} —{" "}
                  <span className="font-mono">
                    {row.ratio}:1, needs {row.required}:1
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="list">
          {ROLES.map((role) => {
            const value = resolved[role];
            const changed = role in colors;
            const backdrop =
              role === "slate" || role === "slate-soft" || role === "brass-ink"
                ? resolved.paper
                : null;
            const needsInk = backdrop ? contrastRatio(value, backdrop) < 4.5 : false;

            return (
              <li key={role} className="rounded-crate border border-harbour/12 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="mono-label">{role}</p>
                    <p className="mt-1 text-[0.8125rem] text-slate-soft">
                      {COLOR_ROLE_LABELS[role]}
                    </p>
                  </div>
                  {changed ? (
                    <button
                      type="button"
                      onClick={() => resetColor(role)}
                      className="mono-label shrink-0 underline underline-offset-4 hover:text-harbour"
                    >
                      Reset
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="color"
                    aria-label={`${role} colour`}
                    value={value}
                    onChange={(event) => setColor(role, event.target.value)}
                    className="size-9 shrink-0 cursor-pointer rounded-crate border border-harbour/20 bg-paper"
                  />
                  <input
                    aria-label={`${role} hex value`}
                    value={value}
                    onChange={(event) => setColor(role, event.target.value)}
                    className={FIELD}
                  />
                </div>

                {needsInk && backdrop ? (
                  <button
                    type="button"
                    onClick={() => setColor(role, deriveInk(value, backdrop))}
                    className="mono-label mt-3 underline underline-offset-4 hover:text-harbour"
                  >
                    Darken until it passes AA
                  </button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="mono-label mb-4 border-b border-brass/25 pb-3">Typography</h2>
        <p className="mb-5 max-w-2xl text-[0.9375rem] leading-relaxed">
          Eight pairs, all self-hosted — switching one adds no external request and no
          flash of unstyled text. The monospace face carrying HS codes, MOQ and port names
          is fixed, because it is part of the identity rather than a style choice.
        </p>

        <ul className="grid gap-4 md:grid-cols-2" role="list">
          {FONT_PAIRS.map((pair) => {
            const active = getFontPair(settings.typography?.pair_id).id === pair.id;

            return (
              <li key={pair.id}>
                <button
                  type="button"
                  onClick={() => saveSettings({ typography: { pair_id: pair.id } })}
                  aria-pressed={active}
                  className={`w-full rounded-crate border p-5 text-left transition-colors ${
                    active ? "border-brass bg-brass/10" : "border-harbour/12 hover:border-harbour/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="mono-label">{pair.name}</span>
                    {active ? <Check className="size-4 text-brass-ink" aria-hidden="true" /> : null}
                  </div>

                  <p
                    className="mt-3 text-[1.5rem] leading-tight text-harbour"
                    style={{ fontFamily: pair.display }}
                  >
                    From Indian soil to your port
                  </p>
                  <p
                    className="mt-2 text-[0.9375rem] leading-relaxed"
                    style={{ fontFamily: pair.sans }}
                  >
                    Alphonso mango, HS 0804.50.20, one 20ft reefer, FOB Nhava Sheva.
                  </p>
                  <p className="mt-3 text-[0.8125rem] text-slate-soft">{pair.note}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

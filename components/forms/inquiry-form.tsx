"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppAction } from "@/components/whatsapp/whatsapp-action";
import { useStore } from "@/components/providers/store-provider";
import { COUNTRIES, INCOTERMS } from "@/lib/countries";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/lib/products";

/**
 * The inquiry form, used on the contact page and inside the Request-a-quote modal.
 *
 * There is no server on a static host, so a submission is saved into the browser store
 * — where it appears in the admin panel's inquiry pipeline, demonstrating the whole
 * flow — and the buyer is handed straight to WhatsApp or email, which is how these
 * conversations actually continue. Wiring a real form endpoint is one fetch call in
 * `onSubmit`; nothing else changes.
 */

const schema = z.object({
  name: z.string().trim().min(2, "Tell us who to address the quotation to."),
  company: z.string().trim().min(2, "We quote to a company — enter its registered name."),
  country: z.string().trim().min(1, "Choose your destination country."),
  email: z.string().trim().email("Enter an email we can send the quotation to."),
  phone: z.string().trim().optional(),
  quantity: z.string().trim().optional(),
  destination_port: z.string().trim().optional(),
  incoterm: z.string().trim().optional(),
  message: z.string().trim().max(2000, "Keep it under 2,000 characters.").optional(),
});

type FormValues = z.infer<typeof schema>;

const FIELD =
  "w-full rounded-crate border border-harbour/20 bg-paper px-3.5 py-2.5 text-[0.9375rem] " +
  "placeholder:text-slate-soft focus-visible:border-brass";

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={htmlFor} className="mono-label">
        {label}
        {required ? <span className="text-brass"> *</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-[0.8125rem] text-slate-soft">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-[0.8125rem] text-[#9B2C1B]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function InquiryForm({
  source,
  presetProducts = [],
  productOptions = [],
  className,
}: {
  source: string;
  presetProducts?: ProductSummary[];
  /** Every product the buyer may pick. Omitted in the quote modal, which presets one. */
  productOptions?: ProductSummary[];
  className?: string;
}) {
  const { addInquiry } = useStore();
  const [selected, setSelected] = useState<string[]>(presetProducts.map((p) => p.id));
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const catalogue = productOptions.length ? productOptions : presetProducts;
  const chosenProducts = catalogue.filter((product) => selected.includes(product.id));

  function onSubmit(values: FormValues) {
    addInquiry({
      name: values.name,
      company: values.company,
      country: values.country,
      email: values.email,
      phone: values.phone ?? "",
      message: values.message ?? "",
      product_ids: selected,
      quantity: values.quantity ?? "",
      destination_port: values.destination_port ?? "",
      incoterm: values.incoterm ?? "",
      source: "form",
      status: "new",
      internal_notes: "",
    });
    setSubmitted(values);
  }

  if (submitted) {
    return (
      <div className={cn("rounded-crate border border-brass/40 bg-kraft/60 p-6 md:p-8", className)}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brass-ink" aria-hidden="true" />
          <div>
            <h3 className="text-[1.25rem] leading-snug">Inquiry received</h3>
            <p className="mt-3 text-[0.9375rem] leading-relaxed">
              We reply to every inquiry within 24 hours, {site.contact.hours}. Your quotation
              goes to <span className="font-mono">{submitted.email}</span>.
            </p>
            <p className="mt-3 text-[0.9375rem] leading-relaxed">
              If you would rather not wait for email, continue the same conversation on
              WhatsApp — everything you just typed is already in the message.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <WhatsAppAction
                source={`${source}-handoff`}
                label="Continue on WhatsApp"
                items={chosenProducts.map((product) => ({ product }))}
                requirement={{
                  quantity: submitted.quantity,
                  destinationPort: submitted.destination_port,
                  incoterm: submitted.incoterm,
                }}
                inquiry={{
                  name: submitted.name,
                  company: submitted.company,
                  country: submitted.country,
                  email: submitted.email,
                  phone: submitted.phone,
                  message: submitted.message,
                }}
              />
              <Button variant="outline" onClick={() => setSubmitted(null)}>
                Send another inquiry
              </Button>
            </div>

            <p className="mono-label mt-6 normal-case tracking-[0.04em]">
              Demo note: this submission was saved in this browser and appears in the admin
              panel&rsquo;s inquiry pipeline. Connect a form endpoint before going live.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("grid gap-6", className)}>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required error={errors.name?.message}>
          <input id="name" autoComplete="name" className={FIELD} {...register("name")} />
        </Field>

        <Field label="Company" htmlFor="company" required error={errors.company?.message}>
          <input id="company" autoComplete="organization" className={FIELD} {...register("company")} />
        </Field>

        <Field label="Destination country" htmlFor="country" required error={errors.country?.message}>
          <select id="country" className={FIELD} defaultValue="" {...register("country")}>
            <option value="" disabled>
              Select a country
            </option>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.name}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Email" htmlFor="email" required error={errors.email?.message}>
          <input id="email" type="email" autoComplete="email" className={FIELD} {...register("email")} />
        </Field>

        <Field
          label="Phone or WhatsApp"
          htmlFor="phone"
          hint="Include your country code."
          error={errors.phone?.message}
        >
          <input id="phone" type="tel" autoComplete="tel" placeholder="+971 50 000 0000" className={FIELD} {...register("phone")} />
        </Field>

        <Field label="Required quantity" htmlFor="quantity" hint="Tonnes, containers or pieces.">
          <input id="quantity" placeholder="1 x 40ft reefer" className={FIELD} {...register("quantity")} />
        </Field>

        <Field label="Destination port" htmlFor="destination_port">
          <input id="destination_port" placeholder="Jebel Ali" className={FIELD} {...register("destination_port")} />
        </Field>

        <Field label="Preferred Incoterm" htmlFor="incoterm">
          <select id="incoterm" className={FIELD} defaultValue="" {...register("incoterm")}>
            <option value="">Select if you know it</option>
            {INCOTERMS.map((incoterm) => (
              <option key={incoterm} value={incoterm}>
                {incoterm}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="grid gap-3">
        <legend className="mono-label mb-2">
          Product interest
          <span className="ml-2 normal-case">
            ({selected.length} selected)
          </span>
        </legend>

        <div className="max-h-56 overflow-y-auto rounded-crate border border-harbour/15 p-3">
          {catalogue
            .filter((product) => product.is_published)
            .map((product) => (
              <label
                key={product.id}
                className="flex cursor-pointer items-start gap-2.5 py-1.5 text-[0.9375rem]"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(product.id)}
                  onChange={() =>
                    setSelected((previous) =>
                      previous.includes(product.id)
                        ? previous.filter((id) => id !== product.id)
                        : [...previous, product.id],
                    )
                  }
                  className="mt-1 size-4 shrink-0 accent-brass"
                />
                <span>
                  {product.name}
                  <span className="ml-2 font-mono text-[0.6875rem] tracking-[0.08em] text-slate-soft">
                    HS {product.hs_code}
                  </span>
                </span>
              </label>
            ))}
        </div>
      </fieldset>

      <Field
        label="Message"
        htmlFor="message"
        hint="Grade, packing format, certification requirements — anything that changes the quotation."
        error={errors.message?.message}
      >
        <textarea id="message" rows={5} className={cn(FIELD, "resize-y")} {...register("message")} />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send inquiry"}
        </Button>
        <p className="text-[0.8125rem] text-slate-soft">
          We reply within 24 hours, {site.contact.hours}.
        </p>
      </div>
    </form>
  );
}

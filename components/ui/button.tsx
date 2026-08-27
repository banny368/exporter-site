import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "onDark" | "whatsapp";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-crate font-medium leading-none " +
  "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 " +
  "focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brass";

/** Amber is the CTA colour and is used nowhere else, so it always means "act here". */
const VARIANTS: Record<Variant, string> = {
  primary: "bg-amber text-harbour hover:bg-brass-bright active:bg-brass",
  outline:
    "border border-harbour/25 text-harbour hover:border-harbour/60 hover:bg-harbour/5",
  ghost: "text-harbour hover:bg-harbour/5",
  onDark: "border border-kraft/30 text-kraft hover:border-kraft/70 hover:bg-kraft/10",
  whatsapp: "bg-[#25D366] text-[#062514] hover:bg-[#1FBF5B]",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.8125rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
  children?: ReactNode;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

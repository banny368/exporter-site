import type { ComponentType } from "react";

/**
 * Brand glyphs, drawn inline. lucide dropped its brand icons, and loading them from a
 * CDN would put an external request on every page — which the CSP on a static host and
 * the cookie-consent story both do better without.
 */

type IconProps = { className?: string };

function Frame({ children, className }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {children}
    </svg>
  );
}

export const LinkedInIcon = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.65h.05c.53-.95 1.83-1.95 3.77-1.95C21.4 8.7 22 11.1 22 14.2V21h-4v-6c0-1.43-.03-3.27-2-3.27-2 0-2.3 1.56-2.3 3.17V21h-4V9Z" />
  </Frame>
);

export const InstagramIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
  </svg>
);

export const FacebookIcon = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46h1.7V3.96c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.05V10H7.7v3h2.7v8h3.1Z" />
  </Frame>
);

export const YouTubeIcon = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
  </Frame>
);

export const XIcon = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.1L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.6L17.5 3Zm-1.1 16h1.8L7.7 4.9H5.8L16.4 19Z" />
  </Frame>
);

export const PinterestIcon = ({ className }: IconProps) => (
  <Frame className={className}>
    <path d="M12 2C6.5 2 3.7 5.9 3.7 9.2c0 2 .76 3.78 2.4 4.44.27.11.5 0 .58-.3l.24-.93c.08-.3.05-.4-.17-.66-.48-.57-.79-1.3-.79-2.34 0-3.02 2.26-5.72 5.88-5.72 3.21 0 4.97 1.96 4.97 4.57 0 3.44-1.52 6.34-3.78 6.34-1.25 0-2.18-1.03-1.88-2.3.36-1.51 1.06-3.14 1.06-4.23 0-.98-.52-1.79-1.6-1.79-1.27 0-2.29 1.31-2.29 3.07 0 1.12.38 1.88.38 1.88s-1.3 5.5-1.53 6.46c-.45 1.92-.07 4.27-.04 4.5.02.15.2.18.29.07.12-.16 1.68-2.08 2.2-4 .15-.54.87-3.4.87-3.4.43.82 1.68 1.54 3.02 1.54 3.97 0 6.66-3.62 6.66-8.46C20.16 5.1 17.06 2 12 2Z" />
  </Frame>
);

/** Marketplaces have no widely recognised glyph — a wordmark tile reads better. */
export const SOCIAL_ICONS: Record<string, ComponentType<IconProps>> = {
  LinkedIn: LinkedInIcon,
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  YouTube: YouTubeIcon,
  X: XIcon,
  Pinterest: PinterestIcon,
};

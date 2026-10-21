import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PhoneIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Svg>
);

export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 6.5V12l3.5 2" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
    <path d="M16 2.5v4M8 2.5v4M3 10h18" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.5 10c0 5.5-7.5 11.5-7.5 11.5S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0Z" />
    <circle cx="12" cy="10" r="2.8" />
  </Svg>
);

export const ShieldIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21.5s7.5-3.6 7.5-9.5V5.2L12 2.5 4.5 5.2V12c0 5.9 7.5 9.5 7.5 9.5Z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Svg>
);

export const SparkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.5l-1.8-5.9-5.7-1.8L10.2 9 12 3.5Z" />
    <path d="M19 17.5v3M17.5 19h3" />
  </Svg>
);

export const ChatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 14.5a2 2 0 0 1-2 2H8l-4.5 4V5.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v9Z" />
    <path d="M8 9h8M8 12.5h5" />
  </Svg>
);

export const ToothIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.2 3C4.7 3 3 5 3 7.6c0 2 .8 3.4 1.5 5 .7 1.7 1 4 1.5 6.4.3 1.6 1 2 1.6 2 .9 0 1.2-1 1.5-2.5.4-1.8.8-3.5 2.9-3.5s2.5 1.7 2.9 3.5c.3 1.5.6 2.5 1.5 2.5.6 0 1.3-.4 1.6-2 .5-2.4.8-4.7 1.5-6.4.7-1.6 1.5-3 1.5-5C21 5 19.3 3 16.8 3 14.8 3 13.8 4 12 4s-2.8-1-4.8-1Z" />
  </Svg>
);

export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.5 1.1 6.3L12 17.3l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />
  </Svg>
);

export const ScanIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 7.5V5.5a2.5 2.5 0 0 1 2.5-2.5h2M16.5 3h2A2.5 2.5 0 0 1 21 5.5v2M21 16.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M7.5 21h-2A2.5 2.5 0 0 1 3 18.5v-2" />
    <path d="M7 12h10" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 6.5 9 17.5l-5-5" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);

export const ExternalIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 3.5h6.5V10M10 14 20.5 3.5M18 13.5v5a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
  </Svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.3 6.7h.01" />
  </Svg>
);

export const FacebookIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.5 2.5h-2.8a4.7 4.7 0 0 0-4.7 4.7v2.8H7.5v3.8H10v7.7h3.8v-7.7h2.8l.9-3.8h-3.7V7.2c0-.5.4-.9.9-.9h2.8V2.5Z" />
  </Svg>
);

export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M2.5 12h19M12 2.5c2.5 2.6 3.8 5.8 3.8 9.5s-1.3 6.9-3.8 9.5c-2.5-2.6-3.8-5.8-3.8-9.5S9.5 5.1 12 2.5Z" />
  </Svg>
);

export const QuoteIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 7.5H6A2.5 2.5 0 0 0 3.5 10v2.5A2.5 2.5 0 0 0 6 15h2v1.5A2.5 2.5 0 0 1 5.5 19M20.5 7.5H17a2.5 2.5 0 0 0-2.5 2.5v2.5A2.5 2.5 0 0 0 17 15h2v1.5a2.5 2.5 0 0 1-2.5 2.5" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

/** Simplified WhatsApp-style glyph (speech bubble with handset), drawn in currentColor. */
export const WhatsAppIcon = ({ size = 24, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
    <path d="M16.5 14.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.2s1 2.6 1.1 2.8c.1.2 2 3 4.8 4.2 1.8.8 2.5.8 3.4.7.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);

export const ICONS = {
  clock: ClockIcon,
  calendar: CalendarIcon,
  shield: ShieldIcon,
  map: MapPinIcon,
  spark: SparkIcon,
  chat: ChatIcon,
  tooth: ToothIcon,
  star: StarIcon,
  scan: ScanIcon,
} as const;

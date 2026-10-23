import type { SVGProps } from "react";
import type { IconName } from "@/lib/niches/schema";

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

export const SparkleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3c.6 3.9 2.1 5.4 6 6-3.9.6-5.4 2.1-6 6-.6-3.9-2.1-5.4-6-6 3.9-.6 5.4-2.1 6-6Z" />
    <path d="M18.5 15.5c.3 1.6.9 2.2 2.5 2.5-1.6.3-2.2.9-2.5 2.5-.3-1.6-.9-2.2-2.5-2.5 1.6-.3 2.2-.9 2.5-2.5ZM5 3.5c.2 1.1.6 1.5 1.7 1.7-1.1.2-1.5.6-1.7 1.7-.2-1.1-.6-1.5-1.7-1.7 1.1-.2 1.5-.6 1.7-1.7Z" />
  </Svg>
);

export const PawIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 12.5c-2.6 0-5.5 3.3-5.5 5.6 0 1.6 1.2 2.4 2.6 2.4 1.2 0 1.8-.6 2.9-.6s1.7.6 2.9.6c1.4 0 2.6-.8 2.6-2.4 0-2.3-2.9-5.6-5.5-5.6Z" />
    <ellipse cx="7.2" cy="9.6" rx="1.7" ry="2.2" />
    <ellipse cx="10.4" cy="6" rx="1.7" ry="2.3" />
    <ellipse cx="13.6" cy="6" rx="1.7" ry="2.3" />
    <ellipse cx="16.8" cy="9.6" rx="1.7" ry="2.2" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20.5s-8-4.6-8-10.4A4.4 4.4 0 0 1 8.4 5.6c1.5 0 2.8.8 3.6 2 .8-1.2 2.1-2 3.6-2A4.4 4.4 0 0 1 20 10.1c0 5.8-8 10.4-8 10.4Z" />
  </Svg>
);

export const LeafIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 19c0-8 5.5-13.5 15-14-.4 9.6-6 15-14 15" />
    <path d="M5 19c3-4 6-6.5 10-8.5" />
  </Svg>
);

export const SyringeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15.5 3.5 5 5M18 6l-9.5 9.5M14.5 5.5l4 4M10 9l5 5M6.5 13.5l4 4L7 21l-4-4 3.5-3.5Z" />
  </Svg>
);

export const ScissorsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="6.5" r="2.8" />
    <circle cx="6" cy="17.5" r="2.8" />
    <path d="M8.3 8.2 20 18.5M8.3 15.8 20 5.5" />
  </Svg>
);

export const RazorIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 14.5 13.5 4a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8L9.5 15" />
    <path d="M9.5 15 12 17.5a1.5 1.5 0 0 1 0 2.1l-.4.4a1.5 1.5 0 0 1-2.1 0L3 14.5" />
    <path d="M14 19.5h7" />
  </Svg>
);

export const HomeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5" />
    <path d="M10 20v-5.5h4V20" />
  </Svg>
);

export const SirenIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 18v-6a5.5 5.5 0 0 1 11 0v6M4.5 18h15v2.5h-15V18ZM12 2.5v2M4 5.5l1.4 1.4M20 5.5l-1.4 1.4" />
    <path d="M10 12.5a2 2 0 0 1 2-2" />
  </Svg>
);

export const DropIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5s6.5 7 6.5 11a6.5 6.5 0 0 1-13 0c0-4 6.5-11 6.5-11Z" />
    <path d="M9 15a3 3 0 0 0 3 3" />
  </Svg>
);

export const LaserIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="15.5" width="9" height="5" rx="1.5" />
    <path d="M7.5 15.5v-3M10 13l9-9M15 4h4v4M14 10.5l2.5.5M10.5 7l.5 2.5" />
  </Svg>
);

export const DogIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 5.5 4 7.5l1 5 2.5-1M17 5.5l3 2-1 5-2.5-1" />
    <path d="M7.5 6c1.2-1 2.8-1.5 4.5-1.5s3.3.5 4.5 1.5v7.5a4.5 4.5 0 0 1-9 0V6Z" />
    <path d="M10 10.5h.01M14 10.5h.01M10.8 14.5c.7.6 1.7.6 2.4 0" />
  </Svg>
);

export const CatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 4.5v8a7 7 0 0 0 14 0v-8l-4 3.5h-6L5 4.5Z" />
    <path d="M9.5 12h.01M14.5 12h.01M11 15h2l-1 1-1-1ZM3 14.5l3.5-.5M3.5 17l3-1M21 14.5l-3.5-.5M20.5 17l-3-1" />
  </Svg>
);

export const BirdIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 6.5a3 3 0 0 0-5.6 1.5c0 .5 0 1 .2 1.4C7.6 10 5 12.5 4 16c3 0 5.5-1 7.3-2.6.9 2 2.6 3.6 4.7 4.6V12a6 6 0 0 0 0-5.5Z" />
    <path d="M16 6.5h3.5L18 8.5M13.5 7.5h.01M9.5 20.5h6" />
  </Svg>
);

export const RabbitIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 10.5C7.5 8 7 4.5 8.5 3.5S11 5.5 11 9M15 10.5c1.5-2.5 2-6 .5-7S13 5.5 13 9" />
    <path d="M6.5 15a5.5 5.5 0 0 1 11 0c0 3-2.5 5.5-5.5 5.5S6.5 18 6.5 15Z" />
    <path d="M10 14.5h.01M14 14.5h.01M11.2 17h1.6" />
  </Svg>
);

export const TurtleIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 15.5a7 7 0 0 1 13.5-1.5h1.5a2 2 0 0 1 0 4H4.5v-2.5Z" />
    <path d="M7 18v2.5M14.5 18v2.5M8 12l2.5 3.5h3L16 12M11 9l-.5 3" />
  </Svg>
);

export const FishIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12c2.5-3.5 6-5.5 10-5.5 3.5 0 6 2 8 5.5-2 3.5-4.5 5.5-8 5.5-4 0-7.5-2-10-5.5Z" />
    <path d="M3 12 1.5 8.5M3 12l-1.5 3.5M16.5 10.5h.01M9.5 8.5c1 2 1 5 0 7" />
  </Svg>
);

/** Every icon a niche config or business file may name (keys match ICON_NAMES). */
export const ICONS = {
  tooth: ToothIcon,
  sparkle: SparkleIcon,
  paw: PawIcon,
  clock: ClockIcon,
  calendar: CalendarIcon,
  shield: ShieldIcon,
  map: MapPinIcon,
  spark: SparkIcon,
  chat: ChatIcon,
  star: StarIcon,
  scan: ScanIcon,
  heart: HeartIcon,
  leaf: LeafIcon,
  syringe: SyringeIcon,
  scissors: ScissorsIcon,
  home: HomeIcon,
  siren: SirenIcon,
  drop: DropIcon,
  laser: LaserIcon,
  dog: DogIcon,
  cat: CatIcon,
  bird: BirdIcon,
  rabbit: RabbitIcon,
  turtle: TurtleIcon,
  fish: FishIcon,
  razor: RazorIcon,
} satisfies Record<IconName, (p: IconProps) => React.JSX.Element>;

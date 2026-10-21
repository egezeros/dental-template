/**
 * Neutral, self-made illustrations. They stand in for real clinic photos, which
 * must come from the clinic (we never copy their photos or logos).
 */
export function PlaceholderImage({ label, className = "" }: { label: string; className?: string }) {
  return (
    <figure className={`relative overflow-hidden rounded-3xl bg-white ring-1 ring-line ${className}`}>
      <svg viewBox="0 0 640 480" className="h-full w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id="ph-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect width="640" height="480" fill="url(#ph-bg)" />
        <circle cx="520" cy="90" r="120" fill="var(--brand)" fillOpacity="0.07" />
        <circle cx="90" cy="420" r="150" fill="var(--brand)" fillOpacity="0.06" />
        {/* stylised treatment room: window, chair and lamp */}
        <rect x="96" y="92" width="190" height="150" rx="18" fill="#fff" fillOpacity="0.85" />
        <path d="M191 92v150M96 167h190" stroke="var(--brand)" strokeOpacity="0.18" strokeWidth="4" />
        <path
          d="M300 330c0-40 30-70 80-70h70c22 0 36 14 36 32v10c0 14-11 25-25 25h-61l-40 54h-46c-8 0-14-6-14-14v-37Z"
          fill="#fff"
          stroke="var(--brand)"
          strokeOpacity="0.35"
          strokeWidth="4"
        />
        <path d="M352 381v38M318 419h70" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="6" strokeLinecap="round" />
        <path d="M470 118v70c0 20-16 36-36 36h-10" stroke="var(--brand)" strokeOpacity="0.3" strokeWidth="5" fill="none" />
        <ellipse cx="410" cy="228" rx="34" ry="14" fill="var(--brand)" fillOpacity="0.25" />
        {/* tooth mark */}
        <path
          d="M548 300c-12 0-20 9-20 21 0 9 4 16 7 23 3 8 5 18 7 29 1 7 4 9 7 9 4 0 6-5 7-11 2-8 4-16 13-16s11 8 13 16c1 6 3 11 7 11 3 0 6-2 7-9 2-11 4-21 7-29 3-7 7-14 7-23 0-12-8-21-20-21-9 0-14 4-21 4s-12-4-21-4Z"
          fill="#fff"
          stroke="var(--brand)"
          strokeOpacity="0.5"
          strokeWidth="4"
          transform="translate(-30 -20)"
        />
      </svg>
      <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-center text-[11px] font-medium text-muted ring-1 ring-line backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}

export function AvatarPlaceholder({ label }: { label: string }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-brand/8 ring-1 ring-line">
      <svg viewBox="0 0 200 250" className="h-full w-full" role="img" aria-label={label}>
        <rect width="200" height="250" fill="var(--brand)" fillOpacity="0.06" />
        <circle cx="100" cy="98" r="40" fill="var(--brand)" fillOpacity="0.2" />
        <path d="M30 250c4-52 34-82 70-82s66 30 70 82Z" fill="var(--brand)" fillOpacity="0.2" />
        <path d="M84 176l16 22 16-22" stroke="#fff" strokeWidth="5" fill="none" strokeLinejoin="round" />
      </svg>
      <span className="absolute inset-x-1.5 bottom-1.5 rounded-md bg-white/90 px-1 py-0.5 text-center text-[9px] leading-tight font-medium text-muted ring-1 ring-line md:inset-x-2 md:bottom-2 md:px-2 md:py-1 md:text-[10px]">
        {label}
      </span>
    </div>
  );
}

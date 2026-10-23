/**
 * Neutral, self-made illustrations. They stand in for real clinic photos, which
 * must come from the clinic (we never copy their photos or logos).
 */
export type HeroArt = "dental" | "beauty" | "pet";

export function PlaceholderImage({
  label,
  className = "",
  art = "dental",
}: {
  label: string;
  className?: string;
  art?: HeroArt;
}) {
  return (
    <figure className={`relative overflow-hidden rounded-3xl bg-white ring-1 ring-line ${className}`}>
      <svg viewBox="0 0 640 480" className="h-full w-full" role="img" aria-label={label}>
        <defs>
          <linearGradient id={`ph-bg-${art}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity="0.16" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {art === "beauty" ? <BeautyArt /> : art === "pet" ? <PetArt /> : <DentalArt />}
      </svg>
      <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-center text-[11px] font-medium text-muted ring-1 ring-line backdrop-blur">
        {label}
      </figcaption>
    </figure>
  );
}

function DentalArt() {
  return (
    <>
      <rect width="640" height="480" fill="url(#ph-bg-dental)" />
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
    </>
  );
}

const S = { stroke: "var(--brand)", strokeOpacity: 0.32, strokeWidth: 4, fill: "#fff" } as const;

/** Treatment-room still life: arched mirror, shelf with bottles, vase with stems. */
function BeautyArt() {
  return (
    <>
      <rect width="640" height="480" fill="url(#ph-bg-beauty)" />
      <circle cx="540" cy="70" r="130" fill="var(--brand)" fillOpacity="0.06" />
      <circle cx="70" cy="440" r="150" fill="var(--brand)" fillOpacity="0.05" />
      <path d="M140 430V210a140 140 0 0 1 280 0v220Z" fill="#fff" fillOpacity="0.88" stroke="var(--brand)" strokeOpacity="0.2" strokeWidth="4" />
      <circle cx="280" cy="215" r="74" fill="var(--brand)" fillOpacity="0.07" stroke="var(--brand)" strokeOpacity="0.28" strokeWidth="4" />
      <path d="M244 190c14-22 44-30 66-16" stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="160" y="336" width="240" height="9" rx="4.5" fill="var(--brand)" fillOpacity="0.3" />
      <rect x="186" y="286" width="36" height="50" rx="9" {...S} />
      <rect x="196" y="272" width="16" height="14" rx="3" fill="var(--brand)" fillOpacity="0.3" />
      <rect x="236" y="262" width="28" height="74" rx="12" {...S} />
      <rect x="243" y="248" width="14" height="14" rx="3" fill="var(--brand)" fillOpacity="0.3" />
      <ellipse cx="300" cy="320" rx="26" ry="16" {...S} />
      <path d="M460 430c-26-44-14-78 18-96h44c32 18 44 52 18 96Z" {...S} />
      <path d="M500 334c-6-60 6-110 34-150M500 334c4-50-12-96-46-126M500 334c10-40 34-70 70-84" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="534" cy="186" rx="10" ry="22" transform="rotate(30 534 186)" fill="var(--brand)" fillOpacity="0.22" />
      <ellipse cx="456" cy="210" rx="10" ry="22" transform="rotate(-40 456 210)" fill="var(--brand)" fillOpacity="0.22" />
      <ellipse cx="566" cy="252" rx="10" ry="22" transform="rotate(64 566 252)" fill="var(--brand)" fillOpacity="0.22" />
      <path d="M560 120l6 16 16 6-16 6-6 16-6-16-16-6 16-6Z" fill="var(--brand)" fillOpacity="0.35" />
      <path d="M110 120l4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="var(--brand)" fillOpacity="0.3" />
    </>
  );
}

function Paw({ x, y, r = 1, o = 0.18 }: { x: number; y: number; r?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r})`} fill="var(--brand)" fillOpacity={o}>
      <ellipse cx="0" cy="10" rx="16" ry="13" />
      <ellipse cx="-17" cy="-8" rx="6.5" ry="8.5" />
      <ellipse cx="-6" cy="-18" rx="6.5" ry="8.5" />
      <ellipse cx="7" cy="-18" rx="6.5" ry="8.5" />
      <ellipse cx="18" cy="-8" rx="6.5" ry="8.5" />
    </g>
  );
}

/** A friendly sitting dog and cat, with paw prints. */
function PetArt() {
  return (
    <>
      <rect width="640" height="480" fill="url(#ph-bg-pet)" />
      <circle cx="320" cy="300" r="190" fill="var(--brand)" fillOpacity="0.08" />
      <Paw x={90} y={110} r={1.3} />
      <Paw x={150} y={60} r={0.9} o={0.12} />
      <Paw x={560} y={90} r={1.1} />
      <Paw x={585} y={390} r={0.9} o={0.12} />
      {/* dog */}
      <path d="M150 430c-6-70 10-120 60-140h50c48 18 64 72 56 140Z" {...S} />
      <circle cx="235" cy="232" r="62" {...S} />
      <ellipse cx="180" cy="232" rx="20" ry="42" transform="rotate(18 180 232)" fill="var(--brand)" fillOpacity="0.28" />
      <ellipse cx="290" cy="232" rx="20" ry="42" transform="rotate(-18 290 232)" fill="var(--brand)" fillOpacity="0.28" />
      <ellipse cx="235" cy="258" rx="30" ry="22" fill="var(--brand)" fillOpacity="0.1" />
      <ellipse cx="235" cy="248" rx="11" ry="8" fill="var(--brand)" fillOpacity="0.55" />
      <circle cx="212" cy="222" r="6" fill="var(--brand)" fillOpacity="0.6" />
      <circle cx="258" cy="222" r="6" fill="var(--brand)" fillOpacity="0.6" />
      <path d="M200 312c20 12 50 12 70 0" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* cat */}
      <path d="M360 430c-4-60 8-100 46-118h40c38 18 50 58 46 118Z" {...S} />
      <path d="M492 420c40-6 56-46 34-76" stroke="var(--brand)" strokeOpacity="0.32" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M376 236l6-58 40 34M484 236l-6-58-40 34" {...S} strokeLinejoin="round" />
      <circle cx="430" cy="262" r="56" {...S} />
      <circle cx="410" cy="254" r="6" fill="var(--brand)" fillOpacity="0.6" />
      <circle cx="450" cy="254" r="6" fill="var(--brand)" fillOpacity="0.6" />
      <path d="M424 274l6 6 6-6Z" fill="var(--brand)" fillOpacity="0.55" />
      <path d="M380 276l-26-4M380 286l-26 6M480 276l26-4M480 286l26 6" stroke="var(--brand)" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
      <path d="M318 120c-10-14-34-6-30 12 3 12 30 28 30 28s27-16 30-28c4-18-20-26-30-12Z" fill="var(--brand)" fillOpacity="0.3" />
    </>
  );
}

/** Before/after pair placeholder. Real photos only with the client's written consent. */
export function BeforeAfterPlaceholder({ before, after, label }: { before: string; after: string; label: string }) {
  const half = (text: string, tone: number) => (
    <div className="relative grid aspect-[3/4] place-items-center" style={{ background: `color-mix(in oklab, var(--brand) ${tone}%, white)` }}>
      <svg viewBox="0 0 120 160" className="h-2/3 w-2/3" aria-hidden="true">
        <ellipse cx="60" cy="62" rx="30" ry="38" fill="none" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="3" />
        <path d="M18 160c4-34 20-52 42-52s38 18 42 52" fill="none" stroke="var(--brand)" strokeOpacity="0.35" strokeWidth="3" />
      </svg>
      <span className="absolute top-2 left-2 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.18em] text-ink uppercase ring-1 ring-line">
        {text}
      </span>
    </div>
  );
  return (
    <figure className="overflow-hidden rounded-2xl ring-1 ring-line" role="img" aria-label={label}>
      <div className="grid grid-cols-2 divide-x divide-white">
        {half(before, 10)}
        {half(after, 18)}
      </div>
      <figcaption className="bg-surface px-3 py-2 text-center text-[11px] font-medium text-muted">{label}</figcaption>
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

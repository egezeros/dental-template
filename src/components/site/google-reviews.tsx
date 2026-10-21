import { ExternalIcon, StarIcon } from "@/components/icons";
import type { GooglePlaceReviews } from "@/lib/google-reviews";
import type { SiteDictionary } from "@/lib/i18n";

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5 text-amber-500" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={15} fill={i <= Math.round(value) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

/**
 * Real reviews from the Google Places API, with the reviewer attribution and the
 * "Google Maps" source label that Google's display policy requires.
 */
export function GoogleReviews({ data, t }: { data: GooglePlaceReviews; t: SiteDictionary["reviews"] }) {
  return (
    <>
      <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
        {data.reviews.map((r, i) => (
          <li
            key={i}
            className="flex w-[82%] shrink-0 snap-start flex-col rounded-2xl bg-canvas p-5 ring-1 ring-line/70 md:w-auto"
          >
            <div className="flex items-center gap-3">
              {r.authorPhotoUri ? (
                <img
                  src={r.authorPhotoUri}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-9 w-9 rounded-full bg-line"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                  {r.author.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                {r.authorUri ? (
                  <a
                    href={r.authorUri}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block truncate text-sm font-semibold hover:underline"
                  >
                    {r.author}
                  </a>
                ) : (
                  <p className="truncate text-sm font-semibold">{r.author}</p>
                )}
                <p className="text-xs text-muted">{r.relativeTime}</p>
              </div>
            </div>
            <div className="mt-3">
              <Stars value={r.rating} />
            </div>
            <p className="mt-2 line-clamp-8 text-sm leading-relaxed whitespace-pre-line text-muted">{r.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{t.fromGoogle}</span>
        {data.mapsUri && (
          <a
            href={data.mapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
          >
            {t.allOnGoogle} <ExternalIcon size={12} />
          </a>
        )}
      </p>
    </>
  );
}

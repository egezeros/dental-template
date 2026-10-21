import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { diagnoseGoogleReviews, getGoogleReviews } from "@/lib/google-reviews";
import { testClinic } from "./fixtures";

const details = {
  id: "ChIJ-test",
  displayName: { text: "Test Clinic" },
  rating: 4.7,
  userRatingCount: 29,
  googleMapsUri: "https://maps.google.com/?cid=1",
  reviews: [
    {
      rating: 5,
      relativePublishTimeDescription: "2 weeks ago",
      text: { text: "Machine-translated text" },
      originalText: { text: "  Çox razı qaldım!  " },
      authorAttribution: { displayName: "Reviewer A", uri: "https://maps.google.com/u/a", photoUri: "https://lh3/a.jpg" },
    },
    { rating: 4, relativePublishTimeDescription: "a month ago", authorAttribution: { displayName: "No text" } },
  ],
};

function mockFetch(handlers: Record<string, () => Response>) {
  return vi.fn(async (url: string) => {
    const match = Object.keys(handlers).find((k) => url.includes(k));
    if (!match) throw new Error(`unexpected ${url}`);
    return handlers[match]();
  });
}

describe("getGoogleReviews", () => {
  beforeEach(() => {
    process.env.GOOGLE_MAPS_API_KEY = "test-key";
  });
  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  it("returns null without an API key (site keeps the sample reviews)", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    const f = mockFetch({});
    expect(await getGoogleReviews(testClinic(), "az", f)).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });

  it("finds the place inside Baku, then maps rating and reviews with attribution", async () => {
    const f = mockFetch({
      "places:searchText": () => Response.json({ places: [{ id: "ChIJ-test" }] }),
      "places/ChIJ-test": () => Response.json(details),
    });
    const r = await getGoogleReviews(testClinic(), "ru", f);
    expect(r).toEqual({
      placeId: "ChIJ-test",
      name: "Test Clinic",
      rating: 4.7,
      count: 29,
      mapsUri: "https://maps.google.com/?cid=1",
      reviews: [
        {
          author: "Reviewer A",
          authorUri: "https://maps.google.com/u/a",
          authorPhotoUri: "https://lh3/a.jpg",
          rating: 5,
          text: "Çox razı qaldım!", // the reviewer's own words, not the translation
          relativeTime: "2 weeks ago",
          publishTime: undefined,
        },
      ], // the review without text is dropped
    });
    const [searchUrl, searchInit] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(searchUrl).toContain("places:searchText");
    const body = JSON.parse(String(searchInit.body));
    expect(body.textQuery).toBe("Test");
    expect(body.locationRestriction.rectangle.low.latitude).toBeCloseTo(40.25);
    expect((searchInit.headers as Record<string, string>)["X-Goog-FieldMask"]).toBe("places.id");
    expect(f.mock.calls[1][0]).toContain("languageCode=ru");
  });

  it("uses a pinned placeId without searching", async () => {
    const f = mockFetch({ "places/pinned-id": () => Response.json({ ...details, id: "pinned-id" }) });
    const r = await getGoogleReviews(testClinic({ google: { placeId: "pinned-id" } }), "az", f);
    expect(r?.placeId).toBe("pinned-id");
    expect(f).toHaveBeenCalledOnce();
  });

  it("falls back to null on API errors or when no place matches, without leaking the key", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const failing = mockFetch({ "places:searchText": () => new Response("denied test-key", { status: 403 }) });
    expect(await getGoogleReviews(testClinic(), "az", failing)).toBeNull();
    expect(errors.mock.calls[0][0]).not.toContain("test-key");

    const empty = mockFetch({ "places:searchText": () => Response.json({}) });
    expect(await getGoogleReviews(testClinic(), "az", empty)).toBeNull();
    errors.mockRestore();
    warn.mockRestore();
  });

  it("can be switched off per clinic", async () => {
    const f = mockFetch({});
    expect(await getGoogleReviews(testClinic({ google: { enabled: false } }), "az", f)).toBeNull();
  });

  it("retries the search with just the clinic name when the full address finds nothing", async () => {
    const queries: string[] = [];
    const f = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("places:searchText")) {
        const q = JSON.parse(String(init?.body)).textQuery as string;
        queries.push(q);
        return Response.json(q === "Test Clinic Bakı" ? { places: [{ id: "ChIJ-test" }] } : {});
      }
      return Response.json(details);
    });
    const r = await getGoogleReviews(testClinic(), "az", f);
    expect(queries).toEqual(["Test", "Test Clinic Bakı"]);
    expect(r?.rating).toBe(4.7);
  });
});

describe("diagnoseGoogleReviews", () => {
  afterEach(() => {
    delete process.env.GOOGLE_MAPS_API_KEY;
  });

  it("explains a missing key", async () => {
    const d = await diagnoseGoogleReviews(testClinic(), mockFetch({}));
    expect(d.status).toBe("error");
    expect(d.explanation).toContain("GOOGLE_MAPS_API_KEY is not set");
  });

  it("turns Google's error into a plain-language fix, without the key", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "secret-key";
    const f = mockFetch({
      "places:searchText": () =>
        Response.json(
          { error: { code: 403, message: "Places API (New) has not been used in project 123 before or it is disabled.", status: "PERMISSION_DENIED" } },
          { status: 403 },
        ),
    });
    const d = await diagnoseGoogleReviews(testClinic(), f);
    expect(d).toMatchObject({ status: "error", error: { step: "search", httpStatus: 403 } });
    expect(d.explanation).toContain("Places API (New)");
    expect(JSON.stringify(d)).not.toContain("secret-key");
  });

  it("reports not-found, no-reviews and ok", async () => {
    process.env.GOOGLE_MAPS_API_KEY = "k";
    const nothing = await diagnoseGoogleReviews(testClinic(), mockFetch({ "places:searchText": () => Response.json({}) }));
    expect(nothing.status).toBe("not-found");

    const noReviews = await diagnoseGoogleReviews(
      testClinic({ google: { placeId: "p" } }),
      mockFetch({ "places/p": () => Response.json({ id: "p", displayName: { text: "Test Clinic" }, rating: 5, userRatingCount: 1 }) }),
    );
    expect(noReviews).toMatchObject({ status: "no-reviews", googleName: "Test Clinic", ratingCount: 1, reviewsShown: 0 });

    const ok = await diagnoseGoogleReviews(
      testClinic({ google: { placeId: "p" } }),
      mockFetch({ "places/p": () => Response.json({ ...details, id: "p" }) }),
    );
    expect(ok).toMatchObject({ status: "ok", placeId: "p", rating: 4.7, reviewsShown: 1 });
  });
});

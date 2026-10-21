import type { MetadataRoute } from "next";

/** Demo sites must stay out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}

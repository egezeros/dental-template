import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clinic JSON files (and the Supabase schema, for automatic table creation) are read
  // from disk at runtime, so make sure they are bundled into every serverless function.
  outputFileTracingIncludes: {
    "/**": ["./clinics/**/*.json", "./supabase/schema.sql"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // These are unsolicited demo sites: keep every page out of search engines.
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;

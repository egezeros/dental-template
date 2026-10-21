import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Clinic JSON files are read from disk at runtime by API routes and the
  // admin dashboard, so make sure they are bundled into every serverless function.
  outputFileTracingIncludes: {
    "/**": ["./clinics/**/*.json"],
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

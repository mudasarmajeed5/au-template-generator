import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Static .docx templates used by the preview and the client-side
        // generator: cache aggressively so they are fetched at most once.
        source: "/templates/:path*.docx",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

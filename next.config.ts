import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 85 is used by the full-screen photo viewers.
    qualities: [75, 85],
    // Keep optimised variants cached for a month so visitors rarely wait on a fresh resize.
    minimumCacheTTL: 2678400,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

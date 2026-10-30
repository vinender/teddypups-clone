import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 85 is used by the full-screen photo viewers.
    qualities: [75, 85],
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

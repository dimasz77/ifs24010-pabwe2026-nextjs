import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    // Sisipkan CSS langsung di HTML agar tidak ada request CSS yang memblokir render
    inlineCss: true,
  },
  turbopack: {
    resolveAlias: {
      // Hilangkan polyfill bawaan Next.js (Object.hasOwn, Array.prototype.at, dst.)
      // yang ditandai Lighthouse sebagai "legacy JavaScript". Target kita browser modern.
      "../build/polyfills/polyfill-module": "./src/lib/noop.js",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

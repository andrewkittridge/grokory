import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "x.ai",
        pathname: "/bot/**",
      },
    ],
  },
};

export default nextConfig;

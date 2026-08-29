import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
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

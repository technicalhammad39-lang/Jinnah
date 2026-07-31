import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  ...(process.platform === "win32" ? {} : { output: "standalone" as const }),
  transpilePackages: ["motion"],
  webpack: (config, { dev }) => {
    // HMR can be disabled via the DISABLE_HMR environment variable.
    // Do not modify; file watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === "true") {
      config.watchOptions = {
        ignored: /.*/,
      };
    }

    return config;
  },
};

export default nextConfig;

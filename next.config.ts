import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No usar "standalone" para Netlify - el plugin maneja todo automáticamente
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output bundles a minimal self-contained Node.js server —
  // required for the Electron production build (no separate next start needed).
  output: 'standalone',
};

export default nextConfig;

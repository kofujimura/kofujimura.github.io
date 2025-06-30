import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['web.fujimura.com', 'qa.fujimura.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'web.fujimura.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'qa.fujimura.com',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
  // Note: allowedDevOrigins is not yet available in Next.js 15
  // The CORS warning can be safely ignored in development
};

export default nextConfig;

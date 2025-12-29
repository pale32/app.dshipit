/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds (we run it separately)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds (we run it separately)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ae01.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ae04.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ae03.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'img.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'gd1.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'gd2.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'gd3.alicdn.com',
      },
      {
        protocol: 'https',
        hostname: 'gd4.alicdn.com',
      },
    ],
  },
};

export default nextConfig;

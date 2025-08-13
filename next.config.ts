import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['books.google.com', 'covers.openlibrary.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'books.google.com',
        port: '',
        pathname: '/books/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/b/**',
      },
    ],
  },
};

export default nextConfig;

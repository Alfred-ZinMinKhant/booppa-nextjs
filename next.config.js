/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/v1/create-qr-code/**',
      },
      // Allow local Django media during development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'polygonscan.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.calendly.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '13.229.135.184',
        port: '8001',
        pathname: '/media/**',
      },
    ],
  },
};

module.exports = nextConfig;

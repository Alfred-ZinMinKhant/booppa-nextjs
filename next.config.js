/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        pathname: '/v1/create-qr-code/**',
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
    ],
  },
};

module.exports = nextConfig;

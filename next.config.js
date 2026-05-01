const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' blob: data: api.qrserver.com polygonscan.com assets.calendly.com cms.booppa.io 13.229.135.184; font-src 'self' fonts.gstatic.com; connect-src 'self' api.booppa.io cms.booppa.io 13.229.135.184; frame-src 'self' calendly.com;",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    COOKIE_SIGNING_SECRET: process.env.COOKIE_SIGNING_SECRET,
  },
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
      {
        protocol: 'https',
        hostname: 'cms.booppa.io',
        pathname: '/media/**',
      },
    ],
  },
  async redirects() {
    return [];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;

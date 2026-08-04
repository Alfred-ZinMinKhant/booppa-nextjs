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
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' blob: data: https://api.qrserver.com https://polygonscan.com https://assets.calendly.com https://cms.booppa.io https://api.booppa.io; font-src 'self' fonts.gstatic.com; connect-src 'self' https://api.booppa.io https://cms.booppa.io https://cloudflareinsights.com https://booppa-reports-04bd50c4.s3.amazonaws.com https://booppa-reports-04bd50c4.s3.ap-southeast-1.amazonaws.com; frame-src 'self' https://calendly.com;",
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
      // Blog images. BOTH hosts are required until the `blog_post_images` row
      // rewrite runs at cutover: the rows still hold Django-relative paths
      // (`blog_images/x.png`), which the backend's `_image_url` maps to
      // CMS_LEGACY_MEDIA_BASE — so images keep coming from cms.booppa.io even
      // though the JSON now comes from api.booppa.io. Drop the cms entry only
      // after the rows are rewritten to the `cms/` prefix.
      {
        protocol: 'https',
        hostname: 'cms.booppa.io',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'api.booppa.io',
        pathname: '/api/public/cms-media/**',
      },
    ],
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    const backend = process.env.BACKEND_BASE_URL || 'https://api.booppa.io';
    return [
      { source: '/api/v1/:path*', destination: `${backend}/api/v1/:path*` },
      { source: '/api/admin/intelligence', destination: `${backend}/api/v1/admin/intelligence` },
      { source: '/api/admin/intelligence/:path*', destination: `${backend}/api/v1/admin/intelligence/:path*` },
      // CMS retirement: public content now comes from FastAPI. The path is
      // unchanged because main.py dual-mounts the router at `/api`, so this is
      // a host swap only — `cms.booppa.io` stays up as the rollback target.
      { source: '/api/public/:path*', destination: `${backend}/api/public/:path*` },
    ];
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

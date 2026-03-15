export const config = {
  apiUrl:              process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://api.booppa.io',
  wsUrl:               process.env.NEXT_PUBLIC_WS_URL  || process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io',
  tokenMaxAge:         60 * 60 * 24 * 7,   // 7 days
  refreshTokenMaxAge:  60 * 60 * 24 * 30,  // 30 days
} as const

export const endpoints = {
  auth: {
    login:    '/auth/login',
    logout:   '/auth/logout',
    refresh:  '/auth/refresh',
    me:       '/auth/me',
  },
  dashboard: {
    overview: '/dashboard',
  },
  enterprise: {
    score:    '/enterprise/score',
  },
  marketplace: {
    search:     '/marketplace/search',
    industries: '/marketplace/industries',
    vendor:     (slug: string) => `/marketplace/${slug}`,
    importCsv:  '/marketplace/import/csv',
  },
  features: {
    list:           '/features/',
    get:            (name: string) => `/features/${name}`,
    set:            (name: string) => `/features/${name}`,
    metrics:        '/features/metrics',
    autoActivate:   '/features/auto-activate',
  },
  compare: {
    vendors: '/compare/',
    similar: (id: string) => `/compare/similar/${id}`,
  },
  seo: {
    industry:  (slug: string) => `/seo/industry/${slug}`,
    topVendors: (sector: string) => `/seo/top/${sector}`,
    country:   (code: string) => `/seo/country/${code}`,
    sitemap:   '/seo/sitemap',
  },
  rankings: {
    leaderboard: '/rankings/leaderboard',
    compute:     '/rankings/compute',
    achievements: (userId: string) => `/rankings/achievements/${userId}`,
  },
  funnel: {
    track:    '/funnel/track',
    summary:  '/funnel/summary',
    revenue:  '/funnel/revenue-summary',
    snapshot: '/funnel/monthly-snapshot',
  },
  discovery: {
    search: '/discovery/search',
    claim:  (id: string) => `/discovery/claim/${id}`,
  },
  referrals: {
    create:  '/referrals/',
    byCode:  (code: string) => `/referrals/code/${code}`,
    redeem:  (code: string) => `/referrals/redeem/${code}`,
    mine:    '/referrals/mine',
  },
  widget: {
    badgeSvg:  (reportId: string) => `/widget/badge/svg/${reportId}`,
    badgeJson: (reportId: string) => `/widget/badge/json/${reportId}`,
    embed:     (reportId: string) => `/widget/embed/${reportId}`,
  },
  verify: (token: string) => `/verify/${token}`,
  verifyComplete: (token: string) => `/verify/${token}/complete`,
} as const

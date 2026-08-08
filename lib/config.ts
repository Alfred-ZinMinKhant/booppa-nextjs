export const config = {
  apiUrl:              process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || 'https://api.booppa.io',
  wsUrl:               process.env.NEXT_PUBLIC_WS_URL  || process.env.NEXT_PUBLIC_API_BASE || 'https://api.booppa.io',
  tokenMaxAge:         60 * 60 * 24 * 7,   // 7 days
  refreshTokenMaxAge:  60 * 60 * 24 * 30,  // 30 days
} as const

/**
 * Absolute URL for a backend API path.
 *
 * `config.apiUrl` is a bare host with no path, while the backend mounts its
 * router only under `/api/v1` and `/api` — so `${config.apiUrl}${path}` is
 * always a 404. Most call sites hand-write the `/api/v1` segment; five did not
 * (the Enterprise organisations/seats/SSO routes and sso-discover), which made
 * organisation lookup, seat management and SSO discovery fail unconditionally
 * in production while looking correct in review.
 *
 * Use this instead of interpolating `config.apiUrl` directly. Pass a
 * leading-slash path, e.g. `apiPath('/enterprise/organisations')`.
 */
export function apiPath(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${config.apiUrl}/api/v1${p}`
}

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
    vendor:     (slug: string) => `/marketplace/vendor/${slug}`,
    importCsv:  '/marketplace/import/csv',
  },
  pricing: {
    products: '/pricing/products',
    product:  (slug: string) => `/pricing/products/${slug}`,
  },
  features: {
    list:           '/features/flags',
    get:            (name: string) => `/features/flags/${name}`,
    set:            (_name: string) => `/features/flags`,
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
    // The backend has no bare /rankings/leaderboard — only /leaderboard/all
    // (cross-sector) and /leaderboard/{sector}. The public rankings page was
    // 404ing and rendering an empty table, silently, because the caller only
    // reads the body `if (res.ok)`.
    leaderboard: '/rankings/leaderboard/all',
    compute:     '/rankings/compute',
    achievements: (userId: string) => `/rankings/achievements/${userId}`,
  },
  funnel: {
    track:    '/funnel/track',
    summary:  '/funnel/summary',
    // Route is /funnel/revenue. `revenue-summary` is the handler's function
    // name, not its path — the Insight Dome revenue panel was always null.
    revenue:  '/funnel/revenue',
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
  scout: {
    pending:     '/scout/pending',
    preview:     (id: string) => `/scout/pending/${id}/preview`,
    approve:     '/scout/approve',
    reject:      '/scout/reject',
    cspUpload:   '/scout/csp/seed-upload',
    cspTemplate: '/scout/csp/seed-template.csv',
  },
} as const

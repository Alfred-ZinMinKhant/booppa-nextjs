export const config = {
  apiUrl:              process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  wsUrl:               process.env.NEXT_PUBLIC_WS_URL  || 'http://localhost:8000',
  tokenMaxAge:         60 * 60 * 24 * 7,   // 7 giorni
  refreshTokenMaxAge:  60 * 60 * 24 * 30,  // 30 giorni
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
  verify: (token: string) => `/verify/${token}`,
  verifyComplete: (token: string) => `/verify/${token}/complete`,
} as const

// ─── User & Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name: string
  role?: string
  avatar?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

// ─── API Generics ────────────────────────────────────────────────────────────

export interface ApiError {
  error: string
  message?: string
  statusCode?: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  stats: {
    totalUsers: number
    activeUsers: number
    revenue: number
  }
  recentActivity: Activity[]
}

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export interface CategoryScore {
  name: string
  score: number
}

export interface Module {
  id: string
  name: string
  impact: number        // incremento % sul punteggio complessivo
  price?: number
  currency?: string
}

export interface ScoreData {
  overallScore: number
  categories: CategoryScore[]
  availableModules: Module[]
}

// ─── Verify Portal ───────────────────────────────────────────────────────────

export interface VerifyData {
  enterpriseName: string
  status: string
  verifiedAt?: string
  additionalInfo?: Record<string, string>
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  enterpriseName?: string
  timestamp: Date
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

export interface MarketplaceVendor {
  id: string
  company_name: string
  seo_slug: string
  domain?: string
  website?: string
  industry?: string
  country: string
  city?: string
  short_description?: string
  uen?: string
  entity_type?: string
  logo_url?: string
  claimed: boolean
  verified?: boolean
  trust_score?: number
  tier?: string
  created_at: string
}

export interface MarketplaceSearchResult {
  vendors: MarketplaceVendor[]
  total: number
  page: number
  per_page: number
}

export interface IndustryCount {
  industry: string
  count: number
}

// ─── Feature Flags ───────────────────────────────────────────────────────────

export interface FeatureFlag {
  flag_name: string
  enabled: boolean
  description?: string
  auto_activate_threshold?: number
  activated_at?: string
}

export interface GrowthMetrics {
  vendors: number
  users: number
  reports: number
}

// ─── Comparison ──────────────────────────────────────────────────────────────

export interface ComparisonVendor {
  id: string
  company_name: string
  industry?: string
  trust_score?: number
  tier?: string
  domain?: string
  country: string
}

export interface ComparisonResult {
  vendors: ComparisonVendor[]
  matrix: Record<string, Record<string, unknown>>
}

// ─── Rankings / Leaderboard ──────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string
  quarter: string
  company_name?: string
  score: number
  rank: number
  tier?: string
  badge_url?: string
}

export interface Achievement {
  id: string
  achievement_type: string
  label?: string
  description?: string
  icon_url?: string
  awarded_at: string
}

// ─── Funnel Analytics ────────────────────────────────────────────────────────

export interface FunnelStage {
  stage: string
  count: number
}

export interface FunnelSummary {
  stages: FunnelStage[]
  total_sessions: number
  conversion_rate: number
}

export interface RevenueSummary {
  total_revenue_cents: number
  by_product: Record<string, number>
  by_type: Record<string, number>
  period: string
}

// ─── Referral ────────────────────────────────────────────────────────────────

export interface Referral {
  id: string
  referrer_id: string
  referred_email: string
  referral_code: string
  status: string
  reward_cents: number
  created_at: string
  redeemed_at?: string
}

// ─── Discovery ───────────────────────────────────────────────────────────────

export interface DiscoveredVendor {
  id: string
  company_name: string
  domain?: string
  sector?: string
  scan_status: string
  claim_token?: string
  last_scan_at?: string
  created_at: string
}

// ─── SEO Pages ───────────────────────────────────────────────────────────────

export interface IndustryPageData {
  industry: string
  slug: string
  vendor_count: number
  vendors: MarketplaceVendor[]
  avg_trust_score?: number
  description: string
}

export interface SitemapEntry {
  loc: string
  lastmod?: string
  priority: number
}

export type NotificationPayload = Omit<Notification, 'id' | 'timestamp'>

// ─── Component Props ─────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

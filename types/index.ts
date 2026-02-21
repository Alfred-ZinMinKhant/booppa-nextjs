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

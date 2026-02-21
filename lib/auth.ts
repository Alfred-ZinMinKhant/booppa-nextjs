import { cookies } from 'next/headers'
import { config, endpoints } from './config'
import type { User, RefreshTokenResponse } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setTokenCookies(token: string, refreshToken: string) {
  const cookieStore = cookies()
  const isProduction = process.env.NODE_ENV === 'production'

  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: isProduction,
    maxAge: config.tokenMaxAge,
    sameSite: 'lax',
  })

  cookieStore.set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    path: '/',
    secure: isProduction,
    maxAge: config.refreshTokenMaxAge,
    sameSite: 'lax',
  })
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export async function refreshServerToken(): Promise<RefreshTokenResponse | null> {
  const refreshToken = cookies().get('refreshToken')?.value
  if (!refreshToken) return null

  try {
    const res = await fetch(`${config.apiUrl}${endpoints.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) return null

    const data: RefreshTokenResponse = await res.json()
    setTokenCookies(data.token, data.refreshToken)
    return data
  } catch {
    return null
  }
}

// ─── User server-side ─────────────────────────────────────────────────────────

export async function getServerSideUser(): Promise<User | null> {
  const token = cookies().get('token')?.value
  if (!token) return null

  try {
    const res = await fetch(`${config.apiUrl}${endpoints.auth.me}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })

    if (res.ok) return res.json() as Promise<User>

    // Token scaduto → proviamo il refresh
    const refreshed = await refreshServerToken()
    if (!refreshed) return null

    const retry = await fetch(`${config.apiUrl}${endpoints.auth.me}`, {
      headers: { Authorization: `Bearer ${refreshed.token}` },
      cache: 'no-store',
    })

    return retry.ok ? (retry.json() as Promise<User>) : null
  } catch {
    return null
  }
}

// ─── Fetch autenticato (Server Components) ────────────────────────────────────

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = cookies().get('token')?.value

  const makeRequest = (t: string) =>
    fetch(`${config.apiUrl}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${t}`,
      },
      cache: 'no-store',
    })

  const res = await makeRequest(token ?? '')

  // 401 → refresh e retry automatico
  if (res.status === 401) {
    const refreshed = await refreshServerToken()
    if (refreshed) return makeRequest(refreshed.token)
  }

  return res
}

// ─── Clear cookies (logout) ───────────────────────────────────────────────────

export function clearAuthCookies() {
  cookies().delete('token')
  cookies().delete('refreshToken')
}

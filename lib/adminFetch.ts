import { cookies } from 'next/headers'
import { config } from '@/lib/config'

/**
 * Server-side fetch helper for the admin section.
 * Forwards the admin_token cookie as a Bearer header to the FastAPI backend.
 * Path-based; pass full backend path like '/api/v1/admin/intelligence'.
 */
export async function adminFetch(path: string, init: RequestInit = {}) {
  const token = cookies().get('admin_token')?.value
  const headers = new Headers(init.headers || {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${config.apiUrl}${path}`, { ...init, headers, cache: 'no-store' })
}

export function getAdminToken(): string | null {
  return cookies().get('admin_token')?.value || null
}

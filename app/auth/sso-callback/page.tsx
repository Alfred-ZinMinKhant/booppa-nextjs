'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'

/**
 * SSO callback landing page.
 *
 * The backend's SAML ACS (and OIDC callback) redirect the browser here with
 * tokens in the URL fragment:
 *   /auth/sso-callback#access_token=...&refresh_token=...&org=acme&next=/dashboard
 *
 * URL fragments never reach the server, so the tokens are safe in transit.
 * We POST them to /api/sso-callback which sets the same HttpOnly cookies as
 * the password-login flow, then redirect to the dashboard.
 */
export default function SsoCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const next = params.get('next')

    if (!accessToken || !refreshToken) {
      setError('Missing SSO tokens. Please try signing in again.')
      return
    }

    fetch('/api/sso-callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}))
          throw new Error(d?.error || `Failed to complete SSO (${r.status})`)
        }
        window.location.hash = ''
        const dest = next && next.startsWith('/') ? next : '/dashboard'
        router.replace(dest)
      })
      .catch((e: Error) => setError(e.message))
  }, [router])

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertCircle className="h-5 w-5" />
            <h1 className="font-semibold">SSO sign-in failed</h1>
          </div>
          <p className="text-sm text-neutral-300">{error}</p>
          <a
            href="/auth/login"
            className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
          >
            Back to login
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex items-center gap-3 text-neutral-300">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
        Completing single sign-on…
      </div>
    </main>
  )
}

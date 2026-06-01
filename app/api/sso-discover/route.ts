import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Public SSO discovery proxy used by the login page.
 *
 * GET /api/sso-discover?email=user@acme.com
 *   → { options: [{ org_slug, org_name, protocol, login_url }] }
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email') || ''
  if (!email) return NextResponse.json({ options: [] })

  const r = await fetch(
    `${config.apiUrl}/enterprise/sso/discover?email=${encodeURIComponent(email)}`,
    { cache: 'no-store' },
  )
  const body = await r.json().catch(() => ({ options: [] }))
  return NextResponse.json(body, { status: r.status })
}

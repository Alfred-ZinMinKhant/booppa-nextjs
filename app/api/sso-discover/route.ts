import { NextResponse } from 'next/server'
import { apiPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Public SSO discovery proxy used by the login page.
 *
 * GET /api/sso-discover?email=user@acme.com
 *   → 200 { options: [{ org_slug, org_name, protocol, login_url }] }
 *   → 502 { options: [], error: 'discovery_unavailable' }
 *
 * Two bugs used to live here. The URL omitted the `/api/v1` mount, so this
 * always 404'd. And every failure — 404, 500, unreachable backend, unparseable
 * body — was flattened into `{ options: [] }`, which the login page renders as
 * "no SSO available". An SSO customer whose backend was briefly down was told,
 * confidently, that their organisation has no SSO, with no way to tell the
 * difference. "No SSO configured" and "we could not find out" must not look
 * alike, so failures now carry a distinct status and an `error` field.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email') || ''
  if (!email) return NextResponse.json({ options: [] })

  const unavailable = NextResponse.json(
    { options: [], error: 'discovery_unavailable' },
    { status: 502 },
  )

  let r: Response
  try {
    r = await fetch(
      apiPath(`/enterprise/sso/discover?email=${encodeURIComponent(email)}`),
      { cache: 'no-store' },
    )
  } catch {
    return unavailable
  }

  // A 404 here means the discovery endpoint itself is missing, not that the
  // user has no SSO — the backend answers 200 with an empty list for that.
  if (!r.ok) return unavailable

  try {
    const body = await r.json()
    return NextResponse.json(body, { status: 200 })
  } catch {
    return unavailable
  }
}

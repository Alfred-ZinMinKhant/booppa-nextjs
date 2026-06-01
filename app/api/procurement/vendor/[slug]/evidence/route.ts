import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Evidence Scan (L3) — blockchain anchors + certificate log + drift history.
 * Consumes one EVIDENCE credit per unique vendor per month.
 *
 * 402 = EVIDENCE not in plan (only Buyer Enterprise + Pro Suite include it).
 * 429 = monthly EVIDENCE cap reached on a NEW vendor.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const res = await fetchWithAuth(
      `/api/v1/procurement/vendor/${encodeURIComponent(params.slug)}/evidence`,
    )
    const body = await res.json().catch(() => ({}))
    return NextResponse.json(body, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Evidence scan failed' }, { status: 500 })
  }
}

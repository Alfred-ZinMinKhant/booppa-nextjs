import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Quick Scan (L1) — consumes one QUICK credit per unique vendor per month.
 * Re-views of the same vendor within the month are free.
 *
 * 402 = scan_type not in plan (e.g. DEEP on a Starter — won't happen here).
 * 429 = monthly cap reached on a NEW vendor.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const res = await fetchWithAuth(
      `/api/v1/procurement/vendor/${encodeURIComponent(params.slug)}/status`,
    )
    const body = await res.json().catch(() => ({}))
    return NextResponse.json(body, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Quick scan failed' }, { status: 500 })
  }
}

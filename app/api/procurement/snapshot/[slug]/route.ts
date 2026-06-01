import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Deep Scan (L2) — institutional audit-ready snapshot.
 * Consumes one DEEP credit per unique vendor per month.
 *
 * 402 = DEEP scans not in plan (Buyer Starter only has QUICK).
 * 429 = monthly DEEP cap reached on a NEW vendor.
 */
export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const url = new URL(req.url)
  const window = url.searchParams.get('window') || '30'
  try {
    const res = await fetchWithAuth(
      `/api/v1/procurement/snapshot/${encodeURIComponent(params.slug)}?window=${window}`,
    )
    const body = await res.json().catch(() => ({}))
    return NextResponse.json(body, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Deep scan failed' }, { status: 500 })
  }
}

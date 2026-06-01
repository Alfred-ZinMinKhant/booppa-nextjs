import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Buyer scan-quota dashboard widget.
 *
 * Backend response:
 *   {
 *     month: "2026-06",
 *     plan: "buyer_starter_monthly",
 *     scans: {
 *       QUICK:    { used, limit, remaining },
 *       DEEP:     { used, limit, remaining },
 *       EVIDENCE: { used, limit, remaining },
 *     }
 *   }
 * `limit: null` = unlimited (Pro Suite / legacy Enterprise Pro).
 */
export async function GET() {
  try {
    const res = await fetchWithAuth('/api/v1/procurement/scan-quota')
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Failed to fetch scan quota' }, { status: 500 })
  }
}

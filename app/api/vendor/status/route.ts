import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetchWithAuth('/api/v1/vendor/status')
    console.log('[VENDOR_STATUS] Backend status:', res.status)
    if (!res.ok) {
      const text = await res.text()
      console.log('[VENDOR_STATUS] Backend error:', text)
      return NextResponse.json({ error: 'Failed to fetch vendor status' }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[VENDOR_STATUS] Exception:', err)
    return NextResponse.json({ error: 'Failed to fetch vendor status' }, { status: 500 })
  }
}

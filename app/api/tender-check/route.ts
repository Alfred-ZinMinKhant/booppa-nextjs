import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const tenderNo = searchParams.get('tenderNo')
  const vendorId = searchParams.get('vendorId')

  if (!tenderNo) {
    return NextResponse.json({ error: 'tenderNo is required' }, { status: 400 })
  }

  const params = new URLSearchParams({ tenderNo })
  if (vendorId) params.set('vendorId', vendorId)

  const res = await fetchWithAuth(`/api/v1/tender-check?${params.toString()}`)

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    return NextResponse.json(body, { status: res.status })
  }

  const data = await res.json()
  return NextResponse.json(data)
}

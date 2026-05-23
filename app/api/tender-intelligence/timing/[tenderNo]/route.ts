import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth, getServerSideUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { tenderNo: string } }
) {
  const url = new URL(req.url)
  let vendorId = url.searchParams.get('vendorId')
  if (!vendorId) {
    const user = await getServerSideUser()
    if (user?.id) vendorId = String(user.id)
  }
  const qs = vendorId ? `?vendorId=${encodeURIComponent(vendorId)}` : ''
  const res = await fetchWithAuth(
    `/api/v1/tender-intelligence/timing/${encodeURIComponent(params.tenderNo)}${qs}`
  )
  const body = await res.json().catch(() => ({}))
  return NextResponse.json(body, { status: res.status })
}

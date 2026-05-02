import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  const domain = params.domain
  const res = await fetchWithAuth(`/api/v1/leads/${domain}`)
  
  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch lead detail' }, { status: res.status })
  }
  
  const data = await res.json()
  return NextResponse.json(data)
}

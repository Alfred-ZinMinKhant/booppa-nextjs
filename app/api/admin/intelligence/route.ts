import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const adminToken = cookies().get('admin_token')?.value
  if (!adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(`${config.apiUrl}/api/v1/admin/intelligence`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    cache: 'no-store',
  })

  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  })
}

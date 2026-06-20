import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const res = await fetch(`${config.apiUrl}/api/v1/pdpa-declaration/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

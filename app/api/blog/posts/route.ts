import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') || '3'
  const res = await fetch(`${config.apiUrl}/api/public/blogs/?limit=${limit}`)
  const data = await res.json().catch(() => ({ results: [] }))
  return NextResponse.json(data, { status: res.ok ? 200 : 500 })
}

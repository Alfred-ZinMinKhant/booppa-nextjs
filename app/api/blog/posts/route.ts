import { NextRequest, NextResponse } from 'next/server'

const CMS_BASE = process.env.CMS_BASE || process.env.NEXT_PUBLIC_CMS_BASE || 'https://cms.booppa.io'

export async function GET(req: NextRequest) {
  const limit = req.nextUrl.searchParams.get('limit') || '50'
  const res = await fetch(`${CMS_BASE.replace(/\/$/, '')}/api/public/blogs/?limit=${limit}`)
  const data = await res.json().catch(() => ({ results: [] }))
  return NextResponse.json(data, { status: res.ok ? 200 : 500 })
}

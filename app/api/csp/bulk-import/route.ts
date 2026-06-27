import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

// Dedicated proxy for the multipart CSV/Excel bulk-import upload. The catch-all
// proxy assumes JSON, so this streams the FormData through instead. Do NOT set a
// Content-Type header — fetch derives the multipart boundary from the FormData.

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const search = req.nextUrl.search || ''
  const upstream = await fetchWithAuth(`/api/v1/csp/bulk-import${search}`, {
    method: 'POST',
    body: formData,
  })
  const body = await upstream.arrayBuffer()
  const headers = new Headers({ 'cache-control': 'no-store' })
  const ct = upstream.headers.get('content-type')
  if (ct) headers.set('content-type', ct)
  return new NextResponse(body, { status: upstream.status, headers })
}

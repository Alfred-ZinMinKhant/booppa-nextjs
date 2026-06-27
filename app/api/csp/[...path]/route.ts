import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

// Catch-all proxy for the CSP API. Forwards every /api/csp/* call to the
// FastAPI router at /api/v1/csp/* via fetchWithAuth (attaches the Bearer token
// from the httpOnly cookie). Upstream status codes are passed through unchanged
// — 402 (subscription required) and 403 (ToS not accepted) carry meaning the
// pages and (app) layout depend on.
//
// Multipart bulk-import has its own handler at app/api/csp/bulk-import/route.ts;
// this catch-all assumes JSON bodies. The CSV template download
// (GET /csp/bulk-import/template) rides this handler and is streamed back with
// its original content-type + content-disposition.

export const dynamic = 'force-dynamic'

function backendUrl(req: NextRequest, path: string[]): string {
  const search = req.nextUrl.search || ''
  return `/api/v1/csp/${path.map(encodeURIComponent).join('/')}${search}`
}

async function passthrough(upstream: Response): Promise<NextResponse> {
  const body = await upstream.arrayBuffer()
  const headers = new Headers()
  const ct = upstream.headers.get('content-type')
  const cd = upstream.headers.get('content-disposition')
  if (ct) headers.set('content-type', ct)
  if (cd) headers.set('content-disposition', cd)
  headers.set('cache-control', 'no-store')
  return new NextResponse(body, { status: upstream.status, headers })
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const upstream = await fetchWithAuth(backendUrl(req, params.path), { method: 'GET' })
  return passthrough(upstream)
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const raw = await req.text()
  const upstream = await fetchWithAuth(backendUrl(req, params.path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw || '{}',
  })
  return passthrough(upstream)
}

export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  const raw = await req.text()
  const upstream = await fetchWithAuth(backendUrl(req, params.path), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: raw || '{}',
  })
  return passthrough(upstream)
}

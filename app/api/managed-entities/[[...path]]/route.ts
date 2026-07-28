import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

// Catch-all proxy for the managed-entities API (the CSP/DPO client-company
// registry). Forwards /api/managed-entities/* to FastAPI /api/v1/managed-entities/*
// with the Bearer token from the httpOnly cookie.
//
// Status codes are passed through unchanged because they carry meaning the entity
// picker depends on: 409 (already registered) and 422 (ACRA contradicted the UEN,
// or the entity isn't yours) are both rendered as specific messages, not as a
// generic failure. Collapsing them would turn "this UEN belongs to another
// company" into "something went wrong" — the one thing the customer must see.

export const dynamic = 'force-dynamic'

function backendUrl(req: NextRequest, path?: string[]): string {
  const search = req.nextUrl.search || ''
  const suffix = path?.length ? `/${path.map(encodeURIComponent).join('/')}` : ''
  return `/api/v1/managed-entities${suffix}${search}`
}

async function passthrough(upstream: Response): Promise<NextResponse> {
  const body = await upstream.text()
  return new NextResponse(body || null, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
    },
  })
}

type Ctx = { params: { path?: string[] } }

export async function GET(req: NextRequest, { params }: Ctx) {
  return passthrough(await fetchWithAuth(backendUrl(req, params.path), { method: 'GET' }))
}

async function send(req: NextRequest, path: string[] | undefined, method: string) {
  const raw = await req.text()
  return passthrough(
    await fetchWithAuth(backendUrl(req, path), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: raw || '{}',
    }),
  )
}

export async function POST(req: NextRequest, { params }: Ctx) {
  return send(req, params.path, 'POST')
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return send(req, params.path, 'PATCH')
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  return passthrough(await fetchWithAuth(backendUrl(req, params.path), { method: 'DELETE' }))
}

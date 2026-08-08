import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * BFF for the government portal.
 *
 * Every `/government/*` backend endpoint is gated by `_require_gov_user`, which
 * reads a **Bearer token**. The dashboard was calling the backend directly with
 * `credentials: "include"`, and the API has no cookie fallback — so those calls
 * were unauthenticated no matter who was signed in (AUDIT_2026-08-08.md P1-4).
 * The session lives in an HttpOnly `token` cookie that JavaScript cannot read,
 * which is why the exchange has to happen server-side, here.
 *
 * Same shape as `app/api/enterprise/[...path]/route.ts`. `register` has its own
 * more-specific route and is unaffected by this catch-all.
 *
 * Responses are passed through as-is: `shortlist-report` returns plain text,
 * not JSON, and re-encoding it would corrupt the AGO evaluation record.
 */
async function forward(req: NextRequest, path: string[]) {
  const token = cookies().get('token')?.value
  const search = req.nextUrl.search || ''
  const target = `${config.apiUrl}/api/v1/government/${path.join('/')}${search}`

  const headers: Record<string, string> = {}
  const ct = req.headers.get('content-type')
  if (ct) headers['Content-Type'] = ct
  if (token) headers['Authorization'] = `Bearer ${token}`

  const init: RequestInit = { method: req.method, headers, cache: 'no-store' }
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
    init.body = await req.text()
  }

  const res = await fetch(target, init)
  if (res.status === 204) return new NextResponse(null, { status: 204 })

  const text = await res.text()
  const upstreamType = res.headers.get('content-type') ?? ''
  if (upstreamType.includes('application/json')) {
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      /* fall through to the raw body */
    }
  }
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': upstreamType || 'text/plain; charset=utf-8' },
  })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } })    { return forward(req, ctx.params.path) }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } })   { return forward(req, ctx.params.path) }
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } })  { return forward(req, ctx.params.path) }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } })    { return forward(req, ctx.params.path) }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params.path) }

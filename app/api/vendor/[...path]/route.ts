import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

async function proxy(req: NextRequest, params: { path: string[] }) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const segments = params.path.join('/')
  const search = req.nextUrl.search || ''
  const url = `${config.apiUrl}/api/v1/vendor/${segments}${search}`

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  }

  let body: BodyInit | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
    const text = await req.text()
    if (text) body = text
    headers['Content-Type'] = req.headers.get('content-type') || 'application/json'
  }

  const upstream = await fetch(url, { method: req.method, headers, body, cache: 'no-store' })
  if (upstream.status === 204) return new NextResponse(null, { status: 204 })
  const ct = upstream.headers.get('content-type') || ''
  if (ct.includes('application/json')) {
    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data, { status: upstream.status })
  }
  const text = await upstream.text()
  return new NextResponse(text, { status: upstream.status })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) { return proxy(req, ctx.params) }

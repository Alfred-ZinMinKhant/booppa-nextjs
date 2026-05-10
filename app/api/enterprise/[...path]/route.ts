import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

async function forward(req: NextRequest, path: string[]) {
  const token = cookies().get('token')?.value
  const search = req.nextUrl.search || ''
  const target = `${config.apiUrl}/api/v1/enterprise/${path.join('/')}${search}`

  const headers: Record<string, string> = {}
  const ct = req.headers.get('content-type')
  if (ct) headers['Content-Type'] = ct
  if (token) headers['Authorization'] = `Bearer ${token}`

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: 'no-store',
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
    init.body = await req.text()
  }

  const res = await fetch(target, init)
  if (res.status === 204) return new NextResponse(null, { status: 204 })

  const text = await res.text()
  try {
    return NextResponse.json(JSON.parse(text), { status: res.status })
  } catch {
    return new NextResponse(text, { status: res.status })
  }
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } })    { return forward(req, ctx.params.path) }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } })   { return forward(req, ctx.params.path) }
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } })  { return forward(req, ctx.params.path) }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } })    { return forward(req, ctx.params.path) }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params.path) }

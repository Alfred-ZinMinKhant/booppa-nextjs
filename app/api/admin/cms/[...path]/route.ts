import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify_admin_token_present } from './_guard'

const CMS_BASE =
  process.env.CMS_BASE ||
  process.env.NEXT_PUBLIC_CMS_BASE ||
  'https://cms.booppa.io'

const CMS_ADMIN_TOKEN =
  process.env.CMS_ADMIN_TOKEN || process.env.ADMIN_TOKEN || ''

export const dynamic = 'force-dynamic'

async function proxy(req: NextRequest, params: { path: string[] }) {
  if (!verify_admin_token_present(cookies().get('admin_token')?.value)) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }
  if (!CMS_ADMIN_TOKEN) {
    return NextResponse.json({ detail: 'CMS_ADMIN_TOKEN not configured on server.' }, { status: 503 })
  }

  const segments = params.path.join('/')
  const search = req.nextUrl.search || ''
  const url = `${CMS_BASE.replace(/\/$/, '')}/api/admin/${segments}/${search}`

  const isFormData = (req.headers.get('content-type') || '').includes('multipart/form-data')
  const headers: Record<string, string> = {
    'X-Admin-Token': CMS_ADMIN_TOKEN,
  }

  let body: BodyInit | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'DELETE') {
    if (isFormData) {
      body = await req.formData()
    } else {
      const text = await req.text()
      if (text) body = text
      headers['Content-Type'] = req.headers.get('content-type') || 'application/json'
    }
  }

  const upstream = await fetch(url, { method: req.method, headers, body, cache: 'no-store' })
  const ct = upstream.headers.get('content-type') || ''
  if (upstream.status === 204) return new NextResponse(null, { status: 204 })
  if (ct.includes('application/json')) {
    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data, { status: upstream.status })
  }
  const text = await upstream.text()
  return new NextResponse(text, { status: upstream.status })
}

export async function GET(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }) {
  return proxy(req, ctx.params)
}

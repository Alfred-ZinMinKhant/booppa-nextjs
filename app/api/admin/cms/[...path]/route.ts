// CMS admin proxy. Points at FastAPI's `/api/admin/cms/…` since the Django
// service was retired.
//
// This stayed a separate file rather than collapsing into the sibling
// `app/api/admin/api/[...path]/route.ts` for two reasons: that proxy targets
// `/api/v1/<segments>` (wrong prefix here) and does NOT append a trailing
// slash, whereas the FastAPI CMS routes are declared *with* one. Without the
// slash every write 307-redirects and the POST body can be dropped.
//
// Auth is now the same admin bearer JWT the rest of the admin UI uses; the
// `CMS_ADMIN_TOKEN` shared secret and its `token.length > 10` guard are gone.
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

async function proxy(req: NextRequest, params: { path: string[] }) {
  const adminToken = cookies().get('admin_token')?.value
  if (!adminToken) {
    return NextResponse.json(
      { detail: 'Admin session expired', code: 'admin_session_expired' },
      { status: 401 },
    )
  }

  const segments = params.path.join('/')
  const search = req.nextUrl.search || ''
  const url = `${config.apiUrl}/api/admin/cms/${segments}/${search}`

  const isFormData = (req.headers.get('content-type') || '').includes('multipart/form-data')
  const headers: Record<string, string> = {
    Authorization: `Bearer ${adminToken}`,
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

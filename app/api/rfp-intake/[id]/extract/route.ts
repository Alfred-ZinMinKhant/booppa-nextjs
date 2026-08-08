import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Proxy for the tender-brief file extraction on the paid RFP intake page.
 *
 * The page calls `/api/rfp-intake/{id}/extract` as a bare relative path, which
 * resolves against the Next origin — and only `/api/v1/*`, `/api/public/*` and
 * `/api/admin/intelligence*` are rewritten to the backend. Its siblings
 * (`submit`, `resolve`) had proxies; this one did not, so every brief upload
 * 404'd after payment while the page reported "Extraction failed — please type
 * your brief" and the buyer typed it by hand.
 *
 * Unlike `submit` this forwards multipart/form-data: the body is streamed
 * through untouched and the Content-Type header is deliberately NOT set, so
 * fetch regenerates the multipart boundary rather than reusing a stale one.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const form = await req.formData()
    const res = await fetchWithAuth(
      `/api/v1/rfp-intake/${encodeURIComponent(params.id)}/extract`,
      { method: 'POST', body: form }
    )
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { detail: data.detail || 'Extraction failed' },
        { status: res.status }
      )
    }
    return NextResponse.json(data)
  } catch (error) {
    console.error('[rfp-intake extract proxy]', error)
    return NextResponse.json({ detail: 'Server error' }, { status: 500 })
  }
}

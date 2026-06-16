import { NextRequest, NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Exportable offline artefacts → backend /vendor-artifacts/{name}.pdf (JWT-gated).
const ALLOWED = new Set([
  'badge-certificate',
  'priority-placement',
  'competitor-signals',
  'bid-timing',
])

export async function GET(req: NextRequest, { params }: { params: { artifact: string } }) {
  const name = params.artifact
  if (!ALLOWED.has(name)) {
    return NextResponse.json({ error: 'Unknown artifact' }, { status: 404 })
  }
  try {
    const qs = req.nextUrl.search || '' // forward e.g. ?tenderNo=… for competitor-signals
    const res = await fetchWithAuth(`/api/v1/vendor-artifacts/${name}.pdf${qs}`)
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json(
        { error: detail || 'Could not generate the document' },
        { status: res.status }
      )
    }
    const bytes = await res.arrayBuffer()
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          res.headers.get('content-disposition') ?? `attachment; filename="${name}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[vendor-artifacts proxy]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

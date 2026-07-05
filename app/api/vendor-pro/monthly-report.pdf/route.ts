import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Vendor Pro flagship deliverable → backend /vendor-pro/monthly-report.pdf (JWT-gated).
export async function GET() {
  try {
    const res = await fetchWithAuth('/api/v1/vendor-pro/monthly-report.pdf')
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json(
        { error: detail || 'Could not generate the report' },
        { status: res.status }
      )
    }
    const bytes = await res.arrayBuffer()
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          res.headers.get('content-disposition') ??
          'attachment; filename="monthly-intelligence-report.pdf"',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[vendor-pro monthly-report proxy]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

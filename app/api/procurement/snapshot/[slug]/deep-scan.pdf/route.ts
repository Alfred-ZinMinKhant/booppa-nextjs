import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

/**
 * Deep Scan (L2) audit report → backend
 * /procurement/snapshot/{slug}/deep-scan.pdf (JWT-gated, procurement plan only).
 *
 * Streams the 11-dimension PDPA + certifications + financial-risk PDF back to
 * the browser. Uses the latest persisted Deep Scan, or runs one if none exists.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const res = await fetchWithAuth(
      `/api/v1/procurement/snapshot/${encodeURIComponent(params.slug)}/deep-scan.pdf`,
    )
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json(
        { error: detail || 'Could not generate the Deep Scan report' },
        { status: res.status },
      )
    }
    const bytes = await res.arrayBuffer()
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition':
          res.headers.get('content-disposition') ??
          `attachment; filename="booppa_deep_scan_${params.slug}.pdf"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[deep-scan pdf proxy]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { apiPath } from '@/lib/config'

export const dynamic = 'force-dynamic'

/**
 * Blog CTA click tracking.
 *
 * The two blog articles POST `{ article, cta, action }` here. The route did not
 * exist, so every call 404'd — and because a 404 resolves rather than throws,
 * the surrounding try/catch never noticed and the clicks were silently dropped.
 *
 * The backend funnel collector (`POST /api/v1/funnel/track`) keys on `stage`
 * and carries the rest as `metadata`, so the mapping is explicit here rather
 * than forwarding a body the collector would reject.
 *
 * Tracking must never block the CTA: any failure returns ok:false with 202 so
 * the caller proceeds to checkout or navigation regardless.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as Record<string, unknown>))
  const { article, cta, action, ...rest } = body as Record<string, unknown>

  try {
    const r = await fetch(apiPath('/funnel/track'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage: typeof action === 'string' && action ? `blog_cta_${action}` : 'blog_cta',
        source: typeof article === 'string' ? article : undefined,
        metadata: { article, cta, action, ...rest },
      }),
      cache: 'no-store',
    })
    if (!r.ok) return NextResponse.json({ ok: false }, { status: 202 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 })
  }

  return NextResponse.json({ ok: true })
}

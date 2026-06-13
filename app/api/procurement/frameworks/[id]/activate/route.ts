import { NextResponse } from 'next/server'
import { fetchWithAuth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetchWithAuth(`/api/v1/procurement/frameworks/${params.id}/activate`, {
      method: 'POST',
    })
    return NextResponse.json(await res.json().catch(() => ({})), { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Failed to activate framework' }, { status: 500 })
  }
}

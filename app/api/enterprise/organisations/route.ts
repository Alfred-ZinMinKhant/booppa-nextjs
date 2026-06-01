import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

/** List the current user's enterprise organisations. */
export async function GET() {
  const token = cookies().get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const r = await fetch(`${config.apiUrl}/enterprise/organisations`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  const body = await r.json().catch(() => ([]))
  return NextResponse.json(body, { status: r.status })
}

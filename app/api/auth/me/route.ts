import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const res = await fetch(`${config.apiUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const response = NextResponse.json(data)
  // Sync vendor_plan cookie with the current plan from the backend.
  // This ensures post-payment state is reflected immediately (e.g. after Stripe checkout).
  if (data.plan) {
    response.cookies.set('vendor_plan', data.plan, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })
  }
  return response
}

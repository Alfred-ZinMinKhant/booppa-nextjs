import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetch(`${config.apiUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  const response = NextResponse.json({ ok: true })
  const isProduction = process.env.NODE_ENV === 'production'

  response.cookies.set('token', data.access_token, {
    httpOnly: true,
    path: '/',
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  response.cookies.set('refreshToken', data.refresh_token, {
    httpOnly: true,
    path: '/',
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  return response
}

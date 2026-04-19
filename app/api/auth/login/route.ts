import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { signCookieValue } from '@/lib/cookie-signing'

export async function POST(req: NextRequest) {
  const body = await req.json()

  const res = await fetch(`${config.apiUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  console.log('[LOGIN] Backend status:', res.status)
  console.log('[LOGIN] Backend response:', text)

  let data: any
  try {
    data = JSON.parse(text)
  } catch (e) {
    console.error('[LOGIN] Failed to parse response as JSON:', e)
    return NextResponse.json({ error: 'Invalid backend response' }, { status: 502 })
  }

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  console.log('[LOGIN] Setting cookies, plan:', data.plan)
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
  response.cookies.set('vendor_plan', await signCookieValue(data.plan || 'free'), {
    httpOnly: true,
    path: '/',
    secure: isProduction,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  return response
}

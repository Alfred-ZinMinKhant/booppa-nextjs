import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const username = body.username || body.email
    const password = body.password
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })
    }

    const res = await fetch(`${config.apiUrl}/api/v1/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || 'Invalid admin credentials' },
        { status: res.status }
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set('admin_token', data.access_token, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24h — keep in sync with create_admin_token() TTL
      sameSite: 'lax',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

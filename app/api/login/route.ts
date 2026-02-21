import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config, endpoints } from '@/lib/config'
import type { LoginRequest, LoginResponse } from '@/types'

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e password sono obbligatori' },
        { status: 400 }
      )
    }

    const res = await fetch(`${config.apiUrl}${endpoints.auth.login}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Credenziali non valide' },
        { status: res.status }
      )
    }

    const data: LoginResponse = await res.json()
    const isProduction = process.env.NODE_ENV === 'production'

    cookies().set({
      name: 'token',
      value: data.token,
      httpOnly: true,
      path: '/',
      secure: isProduction,
      maxAge: config.tokenMaxAge,
      sameSite: 'lax',
    })

    cookies().set({
      name: 'refreshToken',
      value: data.refreshToken,
      httpOnly: true,
      path: '/',
      secure: isProduction,
      maxAge: config.refreshTokenMaxAge,
      sameSite: 'lax',
    })

    return NextResponse.json({ user: data.user, message: 'Login effettuato con successo' })
  } catch {
    return NextResponse.json({ error: 'Errore del server. Riprova più tardi.' }, { status: 500 })
  }
}

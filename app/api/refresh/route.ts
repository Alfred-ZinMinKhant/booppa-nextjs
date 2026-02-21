import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config, endpoints } from '@/lib/config'
import type { RefreshTokenResponse } from '@/types'

export async function POST() {
  try {
    const refreshToken = cookies().get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token non trovato' }, { status: 401 })
    }

    const res = await fetch(`${config.apiUrl}${endpoints.auth.refresh}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) {
      cookies().delete('token')
      cookies().delete('refreshToken')
      return NextResponse.json({ error: 'Refresh token non valido' }, { status: 401 })
    }

    const data: RefreshTokenResponse = await res.json()
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

    return NextResponse.json({ message: 'Token aggiornato con successo' })
  } catch {
    return NextResponse.json({ error: 'Errore durante il refresh del token' }, { status: 500 })
  }
}

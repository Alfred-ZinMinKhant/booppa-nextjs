import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { config, endpoints } from '@/lib/config'

export async function POST() {
  try {
    const token = cookies().get('token')?.value

    // Notifica il backend (best-effort: se fallisce, puliamo i cookie lo stesso)
    if (token) {
      await fetch(`${config.apiUrl}${endpoints.auth.logout}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }

    cookies().delete('token')
    cookies().delete('refreshToken')

    return NextResponse.json({ message: 'Logout effettuato con successo' })
  } catch {
    return NextResponse.json({ error: 'Errore durante il logout' }, { status: 500 })
  }
}

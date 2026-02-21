import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Questa route restituisce un token SHORT-LIVED usabile dal client
 * per autenticare la connessione WebSocket.
 *
 * Perché esiste:
 *   Il token JWT è in un cookie HttpOnly → document.cookie non lo vede.
 *   Il WebSocket (socket.io) ha bisogno del token per autenticarsi.
 *   Soluzione: il server legge il cookie HttpOnly e restituisce
 *   il valore in JSON, che il client usa SOLO per la handshake WS
 *   (non viene mai salvato in localStorage o altri storage persistenti).
 *
 * Sicurezza:
 *   - La route è protetta: se non c'è cookie non restituisce nulla.
 *   - Il token è già firmato/validato dal backend; non produciamo nuovi segreti.
 *   - SameSite=Lax sui cookie previene CSRF.
 */
export async function GET() {
  const token = cookies().get('token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }

  return NextResponse.json({ wsToken: token })
}

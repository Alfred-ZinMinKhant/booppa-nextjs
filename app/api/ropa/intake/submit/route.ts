import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

// Finalise the buyer's ROPA: flip draft rows to submitted and (if PDPA + RFP
// are already done) re-fire the Cover Sheet generation on the backend.
export async function POST(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const res = await fetch(`${config.apiUrl}/api/v1/ropa/intake/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

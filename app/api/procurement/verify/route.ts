import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash')
  if (!hash) {
    return NextResponse.json({ error: 'Missing hash parameter' }, { status: 400 })
  }

  try {
    const res = await fetch(`${config.apiUrl}/api/v1/verify/${hash}`, {
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Verification failed', status: res.status }, { status: res.status })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ error: 'Verification request failed' }, { status: 500 })
  }
}

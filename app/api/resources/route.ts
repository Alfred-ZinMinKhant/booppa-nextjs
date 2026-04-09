import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  const res = await fetch(`${config.apiUrl}/api/v1/resources/`, {
    next: { revalidate: 300 },
  })
  const data = await res.json().catch(() => ({ categories: {} }))
  return NextResponse.json(data, { status: res.ok ? 200 : 500 })
}

import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  try {
    const res = await fetch(`${config.apiUrl}/api/v1/platform-stats`, {
      next: { revalidate: 300 }, // cache for 5 minutes
    })
    if (!res.ok) {
      return NextResponse.json({ vendorsIndexed: 0, verifiedEntities: 0, openTenders: 0 })
    }
    return NextResponse.json(await res.json())
  } catch {
    return NextResponse.json({ vendorsIndexed: 0, verifiedEntities: 0, openTenders: 0 })
  }
}

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Parse CSV
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must contain header and at least one vendor' },
        { status: 400 }
      )
    }

    // Skip header, parse vendors
    const vendors = lines.slice(1).map(line => {
      const [name, email, category] = line.split(',').map(s => s.trim())
      return { name, email, category }
    }).filter(v => v.email && v.email.includes('@'))

    if (vendors.length === 0) {
      return NextResponse.json(
        { error: 'No valid vendor emails found' },
        { status: 400 }
      )
    }

    // Decode company name from JWT in the httpOnly token cookie
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    let requesterCompany = 'Unknown Enterprise';
    if (token) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64url').toString('utf8')
        );
        requesterCompany = payload.company || payload.sub || 'Unknown Enterprise';
      } catch { /* invalid token shape — keep default */ }
    }

    // Send requests to backend
    const { config } = await import('@/lib/config');
    const response = await fetch(`${config.apiUrl}/api/v1/enterprise/send-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        vendors,
        requester_company: requesterCompany,
        request_type: 'booppa-proof'
      })
    })

    if (!response.ok) {
      throw new Error('Backend request failed')
    }

    const result = await response.json()

    return NextResponse.json({
      sent_count: vendors.length,
      vendors: vendors.map(v => v.email),
      request_ids: result.request_ids || []
    })

  } catch (error: any) {
    console.error('[Bulk Request] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

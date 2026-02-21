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

    // Send requests to backend
    // This triggers the "Enterprise Loop" from Blueprint v19.5
    const response = await fetch(`${process.env.API_URL}/api/enterprise/send-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.headers.get('authorization')?.split(' ')[1]}`
      },
      body: JSON.stringify({
        vendors,
        requester_company: 'Enterprise Corp', // from JWT
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

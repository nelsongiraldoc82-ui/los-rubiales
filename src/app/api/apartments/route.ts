import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json([])
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  try {
    const response = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: 'SELECT id, name, description, capacity FROM Apartment' } },
          { type: 'close' }
        ]
      })
    })

    const data = await response.json()
    const rows = data.results?.[0]?.response?.result?.rows || []

    const apartments = rows.map((r: any) => ({
      id: r[0]?.value || '',
      name: r[1]?.value || '',
      description: r[2]?.value || '',
      capacity: parseInt(r[3]?.value) || 6,
      _count: { registrations: 0 }
    }))

    return NextResponse.json(apartments)

  } catch (e) {
    return NextResponse.json([])
  }
}

import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    console.log('APARTMENTS: Variables de entorno no configuradas')
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
        requests: [{
          type: 'execute',
          stmt: { sql: 'SELECT id, name, description, capacity FROM Apartment' }
        }, { type: 'close' }]
      })
    })

    const data = await response.json()
    const rows = data.results?.[0]?.response?.result?.rows

    if (!rows || rows.length === 0) {
      return NextResponse.json([])
    }

    const apartments = rows.map((row: any[]) => ({
      id: row[0],
      name: row[1],
      description: row[2],
      capacity: parseInt(row[3]) || 6,
      _count: { registrations: 0 }
    }))

    return NextResponse.json(apartments)

  } catch (e) {
    console.error('Error loading apartments:', e)
    return NextResponse.json([])
  }
}

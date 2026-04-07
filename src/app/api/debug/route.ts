import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'Variables no configuradas' })
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
          { type: 'execute', stmt: { sql: 'SELECT * FROM Apartment' } },
          { type: 'close' }
        ]
      })
    })

    const data = await response.json()

    return NextResponse.json({
      tursoUrl: tursoUrl ? 'configurado' : 'NO',
      token: tursoToken ? 'configurado' : 'NO',
      httpUrl: httpUrl,
      responseStatus: response.status,
      rawData: data
    })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}

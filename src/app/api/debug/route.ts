import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'Sin credenciales' })
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
          { type: 'execute', stmt: { sql: 'SELECT id, name, description, capacity FROM Apartment LIMIT 1' } },
          { type: 'close' }
        ]
      })
    })

    const data = await response.json()

    return NextResponse.json({
      rawResponse: data,
      resultsPath: data.results?.[0]?.response?.result,
      rowsPath: data.results?.[0]?.response?.result?.rows,
      firstRow: data.results?.[0]?.response?.result?.rows?.[0],
      firstRowType: typeof data.results?.[0]?.response?.result?.rows?.[0],
      firstRowKeys: data.results?.[0]?.response?.result?.rows?.[0] ? Object.keys(data.results?.[0]?.response?.result?.rows?.[0]) : null
    })

  } catch (error) {
    return NextResponse.json({ error: String(error) })
  }
}

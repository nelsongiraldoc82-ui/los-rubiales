import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({
      error: 'Variables no configuradas',
      tursoUrl: tursoUrl || 'NO',
      tursoToken: tursoToken ? 'SÍ' : 'NO'
    })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  try {
    const response = await fetch(`${httpUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tursoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          type: 'execute',
          stmt: { sql: 'SELECT 1 as test' }
        }, { type: 'close' }]
      })
    })

    const text = await response.text()

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      body: text.substring(0, 500)
    })

  } catch (error) {
    return NextResponse.json({
      error: String(error),
      httpUrl: httpUrl
    })
  }
}

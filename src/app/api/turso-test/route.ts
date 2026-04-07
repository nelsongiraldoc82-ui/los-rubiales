import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Paso 1: Verificar variables
  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({
      step: 'variables',
      error: 'Variables no configuradas',
      tursoUrl: tursoUrl || 'NO',
      tursoToken: tursoToken ? 'SÍ (longitud: ' + tursoToken.length + ')' : 'NO'
    })
  }

  // Paso 2: Construir URL HTTP
  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  // Paso 3: Hacer petición simple
  try {
    const response = await fetch(`${httpUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tursoToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            type: 'execute',
            stmt: {
              sql: 'SELECT 1 as test'
            }
          },
          { type: 'close' }
        ]
      })
    })

    const responseText = await response.text()

    return NextResponse.json({
      step: 'fetch',
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      body: responseText.substring(0, 500)
    })

  } catch (error) {
    return NextResponse.json({
      step: 'fetch_error',
      error: String(error),
      errorType: error?.constructor?.name,
      tursoUrl: tursoUrl,
      httpUrl: httpUrl
    })
  }
}

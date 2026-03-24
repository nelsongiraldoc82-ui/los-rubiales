import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ id, guests: [], status: 'active' })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'No configurado' }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  try {
    if (body.status) {
      const sql = `UPDATE GuestRegistration SET status = '${body.status}' WHERE id = '${id}'`
      await fetch(httpUrl + '/v2/pipeline', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + tursoToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{ type: 'execute', stmt: { sql } }, { type: 'close' }]
        })
      })
    }

    return NextResponse.json({ success: true })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'No configurado' }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  try {
    await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql: `DELETE FROM Guest WHERE registrationId = '${id}'` } }, { type: 'close' }]
      })
    })

    await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql: `DELETE FROM GuestRegistration WHERE id = '${id}'` } }, { type: 'close' }]
      })
    })

    return NextResponse.json({ success: true })

  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

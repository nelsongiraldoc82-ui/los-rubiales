import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'Base de datos no configurada' }, { status: 500 })
  }

  try {
    const db = createClient({ url: tursoUrl, authToken: tursoToken })
    const result = await db.execute(`
      SELECT a.id, a.name, a.description, a.capacity,
        (SELECT COUNT(*) FROM GuestRegistration gr WHERE gr.apartmentId = a.id) as registrationCount
      FROM Apartment a
    `)

    const apartments = result.rows.map(row => ({
      id: row.id, name: row.name, description: row.description, capacity: row.capacity,
      _count: { registrations: Number(row.registrationCount) || 0 }
    }))

    return NextResponse.json(apartments)
  } catch (error) {
    return NextResponse.json({ error: 'Error', details: String(error) }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({ error: 'Variables no configuradas' })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')

  async function query(sql: string) {
    const response = await fetch(httpUrl + '/v2/pipeline', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + tursoToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ type: 'execute', stmt: { sql: sql } }, { type: 'close' }]
      })
    })
    const data = await response.json()
    return data.results?.[0]?.response?.result
  }

  try {
    // Crear tablas
    await query('CREATE TABLE IF NOT EXISTS Apartment (id TEXT PRIMARY KEY, name TEXT UNIQUE, description TEXT, capacity INTEGER, createdAt TEXT, updatedAt TEXT)')
    await query('CREATE TABLE IF NOT EXISTS GuestRegistration (id TEXT PRIMARY KEY, apartmentId TEXT, checkInDate TEXT, checkOutDate TEXT, status TEXT, notes TEXT, signature TEXT, createdAt TEXT, updatedAt TEXT)')
    await query('CREATE TABLE IF NOT EXISTS Guest (id TEXT PRIMARY KEY, registrationId TEXT, firstName TEXT, lastName TEXT, documentType TEXT, documentNumber TEXT, documentPhoto TEXT, nationality TEXT, dateOfBirth TEXT, email TEXT, phone TEXT, address TEXT, city TEXT, postalCode TEXT, isMainGuest INTEGER)')

    // Crear los 3 apartamentos (INSERT OR IGNORE evita duplicados)
    const t = Date.now()
    await query("INSERT OR IGNORE INTO Apartment VALUES ('apt1_" + t + "', 'Apartamento 1', 'Apartamento rural Los Rubiales', 6, datetime('now'), datetime('now'))")
    await query("INSERT OR IGNORE INTO Apartment VALUES ('apt2_" + t + "', 'Apartamento 2', 'Apartamento rural Los Rubiales', 6, datetime('now'), datetime('now'))")
    await query("INSERT OR IGNORE INTO Apartment VALUES ('apt3_" + t + "', 'Apartamento 3', 'Apartamento rural Los Rubiales', 6, datetime('now'), datetime('now'))")

    // Obtener todos los apartamentos
    const result = await query('SELECT id, name, description, capacity FROM Apartment')
    const apartments = result?.rows?.map((r: any) => ({
      id: r[0]?.value,
      name: r[1]?.value,
      description: r[2]?.value,
      capacity: r[3]?.value
    })) || []

    return NextResponse.json({ 
      success: true, 
      message: 'Base de datos configurada correctamente',
      apartments 
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 })
  }
}

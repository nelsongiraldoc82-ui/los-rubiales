import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    return NextResponse.json({
      error: 'Variables de entorno faltantes',
      TURSO_DATABASE_URL: tursoUrl || 'NO',
      TURSO_AUTH_TOKEN: tursoToken ? 'SÍ' : 'NO'
    }, { status: 500 })
  }

  try {
    const db = createClient({ url: tursoUrl, authToken: tursoToken })

    // Crear tablas
    await db.execute(`CREATE TABLE IF NOT EXISTS Apartment (
      id TEXT PRIMARY KEY, name TEXT UNIQUE, description TEXT,
      capacity INTEGER DEFAULT 6, createdAt TEXT, updatedAt TEXT
    )`)

    await db.execute(`CREATE TABLE IF NOT EXISTS GuestRegistration (
      id TEXT PRIMARY KEY, apartmentId TEXT NOT NULL, checkInDate TEXT,
      checkOutDate TEXT, status TEXT DEFAULT 'active', notes TEXT,
      signature TEXT, createdAt TEXT, updatedAt TEXT
    )`)

    await db.execute(`CREATE TABLE IF NOT EXISTS Guest (
      id TEXT PRIMARY KEY, registrationId TEXT NOT NULL, firstName TEXT NOT NULL,
      lastName TEXT NOT NULL, documentType TEXT, documentNumber TEXT NOT NULL,
      documentPhoto TEXT, nationality TEXT, dateOfBirth TEXT, email TEXT,
      phone TEXT, address TEXT, city TEXT, postalCode TEXT, isMainGuest INTEGER
    )`)

    // Verificar apartamentos existentes
    const existing = await db.execute('SELECT COUNT(*) as count FROM Apartment')
    
    if (Number(existing.rows[0].count) > 0) {
      const apartments = await db.execute('SELECT * FROM Apartment')
      return NextResponse.json({ success: true, apartments: apartments.rows })
    }

    // Crear apartamentos
    const ts = Date.now()
    await db.execute({ sql: 'INSERT INTO Apartment (id, name, description, capacity) VALUES (?, ?, ?, ?)',
      args: [`apt1_${ts}`, 'Apartamento 1', 'Apartamento rural Los Rubiales', 6] })
    await db.execute({ sql: 'INSERT INTO Apartment (id, name, description, capacity) VALUES (?, ?, ?, ?)',
      args: [`apt2_${ts}`, 'Apartamento 2', 'Apartamento rural Los Rubiales', 6] })
    await db.execute({ sql: 'INSERT INTO Apartment (id, name, description, capacity) VALUES (?, ?, ?, ?)',
      args: [`apt3_${ts}`, 'Apartamento 3', 'Apartamento rural Los Rubiales', 6] })

    const apartments = await db.execute('SELECT * FROM Apartment')
    return NextResponse.json({ success: true, apartments: apartments.rows })

  } catch (error) {
    return NextResponse.json({ error: 'Error', details: String(error) }, { status: 500 })
  }
}

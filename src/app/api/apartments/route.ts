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
    const rows = data.results?.[0]?.response?.result?.rows

    if (!rows || rows.length === 0) {
      return NextResponse.json([])
    }

    // DEBUG: Ver la estructura exacta del primer row
    const firstRow = rows[0]
    
    // Intentar extraer de diferentes formas
    const apartments = rows.map((row: any, index: number) => {
      // Si es un objeto con claves nombradas
      if (row.id !== undefined || row.name !== undefined) {
        return {
          id: row.id?.value || row.id || `apt_${index}`,
          name: row.name?.value || row.name || `Apartamento ${index + 1}`,
          description: row.description?.value || row.description || null,
          capacity: row.capacity?.value || row.capacity || 6,
          _count: { registrations: 0 }
        }
      }
      
      // Si es un array [id, name, description, capacity]
      if (Array.isArray(row)) {
        return {
          id: row[0]?.value || row[0] || `apt_${index}`,
          name: row[1]?.value || row[1] || `Apartamento ${index + 1}`,
          description: row[2]?.value || row[2] || null,
          capacity: row[3]?.value || row[3] || 6,
          _count: { registrations: 0 }
        }
      }
      
      // Fallback - usar las claves del objeto
      const keys = Object.keys(row)
      return {
        id: row[keys[0]]?.value || row[keys[0]] || `apt_${index}`,
        name: row[keys[1]]?.value || row[keys[1]] || `Apartamento ${index + 1}`,
        description: row[keys[2]]?.value || row[keys[2]] || null,
        capacity: row[keys[3]]?.value || row[keys[3]] || 6,
        _count: { registrations: 0 }
      }
    })

    return NextResponse.json({
      debug: {
        firstRowKeys: Object.keys(firstRow),
        firstRowSample: firstRow
      },
      apartments
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: String(error) })
  }
}

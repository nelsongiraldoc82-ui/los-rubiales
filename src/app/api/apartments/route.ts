import { NextResponse } from 'next/server'

// Función auxiliar para extraer valor del formato Turso
function getValue(cell: any): any {
  if (cell && typeof cell === 'object' && 'value' in cell) {
    return cell.value
  }
  return cell
}

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  console.log('TURSO_DATABASE_URL:', tursoUrl ? 'configured' : 'NOT SET')
  console.log('TURSO_AUTH_TOKEN:', tursoToken ? 'configured' : 'NOT SET')

  if (!tursoUrl || !tursoToken) {
    console.error('Variables de entorno no configuradas')
    return NextResponse.json({ 
      error: 'Variables de entorno no configuradas',
      hint: 'Añade TURSO_DATABASE_URL y TURSO_AUTH_TOKEN en Vercel'
    }, { status: 500 })
  }

  const httpUrl = tursoUrl.replace('libsql://', 'https://')
  console.log('Fetching from:', httpUrl)

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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Turso API error:', response.status, errorText)
      return NextResponse.json({ error: 'Turso API error: ' + response.status }, { status: 500 })
    }

    const data = await response.json()
    console.log('Turso response:', JSON.stringify(data, null, 2))
    
    const rows = data.results?.[0]?.response?.result?.rows

    if (!rows || rows.length === 0) {
      console.log('No apartments found, returning empty array')
      return NextResponse.json([])
    }

    // Manejar el formato de Turso: cada celda es {type, value}
    const apartments = rows.map((row: any[]) => ({
      id: getValue(row[0]),
      name: getValue(row[1]),
      description: getValue(row[2]),
      capacity: parseInt(getValue(row[3])) || 6,
      _count: { registrations: 0 }
    }))

    console.log('Apartments parsed:', apartments)
    return NextResponse.json(apartments)

  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

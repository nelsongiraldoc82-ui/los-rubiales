import { NextResponse } from 'next/server'

async function tursoQuery(sql: string) {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  const httpUrl = tursoUrl!.replace('libsql://', 'https://')

  const response = await fetch(`${httpUrl}/v2/pipeline`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tursoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        type: 'execute',
        stmt: { sql }
      }, { type: 'close' }]
    })
  })

  const data = await response.json()
  return data.results?.[0]?.response?.result
}

export async function GET() {
  try {
    const result = await tursoQuery(`
      SELECT a.id, a.name, a.description, a.capacity,
        (SELECT COUNT(*) FROM GuestRegistration gr WHERE gr.apartmentId = a.id) as registrationCount
      FROM Apartment a
    `)

    const apartments = result?.rows?.map((row: any[]) => {
      const obj: any = {}
      result.cols?.forEach((col: any, i: number) => {
        obj[col.name] = row[i]?.value
      })
      return {
        id: obj.id,
        name: obj.name,
        description: obj.description,
        capacity: Number(obj.capacity) || 6,
        _count: { registrations: Number(obj.registrationCount) || 0 }
      }
    }) || []

    return NextResponse.json(apartments)
  } catch (error) {
    return NextResponse.json({
      error: 'Error al obtener apartamentos',
      details: String(error)
    }, { status: 500 })
  }
}

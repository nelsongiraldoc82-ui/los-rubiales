import { NextResponse } from 'next/server'
import { tursoExecute, parseTursoRows } from '@/lib/turso'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const regResult = await tursoExecute(
      `SELECT r.*, a.id as apt_id, a.name as apt_name, a.description as apt_description, a.capacity as apt_capacity
       FROM GuestRegistration r
       LEFT JOIN Apartment a ON r.apartmentId = a.id
       WHERE r.id = ?`,
      [id]
    )

    const rows = parseTursoRows(regResult)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 })
    }

    const row = rows[0]

    const guestsResult = await tursoExecute(
      'SELECT * FROM Guest WHERE registrationId = ?',
      [id]
    )

    const registration = {
      id: row.id,
      apartmentId: row.apartmentId,
      apartment: {
        id: row.apt_id,
        name: row.apt_name,
        description: row.apt_description,
        capacity: row.apt_capacity
      },
      checkInDate: row.checkInDate,
      checkOutDate: row.checkOutDate,
      status: row.status,
      notes: row.notes,
      signature: row.signature,
      guests: parseTursoRows(guestsResult).map(g => ({
        id: g.id,
        firstName: g.firstName,
        lastName: g.lastName,
        documentType: g.documentType || 'DNI',
        documentNumber: g.documentNumber,
        documentPhoto: g.documentPhoto,
        nationality: g.nationality,
        dateOfBirth: g.dateOfBirth,
        email: g.email,
        phone: g.phone,
        address: g.address,
        city: g.city,
        postalCode: g.postalCode,
        isMainGuest: Boolean(g.isMainGuest)
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al obtener registro', details: String(error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (body.status) {
      await tursoExecute(
        'UPDATE GuestRegistration SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [body.status, id]
      )
    }

    if (body.notes !== undefined) {
      await tursoExecute(
        'UPDATE GuestRegistration SET notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [body.notes, id]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al actualizar', details: String(error) }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Eliminar huéspedes primero
    await tursoExecute('DELETE FROM Guest WHERE registrationId = ?', [id])

    // Eliminar registro
    await tursoExecute('DELETE FROM GuestRegistration WHERE id = ?', [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Error al eliminar', details: String(error) }, { status: 500 })
  }
}

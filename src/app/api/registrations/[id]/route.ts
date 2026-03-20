import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener un registro específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const registration = await db.guestRegistration.findUnique({
      where: { id },
      include: {
        apartment: true,
        guests: {
          orderBy: {
            isMainGuest: 'desc'
          }
        }
      }
    })

    if (!registration) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error fetching registration:', error)
    return NextResponse.json(
      { error: 'Error al obtener el registro' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar registro (ej: checkout, añadir notas)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, checkOutDate, guests } = body

    // Verificar que el registro existe
    const existingRegistration = await db.guestRegistration.findUnique({
      where: { id }
    })

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: {
      status?: string
      notes?: string
      checkOutDate?: Date | null
    } = {}

    if (status !== undefined) {
      updateData.status = status
      if (status === 'checked_out') {
        updateData.checkOutDate = checkOutDate ? new Date(checkOutDate) : new Date()
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes
    }

    // Actualizar el registro
    const registration = await db.guestRegistration.update({
      where: { id },
      data: updateData,
      include: {
        apartment: true,
        guests: true
      }
    })

    // Si se proporcionan huéspedes, actualizarlos
    if (guests && Array.isArray(guests)) {
      // Eliminar huéspedes existentes y crear nuevos
      await db.guest.deleteMany({
        where: { registrationId: id }
      })

      await db.guest.createMany({
        data: guests.map((guest: {
          firstName: string
          lastName: string
          documentType: string
          documentNumber: string
          documentPhoto?: string
          nationality?: string
          dateOfBirth?: string
          email?: string
          phone?: string
          address?: string
          city?: string
          postalCode?: string
          isMainGuest: boolean
        }) => ({
          registrationId: id,
          firstName: guest.firstName,
          lastName: guest.lastName,
          documentType: guest.documentType || 'DNI',
          documentNumber: guest.documentNumber,
          documentPhoto: guest.documentPhoto,
          nationality: guest.nationality,
          dateOfBirth: guest.dateOfBirth,
          email: guest.email,
          phone: guest.phone,
          address: guest.address,
          city: guest.city,
          postalCode: guest.postalCode,
          isMainGuest: guest.isMainGuest || false
        }))
      })

      // Obtener el registro actualizado con los nuevos huéspedes
      const updatedRegistration = await db.guestRegistration.findUnique({
        where: { id },
        include: {
          apartment: true,
          guests: true
        }
      })

      return NextResponse.json(updatedRegistration)
    }

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error updating registration:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el registro' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que el registro existe
    const existingRegistration = await db.guestRegistration.findUnique({
      where: { id }
    })

    if (!existingRegistration) {
      return NextResponse.json(
        { error: 'Registro no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el registro (los huéspedes se eliminan en cascada)
    await db.guestRegistration.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Registro eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting registration:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el registro' },
      { status: 500 }
    )
  }
}

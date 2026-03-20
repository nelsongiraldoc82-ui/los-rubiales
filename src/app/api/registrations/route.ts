import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todos los registros con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const apartmentId = searchParams.get('apartmentId')
    const status = searchParams.get('status')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    const where: {
      apartmentId?: string
      status?: string
      checkInDate?: { gte?: Date; lte?: Date }
    } = {}

    if (apartmentId) {
      where.apartmentId = apartmentId
    }

    if (status) {
      where.status = status
    }

    if (fromDate || toDate) {
      where.checkInDate = {}
      if (fromDate) {
        where.checkInDate.gte = new Date(fromDate)
      }
      if (toDate) {
        where.checkInDate.lte = new Date(toDate)
      }
    }

    const registrations = await db.guestRegistration.findMany({
      where,
      include: {
        apartment: true,
        guests: true
      },
      orderBy: {
        checkInDate: 'desc'
      }
    })

    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return NextResponse.json(
      { error: 'Error al obtener los registros' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo registro con huéspedes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apartmentId, guests, notes, signature, checkInDate, checkOutDate } = body

    if (!apartmentId) {
      return NextResponse.json(
        { error: 'El apartamento es requerido' },
        { status: 400 }
      )
    }

    if (!guests || !Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json(
        { error: 'Debe añadir al menos un huésped' },
        { status: 400 }
      )
    }

    // Validar que haya un huésped principal
    const hasMainGuest = guests.some((g: { isMainGuest: boolean }) => g.isMainGuest)
    if (!hasMainGuest && guests.length > 0) {
      guests[0].isMainGuest = true
    }

    // Verificar que el apartamento existe
    const apartment = await db.apartment.findUnique({
      where: { id: apartmentId }
    })

    if (!apartment) {
      return NextResponse.json(
        { error: 'El apartamento no existe' },
        { status: 404 }
      )
    }

    // Crear el registro con los huéspedes
    const registration = await db.guestRegistration.create({
      data: {
        apartmentId,
        notes,
        signature,
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
        guests: {
          create: guests.map((guest: {
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
        }
      },
      include: {
        apartment: true,
        guests: true
      }
    })

    return NextResponse.json(registration, { status: 201 })
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json(
      { error: 'Error al crear el registro' },
      { status: 500 }
    )
  }
}

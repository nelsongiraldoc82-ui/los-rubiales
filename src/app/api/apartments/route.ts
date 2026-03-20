import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const apartments = await db.apartment.findMany({
      orderBy: {
        name: 'asc'
      },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: 'active'
              }
            }
          }
        }
      }
    })

    return NextResponse.json(apartments)
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json(
      { error: 'Error al obtener los apartamentos' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Inicializar apartamentos si no existen
export async function GET() {
  try {
    // Verificar si ya existen apartamentos
    const existingApartments = await prisma.apartment.count()
    
    if (existingApartments > 0) {
      return NextResponse.json({
        status: 'already_initialized',
        apartmentsCount: existingApartments,
        message: 'Los apartamentos ya están configurados'
      })
    }

    // Crear los 3 apartamentos
    await prisma.apartment.createMany({
      data: [
        { name: 'Apartamento 1', description: 'Apartamento rural Los Rubiales', capacity: 6 },
        { name: 'Apartamento 2', description: 'Apartamento rural Los Rubiales', capacity: 6 },
        { name: 'Apartamento 3', description: 'Apartamento rural Los Rubiales', capacity: 6 },
      ]
    })

    return NextResponse.json({
      success: true,
      message: 'Apartamentos creados correctamente',
      apartments: [
        { name: 'Apartamento 1', capacity: 6 },
        { name: 'Apartamento 2', capacity: 6 },
        { name: 'Apartamento 3', capacity: 6 },
      ]
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Error al inicializar', details: String(error) },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, unlink } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

const execAsync = promisify(exec)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const language = searchParams.get('lang') || 'es'
    const apartmentId = searchParams.get('apartmentId')
    const status = searchParams.get('status')

    // Obtener registros con filtros
    const where: any = {}
    if (apartmentId && apartmentId !== 'all') {
      where.apartmentId = apartmentId
    }
    if (status && status !== 'all') {
      where.status = status
    }

    const registrations = await prisma.guestRegistration.findMany({
      where,
      include: {
        apartment: true,
        guests: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Preparar datos para el script de Python
    const data = registrations.map(reg => ({
      id: reg.id,
      apartment: {
        name: reg.apartment.name
      },
      checkInDate: reg.checkInDate.toISOString(),
      checkOutDate: reg.checkOutDate?.toISOString() || null,
      status: reg.status,
      notes: reg.notes,
      guests: reg.guests.map(g => ({
        firstName: g.firstName,
        lastName: g.lastName,
        documentType: g.documentType,
        documentNumber: g.documentNumber,
        isMainGuest: g.isMainGuest
      }))
    }))

    // Crear archivo temporal para el PDF
    const timestamp = Date.now()
    const outputPath = path.join('/tmp', `registrations_${timestamp}.pdf`)
    const jsonData = JSON.stringify(data)

    // Ejecutar script de Python
    const scriptPath = path.join(process.cwd(), 'scripts', 'generate_registrations_pdf.py')

    // Escribir JSON a archivo temporal para evitar problemas con caracteres especiales
    const jsonTempPath = path.join('/tmp', `data_${timestamp}.json`)
    const { writeFile } = await import('fs/promises')
    await writeFile(jsonTempPath, jsonData, 'utf-8')

    try {
      await execAsync(`python3 "${scriptPath}" "${outputPath}" "${language}" "$(cat "${jsonTempPath}")"`, {
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer
      })
    } finally {
      // Limpiar archivo JSON temporal
      await unlink(jsonTempPath).catch(() => {})
    }

    // Leer el PDF generado
    const pdfBuffer = await readFile(outputPath)

    // Eliminar archivo temporal
    await unlink(outputPath).catch(() => {})

    // Devolver el PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="registros_los_rubiales_${timestamp}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error generating PDF' },
      { status: 500 }
    )
  }
}

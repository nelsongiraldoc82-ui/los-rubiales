#!/usr/bin/env python3
"""
Script para generar PDF de registros de huéspedes del Hotel Los Rubiales
"""
import sys
import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    Image, PageBreak, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Registrar fuentes
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Colores del hotel
HOTEL_GREEN = colors.HexColor('#1a5f2a')
HOTEL_GREEN_LIGHT = colors.HexColor('#f0f7f0')
TABLE_HEADER = colors.HexColor('#1F4E79')
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')

def create_styles():
    """Crear estilos para el documento"""
    styles = getSampleStyleSheet()

    # Título principal
    styles.add(ParagraphStyle(
        name='MainTitle',
        fontName='Times New Roman',
        fontSize=24,
        textColor=HOTEL_GREEN,
        alignment=TA_CENTER,
        spaceAfter=12,
        leading=30
    ))

    # Subtítulo
    styles.add(ParagraphStyle(
        name='Subtitle',
        fontName='Times New Roman',
        fontSize=14,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER,
        spaceAfter=20,
        leading=18
    ))

    # Título de sección
    styles.add(ParagraphStyle(
        name='SectionTitle',
        fontName='Times New Roman',
        fontSize=14,
        textColor=HOTEL_GREEN,
        alignment=TA_LEFT,
        spaceBefore=12,
        spaceAfter=8,
        leading=18
    ))

    # Texto normal
    styles.add(ParagraphStyle(
        name='BodyText',
        fontName='Times New Roman',
        fontSize=10,
        textColor=colors.black,
        alignment=TA_JUSTIFY,
        spaceBefore=4,
        spaceAfter=4,
        leading=14
    ))

    # Estilo para celdas de tabla
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Times New Roman',
        fontSize=9,
        textColor=colors.black,
        alignment=TA_CENTER,
        leading=12
    ))

    # Estilo para encabezados de tabla
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Times New Roman',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_CENTER,
        leading=12
    ))

    # Pie de página
    styles.add(ParagraphStyle(
        name='Footer',
        fontName='Times New Roman',
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER,
        leading=10
    ))

    return styles

def format_date(date_str):
    """Formatear fecha ISO a formato legible"""
    if not date_str:
        return '-'
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime('%d/%m/%Y %H:%M')
    except:
        return date_str

def format_date_short(date_str):
    """Formatear fecha corta"""
    if not date_str:
        return '-'
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt.strftime('%d/%m/%Y')
    except:
        return date_str

def create_header_footer(canvas, doc):
    """Añadir encabezado y pie de página a cada página"""
    canvas.saveState()

    # Encabezado
    canvas.setFillColor(HOTEL_GREEN)
    canvas.rect(0, A4[1] - 40, A4[0], 40, fill=True)
    canvas.setFillColor(colors.white)
    canvas.setFont('Times New Roman', 16)
    canvas.drawString(20, A4[1] - 28, 'Hotel Rural Los Rubiales')
    canvas.setFont('Times New Roman', 10)
    canvas.drawRightString(A4[0] - 20, A4[1] - 28, 'Registro de Huéspedes')

    # Pie de página
    canvas.setFillColor(colors.grey)
    canvas.setFont('Times New Roman', 8)
    canvas.drawString(20, 20, f'Generado: {datetime.now().strftime("%d/%m/%Y %H:%M")}')
    canvas.drawRightString(A4[0] - 20, 20, f'Página {doc.page}')

    canvas.restoreState()

def generate_pdf(data, output_path, language='es'):
    """Generar el PDF con los datos proporcionados"""

    # Textos según idioma
    texts = {
        'es': {
            'title': 'Registro de Huéspedes',
            'subtitle': 'Hotel Rural Los Rubiales',
            'date': 'Fecha',
            'apartment': 'Apartamento',
            'guests': 'Huéspedes',
            'status': 'Estado',
            'active': 'Activo',
            'checked_out': 'Finalizado',
            'checkin': 'Entrada',
            'checkout': 'Salida',
            'name': 'Nombre',
            'document': 'Documento',
            'main_guest': 'Principal',
            'yes': 'Sí',
            'no': 'No',
            'notes': 'Notas',
            'signature': 'Firma',
            'total_registrations': 'Total de registros',
            'generated': 'Generado el',
        },
        'en': {
            'title': 'Guest Registration',
            'subtitle': 'Hotel Rural Los Rubiales',
            'date': 'Date',
            'apartment': 'Apartment',
            'guests': 'Guests',
            'status': 'Status',
            'active': 'Active',
            'checked_out': 'Checked Out',
            'checkin': 'Check-in',
            'checkout': 'Check-out',
            'name': 'Name',
            'document': 'Document',
            'main_guest': 'Main',
            'yes': 'Yes',
            'no': 'No',
            'notes': 'Notes',
            'signature': 'Signature',
            'total_registrations': 'Total registrations',
            'generated': 'Generated on',
        }
    }

    t = texts.get(language, texts['es'])

    # Crear documento
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=20*mm,
        leftMargin=20*mm,
        topMargin=50*mm,
        bottomMargin=25*mm,
        title='Los Rubiales - Registros',
        author='Z.ai',
        creator='Z.ai',
        subject='Registro de huéspedes del Hotel Rural Los Rubiales'
    )

    styles = create_styles()
    story = []

    # Título
    story.append(Paragraph(t['title'], styles['MainTitle']))
    story.append(Paragraph(t['subtitle'], styles['Subtitle']))
    story.append(Spacer(1, 10))

    # Resumen
    total = len(data)
    active_count = sum(1 for r in data if r.get('status') == 'active')

    summary_data = [
        [Paragraph(f"<b>{t['total_registrations']}</b>", styles['TableCell']),
         Paragraph(str(total), styles['TableCell']),
         Paragraph(f"<b>{t['active']}</b>", styles['TableCell']),
         Paragraph(str(active_count), styles['TableCell'])]
    ]

    summary_table = Table(summary_data, colWidths=[100, 60, 100, 60])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HOTEL_GREEN_LIGHT),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, HOTEL_GREEN),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 20))

    # Detalles de cada registro
    for idx, reg in enumerate(data, 1):
        # Mantener cada registro junto
        reg_elements = []

        # Encabezado del registro
        status_text = t['active'] if reg.get('status') == 'active' else t['checked_out']
        apartment_name = reg.get('apartment', {}).get('name', 'N/A')

        reg_elements.append(Paragraph(
            f"<b>{idx}. {apartment_name}</b> - {status_text}",
            styles['SectionTitle']
        ))

        # Información del registro
        checkin = format_date(reg.get('checkInDate', ''))
        checkout = format_date_short(reg.get('checkOutDate')) if reg.get('checkOutDate') else '-'

        reg_elements.append(Paragraph(
            f"<b>{t['checkin']}:</b> {checkin}  |  <b>{t['checkout']}:</b> {checkout}",
            styles['BodyText']
        ))

        # Tabla de huéspedes
        guests = reg.get('guests', [])
        if guests:
            header_style = styles['TableHeader']
            cell_style = styles['TableCell']

            guests_data = [
                [
                    Paragraph(f"<b>{t['name']}</b>", header_style),
                    Paragraph(f"<b>{t['document']}</b>", header_style),
                    Paragraph(f"<b>{t['main_guest']}</b>", header_style),
                ]
            ]

            for guest in guests:
                name = f"{guest.get('firstName', '')} {guest.get('lastName', '')}"
                doc_type = guest.get('documentType', '')
                doc_num = guest.get('documentNumber', '')
                is_main = t['yes'] if guest.get('isMainGuest') else t['no']

                guests_data.append([
                    Paragraph(name, cell_style),
                    Paragraph(f"{doc_type}: {doc_num}", cell_style),
                    Paragraph(is_main, cell_style),
                ])

            guests_table = Table(guests_data, colWidths=[180, 180, 80])
            guests_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('BACKGROUND', (0, 1), (-1, -1), TABLE_ROW_EVEN),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))

            reg_elements.append(Spacer(1, 6))
            reg_elements.append(guests_table)

        # Notas
        if reg.get('notes'):
            reg_elements.append(Paragraph(
                f"<b>{t['notes']}:</b> {reg.get('notes')}",
                styles['BodyText']
            ))

        reg_elements.append(Spacer(1, 15))

        # Añadir al story manteniendo junto
        story.append(KeepTogether(reg_elements))

    # Construir PDF
    doc.build(story, onFirstPage=create_header_footer, onLaterPages=create_header_footer)

    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python generate_registrations_pdf.py <output_path> <language> [json_data]")
        sys.exit(1)

    output_path = sys.argv[1]
    language = sys.argv[2]

    # Leer datos de stdin o argumento
    if len(sys.argv) > 3:
        json_data = sys.argv[3]
    else:
        json_data = sys.stdin.read()

    try:
        data = json.loads(json_data)
        generate_pdf(data, output_path, language)
        print(f"PDF generated successfully: {output_path}")
    except Exception as e:
        print(f"Error generating PDF: {e}", file=sys.stderr)
        sys.exit(1)

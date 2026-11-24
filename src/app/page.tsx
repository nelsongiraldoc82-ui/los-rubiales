'use client'

import { useState, useEffect, useRef } from 'react'
import { MAX_DOCUMENT_PHOTO_LENGTH, MAX_REGISTRATION_BYTES } from '@/lib/registration-limits'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast, Toaster } from 'sonner'
import { format } from 'date-fns'
import { es as esLocale, enUS } from 'date-fns/locale'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Camera,
  X,
  Eye,
  Calendar,
  Building2,
  Loader2,
  RotateCcw,
  Globe,
  ClipboardList,
  Download,
  Upload
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Traducciones simples
const t = {
  es: {
    loading: 'Cargando apartamentos…',
    retry: 'Reintentar',
    firstNameRequired: 'Nombre requerido',
    lastNameRequired: 'Apellidos requeridos',
    documentNumberRequired: 'Número requerido',
    adminKey: 'Clave de acceso',
    signIn: 'Acceder',
    signOut: 'Cerrar sesión',
    adminError: 'No se pudo acceder',
    download: 'Descargar registro',
    removeGuest: 'Quitar huésped',
    removePhoto: 'Quitar foto',
    previewPhoto: 'Ampliar foto del documento',
    preparingPhoto: 'Preparando foto…',
    photoError: 'No se pudo preparar la foto. Vuelve a tomarla o elige otra imagen.',
    registrationTooLarge: 'El registro supera el tamaño máximo. Quita alguna foto e inténtalo de nuevo.',
    language: 'Idioma',
    hotelName: 'Los Rubiales',
    hotelSubtitle: 'Hotel Rural',
    home: 'Inicio',
    admin: 'Admin',
    welcome: 'Bienvenido',
    selectApartment: 'Seleccione un apartamento para registrar huéspedes',
    noApartments: 'No hay apartamentos disponibles',
    apartment: 'Apartamento',
    backToApartments: 'Volver',
    addGuestData: 'Añada los datos de cada huésped',
    firstName: 'Nombre',
    firstNamePlaceholder: 'Juan',
    lastName: 'Apellidos',
    lastNamePlaceholder: 'García López',
    documentType: 'Tipo de documento',
    documentNumber: 'Número de documento',
    documentNumberPlaceholder: '12345678A',
    nationality: 'Nacionalidad',
    nationalityPlaceholder: 'Española',
    email: 'Email',
    emailPlaceholder: 'juan@email.com',
    phone: 'Teléfono',
    phonePlaceholder: '+34 612 345 678',
    dni: 'DNI',
    passport: 'Pasaporte',
    nie: 'NIE',
    documentPhoto: 'Foto del documento',
    takePhoto: 'Tomar foto',
    uploadPhoto: 'Cargar foto',
    changePhoto: 'Cambiar foto',
    mainGuest: 'Marcar como huésped principal',
    principal: 'Principal',
    addGuest: 'Añadir huésped',
    guests: 'Huéspedes',
    noGuests: 'No hay huéspedes añadidos',
    saveRegistration: 'Guardar registro',
    signature: 'Firma del huésped',
    signaturePlaceholder: 'Firme aquí',
    clear: 'Limpiar',
    stayDates: 'Fechas de estancia',
    checkInDate: 'Fecha de entrada',
    checkOutDate: 'Fecha de salida',
    selectDate: 'Seleccionar fecha',
    checkIn: 'Entrada',
    checkOut: 'Salida',
    status: 'Estado',
    active: 'Activo',
    checkedOut: 'Finalizado',
    checkout: 'Realizar checkout',
    registrationDetails: 'Detalles del Registro',
    adminPanel: 'Panel de Administración',
    noRegistrations: 'No hay registros todavía',
    errorLoadingApartments: 'Error al cargar los apartamentos',
    errorLoadingRegistrations: 'Error al cargar los registros',
    guestAdded: 'Huésped añadido',
    registrationSaved: 'Registro guardado correctamente',
    errorSaving: 'Error al guardar el registro',
    selectApartmentError: 'Selecciona un apartamento',
    addAtLeastOneGuest: 'Añade al menos un huésped',
    signatureRequired: 'La firma es requerida',
    checkoutDone: 'Checkout realizado correctamente',
    checkoutError: 'Error al realizar el checkout',
    registrationDeleted: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
    deleteConfirmTitle: '¿Eliminar registro?',
    deleteConfirmDescription: 'Esta acción no se puede deshacer.',
    cancel: 'Cancelar',
    delete: 'Eliminar',
  },
  en: {
    loading: 'Loading apartments…',
    retry: 'Try again',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    documentNumberRequired: 'Document number is required',
    adminKey: 'Access key',
    signIn: 'Sign in',
    signOut: 'Sign out',
    adminError: 'Could not sign in',
    download: 'Download registration',
    removeGuest: 'Remove guest',
    removePhoto: 'Remove photo',
    previewPhoto: 'Enlarge document photo',
    preparingPhoto: 'Preparing photo…',
    photoError: 'Could not prepare the photo. Retake it or choose another image.',
    registrationTooLarge: 'This registration is too large. Remove a photo and try again.',
    language: 'Language',
    hotelName: 'Los Rubiales',
    hotelSubtitle: 'Rural Hotel',
    home: 'Home',
    admin: 'Admin',
    welcome: 'Welcome',
    selectApartment: 'Select an apartment to register guests',
    noApartments: 'No apartments available',
    apartment: 'Apartment',
    backToApartments: 'Back',
    addGuestData: 'Add guest details',
    firstName: 'First Name',
    firstNamePlaceholder: 'John',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Smith',
    documentType: 'Document Type',
    documentNumber: 'Document Number',
    documentNumberPlaceholder: '12345678A',
    nationality: 'Nationality',
    nationalityPlaceholder: 'Spanish',
    email: 'Email',
    emailPlaceholder: 'john@email.com',
    phone: 'Phone',
    phonePlaceholder: '+34 612 345 678',
    dni: 'ID Card',
    passport: 'Passport',
    nie: 'NIE',
    documentPhoto: 'Document Photo',
    takePhoto: 'Take photo',
    uploadPhoto: 'Upload photo',
    changePhoto: 'Change photo',
    mainGuest: 'Mark as main guest',
    principal: 'Main',
    addGuest: 'Add Guest',
    guests: 'Guests',
    noGuests: 'No guests added',
    saveRegistration: 'Save Registration',
    signature: 'Guest Signature',
    signaturePlaceholder: 'Sign here',
    clear: 'Clear',
    stayDates: 'Stay Dates',
    checkInDate: 'Check-in Date',
    checkOutDate: 'Check-out Date',
    selectDate: 'Select date',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    status: 'Status',
    active: 'Active',
    checkedOut: 'Finished',
    checkout: 'Check-out',
    registrationDetails: 'Registration Details',
    adminPanel: 'Admin Panel',
    noRegistrations: 'No registrations yet',
    errorLoadingApartments: 'Error loading apartments',
    errorLoadingRegistrations: 'Error loading registrations',
    guestAdded: 'Guest added',
    registrationSaved: 'Registration saved successfully',
    errorSaving: 'Error saving registration',
    selectApartmentError: 'Select an apartment',
    addAtLeastOneGuest: 'Add at least one guest',
    signatureRequired: 'Signature is required',
    checkoutDone: 'Check-out completed successfully',
    checkoutError: 'Error performing check-out',
    registrationDeleted: 'Registration deleted successfully',
    deleteError: 'Error deleting registration',
    deleteConfirmTitle: 'Delete registration?',
    deleteConfirmDescription: 'This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
  }
}

type Language = 'es' | 'en'
type View = 'selection' | 'registration' | 'signature' | 'admin'

interface Apartment {
  id: string
  name: string
  description?: string | null
  capacity?: number
}

interface Guest {
  firstName: string
  lastName: string
  documentType: string
  documentNumber: string
  documentPhoto?: string
  nationality?: string
  email?: string
  phone?: string
  isMainGuest: boolean
}

interface Registration {
  id: string
  apartmentId: string
  apartment: Apartment
  checkInDate: string
  checkOutDate?: string | null
  guests: Guest[]
  status: string
  notes?: string | null
  signature?: string | null
}

const guestSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellidos requeridos'),
  documentType: z.string().default('DNI'),
  documentNumber: z.string().min(1, 'Número requerido'),
  nationality: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  isMainGuest: z.boolean().default(false)
})

type GuestFormData = z.infer<typeof guestSchema>

export default function Page() {
  const [language, setLanguage] = useState<Language>('es')
  const tr = t[language]
  const dateLocale = language === 'es' ? esLocale : enUS

  const [view, setView] = useState<View>('selection')
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [apartmentsLoading, setApartmentsLoading] = useState(true)
  const [apartmentsFailed, setApartmentsFailed] = useState(false)
  const [adminStatus, setAdminStatus] = useState<'loading' | 'locked' | 'ready' | 'error'>('loading')
  const [adminError, setAdminError] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState<Date>(new Date())
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined)

  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [regToDelete, setRegToDelete] = useState<string | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const photoRequest = useRef(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false }
  })

  useEffect(() => { document.documentElement.lang = language }, [language])
  useEffect(() => { fetchApartments() }, [])
  useEffect(() => { if (view === 'admin') fetchRegistrations() }, [view])
  useEffect(() => { if (view === 'signature') setTimeout(initCanvas, 100) }, [view])

  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = canvas.offsetWidth || 300
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(20, canvas.height - 30)
      ctx.lineTo(canvas.width - 20, canvas.height - 30)
      ctx.stroke()
      ctx.strokeStyle = '#1e40af'
      ctx.lineWidth = 3.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }
    setHasSignature(false)
    setSignature(null)
  }

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const touch = 'touches' in e ? e.touches[0] : e
    return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const coords = getCoords(e)
    if (!coords) return
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) { ctx.beginPath(); ctx.moveTo(coords.x, coords.y) }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    e.preventDefault()
    const coords = getCoords(e)
    if (!coords) return
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) {
      ctx.lineTo(coords.x, coords.y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(coords.x, coords.y)
    }
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (isDrawing && hasSignature) {
      setSignature(canvasRef.current?.toDataURL('image/png') || null)
    }
    setIsDrawing(false)
  }

  const clearSignature = () => initCanvas()

  const fetchApartments = async () => {
    setApartmentsLoading(true)
    setApartmentsFailed(false)
    try {
      const response = await fetch('/api/apartments')
      if (!response.ok) throw new Error()
      setApartments(await response.json())
    } catch {
      setApartmentsFailed(true)
    } finally {
      setApartmentsLoading(false)
    }
  }

  const fetchRegistrations = async () => {
    setAdminStatus('loading')
    try {
      const response = await fetch('/api/registrations', { cache: 'no-store' })
      if (response.status === 401) {
        setRegistrations([])
        setAdminStatus('locked')
        return
      }
      if (!response.ok) throw new Error()
      setRegistrations(await response.json())
      setAdminStatus('ready')
    } catch {
      setRegistrations([])
      setAdminStatus('error')
    }
  }

  const signInAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setAdminError(false)
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: new FormData(form).get('adminKey') })
      })
      if (!response.ok) throw new Error()
      await fetchRegistrations()
    } catch {
      setAdminError(true)
    } finally {
      form.reset()
      setIsLoading(false)
    }
  }

  const signOutAdmin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/session', { method: 'DELETE' })
      if (!response.ok) throw new Error()
      setRegistrations([])
      setSelectedReg(null)
      setSelectedPhoto(null)
      setAdminError(false)
      setAdminStatus('locked')
    } catch {
      toast.error(tr.errorLoadingRegistrations)
    } finally {
      setIsLoading(false)
    }
  }

  const selectApartment = (apt: Apartment) => {
    setSelectedApartment(apt)
    photoRequest.current += 1
    setPhotoLoading(false)
    setGuests([])
    setPhotoPreview(null)
    setSignature(null)
    setCheckInDate(new Date())
    setCheckOutDate(undefined)
    reset({ firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false })
    setView('registration')
  }

  const handleAddGuest = (data: GuestFormData) => {
    const newGuest: Guest = { ...data, documentPhoto: photoPreview || undefined }
    if (guests.length === 0) newGuest.isMainGuest = true
    if (newGuest.isMainGuest) setGuests(guests.map(g => ({ ...g, isMainGuest: false })))
    setGuests([...guests, newGuest])
    setPhotoPreview(null)
    reset({ firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false })
    toast.success(tr.guestAdded)
  }

  const removeGuest = (i: number) => {
    const newGuests = guests.filter((_, idx) => idx !== i)
    if (guests[i].isMainGuest && newGuests.length > 0) newGuests[0].isMainGuest = true
    setGuests(newGuests)
  }

  const goToSignature = () => {
    if (!selectedApartment) { toast.error(tr.selectApartmentError); return }
    if (guests.length === 0) { toast.error(tr.addAtLeastOneGuest); return }
    setView('signature')
  }

  const handleSaveRegistration = async () => {
    if (!signature) { toast.error(tr.signatureRequired); return }
    setIsLoading(true)
    try {
      const body = JSON.stringify({
        apartmentId: selectedApartment?.id,
        guests: guests.map(g => ({ ...g, documentPhoto: g.documentPhoto || null })),
        signature,
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate?.toISOString() || null
      })
      if (new Blob([body]).size > MAX_REGISTRATION_BYTES) {
        toast.error(tr.registrationTooLarge)
        return
      }
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })
      if (res.status === 413) {
        toast.error(tr.registrationTooLarge)
        return
      }
      if (!res.ok) throw new Error()
      toast.success(tr.registrationSaved)
      setView('selection')
      setGuests([])
      setSelectedApartment(null)
      setSignature(null)
    } catch { toast.error(tr.errorSaving) }
    finally { setIsLoading(false) }
  }

  const handleCheckout = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked_out' })
      })
      if (!response.ok) throw new Error()
      toast.success(tr.checkoutDone)
      setShowDetailsModal(false)
      fetchRegistrations()
    } catch { toast.error(tr.checkoutError) }
    finally { setIsLoading(false) }
  }

  const handleDelete = async () => {
    if (!regToDelete) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/registrations/${regToDelete}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()
      toast.success(tr.registrationDeleted)
      setShowDeleteDialog(false)
      setRegToDelete(null)
      fetchRegistrations()
    } catch { toast.error(tr.deleteError) }
    finally { setIsLoading(false) }
  }

  const compressImage = async (file: File) => {
    const url = URL.createObjectURL(file)
    try {
      const image = new window.Image()
      image.src = url
      await image.decode()

      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas unavailable')

      for (const maxSide of [1800, 1600, 1400, 1200, 1000]) {
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        context.fillStyle = '#fff'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.imageSmoothingQuality = 'high'
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        for (const quality of [0.92, 0.86, 0.8]) {
          const photo = canvas.toDataURL('image/jpeg', quality)
          if (photo.startsWith('data:image/jpeg;base64,') && photo.length <= MAX_DOCUMENT_PHOTO_LENGTH) return photo
        }
      }
      throw new Error('Photo exceeds size limit')
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    input.value = ''
    const request = ++photoRequest.current
    setPhotoLoading(true)
    try {
      const photo = await compressImage(file)
      if (request === photoRequest.current) setPhotoPreview(photo)
    } catch {
      if (request === photoRequest.current) toast.error(tr.photoError)
    } finally {
      if (request === photoRequest.current) setPhotoLoading(false)
    }
  }

  const openPhotoModal = (photo: string) => {
    setSelectedPhoto(photo)
    setShowPhotoModal(true)
  }

  const exportAsImage = async (reg: Registration) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calcular altura dinámica basada en número de huéspedes y si tienen fotos
    const guestsWithPhotos = reg.guests.filter(g => g.documentPhoto)
    const extraHeightForPhotos = guestsWithPhotos.length * 260
    const baseHeight = 450
    const totalHeight = baseHeight + (reg.guests.length * 30) + extraHeightForPhotos + 100

    canvas.width = 800
    canvas.height = totalHeight

    // Fondo blanco
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 800, totalHeight)
    
    // Cabecera verde
    ctx.fillStyle = '#166534'
    ctx.fillRect(0, 0, 800, 60)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(tr.hotelName, 20, 40)

    // Título
    ctx.fillStyle = '#166534'
    ctx.font = 'bold 18px Arial'
    ctx.fillText(tr.registrationDetails, 20, 100)

    // Información del registro
    ctx.fillStyle = '#374151'
    ctx.font = '14px Arial'
    ctx.fillText(`${tr.apartment}: ${reg.apartment.name}`, 20, 140)
    ctx.fillText(`${tr.checkIn}: ${format(new Date(reg.checkInDate), 'PPP', { locale: dateLocale })}`, 20, 170)
    ctx.fillText(`${tr.status}: ${reg.status === 'active' ? tr.active : tr.checkedOut}`, 20, 200)

    // Sección de huéspedes
    ctx.fillStyle = '#166534'
    ctx.font = 'bold 16px Arial'
    ctx.fillText(`${tr.guests}:`, 20, 240)

    let y = 270
    
    for (let i = 0; i < reg.guests.length; i++) {
      const g = reg.guests[i]
      
      // Nombre del huésped
      ctx.fillStyle = '#374151'
      ctx.font = 'bold 14px Arial'
      const guestLabel = g.isMainGuest ? `${g.firstName} ${g.lastName} ★ (${g.documentType}: ${g.documentNumber})` : `${g.firstName} ${g.lastName} (${g.documentType}: ${g.documentNumber})`
      ctx.fillText(guestLabel, 40, y)
      
      // Nacionalidad, email, teléfono si existen
      ctx.font = '12px Arial'
      ctx.fillStyle = '#6b7280'
      let infoY = y + 18
      if (g.nationality) {
        ctx.fillText(`${tr.nationality}: ${g.nationality}`, 50, infoY)
        infoY += 16
      }
      if (g.email || g.phone) {
        ctx.fillText(`${g.email || ''} ${g.phone || ''}`.trim(), 50, infoY)
        infoY += 16
      }
      
      // Foto del documento si existe
      if (g.documentPhoto) {
        try {
          const photoImg = new window.Image()
          photoImg.src = g.documentPhoto
          await photoImg.decode()

          const scale = Math.min(320 / photoImg.naturalWidth, 210 / photoImg.naturalHeight, 1)
          const width = Math.round(photoImg.naturalWidth * scale)
          const height = Math.round(photoImg.naturalHeight * scale)
          ctx.drawImage(photoImg, 450, y - 20, width, height)
          ctx.fillStyle = '#6b7280'
          ctx.font = '12px Arial'
          ctx.fillText(tr.documentPhoto, 450, y + height)
        } catch (e) {
          console.error('Error loading photo:', e)
        }
        y += 225
      }
      
      y += 45
    }

    // Sección de firma
    y += 20
    ctx.fillStyle = '#166534'
    ctx.font = 'bold 14px Arial'
    ctx.fillText(tr.signature + ':', 20, y)
    
    if (reg.signature) {
      const img = new window.Image()
      img.src = reg.signature
      await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r() })
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 20, y + 10, 250, 80)
      }
      y += 100
    } else {
      y += 20
    }

    // Pie de página
    ctx.fillStyle = '#9ca3af'
    ctx.font = '10px Arial'
    ctx.fillText(`Generado: ${format(new Date(), 'PPP HH:mm', { locale: dateLocale })}`, 20, totalHeight - 20)

    // Descargar
    const link = document.createElement('a')
    link.download = `registro-${reg.apartment.name}-${format(new Date(reg.checkInDate), 'yyyy-MM-dd')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const documentType = watch('documentType')
  const isMainGuest = watch('isMainGuest')

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      <Toaster position="top-center" richColors />

      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{tr.hotelName}</h1>
              <p className="text-xs sm:text-sm text-green-100 hidden sm:block">{tr.hotelSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger aria-label={tr.language} className="w-[70px] sm:w-28 bg-white/10 border-white/30 text-white text-sm">
                <Globe className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent className="bg-green-800 border-green-600">
                <SelectItem value="es" className="text-white hover:bg-green-700 focus:bg-green-700">Español</SelectItem>
                <SelectItem value="en" className="text-white hover:bg-green-700 focus:bg-green-700">English</SelectItem>
              </SelectContent>
            </Select>
            {view !== 'selection' && (
              <Button variant="ghost" onClick={() => setView('selection')} className="text-white hover:bg-white/10 px-2 sm:px-4">
                {tr.home}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setView('admin')} className="text-white hover:bg-white/10 px-2 sm:px-4">
              <ClipboardList className="h-4 w-4 sm:mr-2" />
              {tr.admin}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        {view === 'selection' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-green-800 mb-2">{tr.welcome}</h2>
              {!apartmentsLoading && !apartmentsFailed && apartments.length > 0 && <p className="text-muted-foreground">{tr.selectApartment}</p>}
            </div>
            {apartmentsLoading ? (
              <p role="status" className="text-center text-muted-foreground py-12">{tr.loading}</p>
            ) : apartmentsFailed || apartments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{apartmentsFailed ? tr.errorLoadingApartments : tr.noApartments}</p>
                <Button onClick={fetchApartments} className="mt-4">{tr.retry}</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {apartments.map((apt) => (
                  <button key={apt.id} type="button" className="flex flex-col items-center gap-4 rounded-xl border-2 border-transparent bg-white/80 px-4 py-10 shadow-sm transition-shadow hover:border-green-500 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-700" onClick={() => selectApartment(apt)}>
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-green-800 shadow-lg sm:h-20 sm:w-20">
                      <Building2 aria-hidden="true" className="h-8 w-8 text-white sm:h-10 sm:w-10" />
                    </span>
                    <span className="text-lg font-semibold text-green-800 sm:text-xl">{apt.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'registration' && (
          <div>
            <Button variant="ghost" onClick={() => setView('selection')} className="mb-6 text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />{tr.backToApartments}
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Building2 className="h-5 w-5" />{selectedApartment?.name}
                    </CardTitle>
                    <CardDescription>{tr.addGuestData}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(handleAddGuest)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{tr.firstName} *</Label>
                          <Input id="firstName" aria-required="true" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'firstName-error' : undefined} {...register('firstName')} placeholder={tr.firstNamePlaceholder} className="border-green-200" />
                          {errors.firstName && <p id="firstName-error" className="text-sm text-red-500">{tr.firstNameRequired}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{tr.lastName} *</Label>
                          <Input id="lastName" aria-required="true" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'lastName-error' : undefined} {...register('lastName')} placeholder={tr.lastNamePlaceholder} className="border-green-200" />
                          {errors.lastName && <p id="lastName-error" className="text-sm text-red-500">{tr.lastNameRequired}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentType">{tr.documentType}</Label>
                          <Select value={documentType} onValueChange={(v) => setValue('documentType', v)}>
                            <SelectTrigger id="documentType" className="border-green-200"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DNI">{tr.dni}</SelectItem>
                              <SelectItem value="Pasaporte">{tr.passport}</SelectItem>
                              <SelectItem value="NIE">{tr.nie}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="documentNumber">{tr.documentNumber} *</Label>
                          <Input id="documentNumber" aria-required="true" aria-invalid={!!errors.documentNumber} aria-describedby={errors.documentNumber ? 'documentNumber-error' : undefined} {...register('documentNumber')} placeholder={tr.documentNumberPlaceholder} className="border-green-200" />
                          {errors.documentNumber && <p id="documentNumber-error" className="text-sm text-red-500">{tr.documentNumberRequired}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nationality">{tr.nationality}</Label>
                          <Input id="nationality" {...register('nationality')} placeholder={tr.nationalityPlaceholder} className="border-green-200" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{tr.email}</Label>
                          <Input id="email" type="email" {...register('email')} placeholder={tr.emailPlaceholder} className="border-green-200" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{tr.phone}</Label>
                          <Input id="phone" {...register('phone')} placeholder={tr.phonePlaceholder} className="border-green-200" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{tr.documentPhoto}</Label>
                        {photoLoading && <p role="status" className="text-sm">{tr.preparingPhoto}</p>}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Input para cámara */}
                          <input 
                            ref={photoInputRef} 
                            type="file" 
                            accept="image/*" 
                            capture="environment" 
                            onChange={handlePhotoChange} 
                            className="hidden" 
                          />
                          {/* Input para cargar archivo */}
                          <input 
                            ref={fileInputRef} 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePhotoChange} 
                            className="hidden" 
                          />
                          
                          {!photoPreview ? (
                            <>
                              <Button type="button" variant="outline" disabled={photoLoading} onClick={() => photoInputRef.current?.click()}>
                                <Camera className="h-4 w-4 mr-2" />{tr.takePhoto}
                              </Button>
                              <Button type="button" variant="outline" disabled={photoLoading} onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-4 w-4 mr-2" />{tr.uploadPhoto}
                              </Button>
                            </>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <button type="button" aria-label={tr.previewPhoto} onClick={() => openPhotoModal(photoPreview)}>
                                  <img src={photoPreview} alt="" className="h-20 w-28 object-contain rounded-lg border-2 border-green-300" />
                                </button>
                                <button 
                                  type="button" 
                                  disabled={photoLoading} aria-label={tr.removePhoto} onClick={() => setPhotoPreview(null)} 
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button type="button" variant="outline" size="sm" disabled={photoLoading} onClick={() => photoInputRef.current?.click()}>
                                  <Camera className="h-3 w-3 mr-1" />{tr.takePhoto}
                                </Button>
                                <Button type="button" variant="outline" size="sm" disabled={photoLoading} onClick={() => fileInputRef.current?.click()}>
                                  <Upload className="h-3 w-3 mr-1" />{tr.uploadPhoto}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="isMainGuest" checked={isMainGuest} onCheckedChange={(c) => setValue('isMainGuest', c === true)} />
                        <Label htmlFor="isMainGuest" className="cursor-pointer">{tr.mainGuest}</Label>
                      </div>
                      <Button type="submit" disabled={photoLoading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />{tr.addGuest}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-1">
                <Card className="bg-white/80 backdrop-blur sticky top-4">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center justify-between">
                      <span>{tr.guests}</span>
                      <Badge variant="secondary">{guests.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {guests.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">{tr.noGuests}</p>
                    ) : (
                      <ScrollArea className="max-h-96">
                        <div className="space-y-3">
                          {guests.map((g, i) => (
                            <div key={i} className="flex items-start justify-between p-3 bg-green-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-green-800">{g.firstName} {g.lastName}</span>
                                  {g.isMainGuest && <Badge className="bg-amber-500 text-white text-xs">{tr.principal}</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground">{g.documentType}: {g.documentNumber}</p>
                              </div>
                              <Button variant="ghost" size="sm" aria-label={tr.removeGuest} onClick={() => removeGuest(i)} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                    <Separator className="my-4" />
                    <Button onClick={goToSignature} disabled={guests.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      {tr.saveRegistration}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'signature' && (
          <div>
            <Button variant="ghost" onClick={() => setView('registration')} className="mb-6 text-green-700">
              <ArrowLeft className="h-4 w-4 mr-2" />{tr.backToApartments}
            </Button>
            <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-green-800">{tr.signature}</CardTitle>
                <CardDescription>{selectedApartment?.name} - {guests.length} {tr.guests.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />{tr.stayDates}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-amber-700">{tr.checkInDate} *</Label>
                      <Input type="date" value={format(checkInDate, 'yyyy-MM-dd')} onChange={(e) => setCheckInDate(new Date(e.target.value))} className="mt-2 border-amber-300" />
                    </div>
                    <div>
                      <Label className="text-amber-700">{tr.checkOutDate}</Label>
                      <Input type="date" value={checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : ''} onChange={(e) => e.target.value && setCheckOutDate(new Date(e.target.value))} className="mt-2 border-amber-300" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-green-800">{tr.signature}</Label>
                  <div className="border-2 border-green-300 rounded-lg overflow-hidden bg-white relative">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-40 cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                    {!hasSignature && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-gray-300 italic">{tr.signaturePlaceholder}</span></div>}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={clearSignature}><RotateCcw className="h-4 w-4 mr-2" />{tr.clear}</Button>
                </div>
                <Button onClick={handleSaveRegistration} disabled={isLoading || !hasSignature} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {tr.saveRegistration}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {view === 'admin' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Button variant="ghost" onClick={() => setView('selection')} className="text-green-700">
                <ArrowLeft className="h-4 w-4 mr-2" />{tr.backToApartments}
              </Button>
              <h2 className="text-2xl font-bold text-green-800">{tr.adminPanel}</h2>
              {adminStatus === 'ready' && <Button variant="outline" disabled={isLoading} onClick={signOutAdmin}>{tr.signOut}</Button>}
            </div>
            {adminStatus === 'locked' ? (
              <form onSubmit={signInAdmin} className="mx-auto max-w-sm space-y-4 rounded-xl bg-white p-6">
                <Label htmlFor="adminKey">{tr.adminKey}</Label>
                <Input id="adminKey" name="adminKey" type="password" autoComplete="current-password" required maxLength={64} />
                {adminError && <p role="alert" className="text-sm text-red-700">{tr.adminError}</p>}
                <Button type="submit" disabled={isLoading}>{tr.signIn}</Button>
              </form>
            ) : adminStatus === 'error' ? (
              <div className="text-center py-12">
                <p role="alert">{tr.errorLoadingRegistrations}</p>
                <Button onClick={fetchRegistrations} className="mt-4">{tr.retry}</Button>
              </div>
            ) : adminStatus === 'loading' ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
            ) : registrations.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur">
                <CardContent className="p-12 text-center">
                  <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{tr.noRegistrations}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {registrations.map((reg) => {
                  // Safe date formatting
                  let dateStr = ''
                  try {
                    if (reg.checkInDate) {
                      dateStr = format(new Date(reg.checkInDate), 'PPP', { locale: dateLocale })
                    }
                  } catch (e) {
                    dateStr = reg.checkInDate || ''
                  }
                  
                  return (
                    <Card key={reg.id} className="bg-white/80 backdrop-blur">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <Badge className={reg.status === 'active' ? 'bg-green-600' : ''}>{reg.status === 'active' ? tr.active : tr.checkedOut}</Badge>
                            <p className="text-sm mt-2">{tr.checkIn}: {dateStr}</p>
                            <p className="text-sm text-muted-foreground">{reg.apartment?.name || 'N/A'} - {reg.guests?.length || 0} {tr.guests.toLowerCase()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" aria-label={tr.registrationDetails} onClick={() => { setSelectedReg(reg); setShowDetailsModal(true) }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" aria-label={tr.download} onClick={() => exportAsImage(reg)} className="border-green-500 text-green-700">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" aria-label={tr.delete} onClick={() => { setRegToDelete(reg.id); setShowDeleteDialog(true) }} className="border-red-500 text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tr.registrationDetails}</DialogTitle>
          </DialogHeader>
          {selectedReg && (
            <div className="space-y-4">
              <Badge className={selectedReg.status === 'active' ? 'bg-green-600' : ''}>{selectedReg.status === 'active' ? tr.active : tr.checkedOut}</Badge>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{tr.apartment}</Label>
                  <p className="font-medium">{selectedReg.apartment?.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{tr.checkIn}</Label>
                  <p className="font-medium">
                    {(() => {
                      try {
                        return selectedReg.checkInDate ? format(new Date(selectedReg.checkInDate), 'PPP', { locale: dateLocale }) : 'N/A'
                      } catch {
                        return selectedReg.checkInDate || 'N/A'
                      }
                    })()}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-lg font-semibold">{tr.guests}</Label>
                <div className="space-y-4 mt-2">
                  {(selectedReg.guests || []).map((g, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-green-800">{g.firstName || ''} {g.lastName || ''}</span>
                            {g.isMainGuest && <Badge className="bg-amber-500 text-white text-xs">{tr.principal}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{g.documentType || 'DNI'}: {g.documentNumber || ''}</p>
                          {g.nationality && <p className="text-sm text-muted-foreground">{tr.nationality}: {g.nationality}</p>}
                          {g.email && <p className="text-sm text-muted-foreground">{tr.email}: {g.email}</p>}
                          {g.phone && <p className="text-sm text-muted-foreground">{tr.phone}: {g.phone}</p>}
                        </div>
                        {g.documentPhoto && g.documentPhoto.length > 10 && (
                          <div className="flex-shrink-0">
                            <p className="text-xs text-muted-foreground mb-1">{tr.documentPhoto}:</p>
                            <img 
                              src={g.documentPhoto} 
                              alt="Documento" 
                              className="h-24 w-32 object-cover rounded-lg border-2 border-green-300 shadow-sm cursor-pointer hover:scale-105 transition-transform" 
                              onClick={() => openPhotoModal(g.documentPhoto)} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {selectedReg.signature && (
                <div>
                  <Label className="text-lg font-semibold">{tr.signature}</Label>
                  <div className="mt-2 border rounded-lg p-2 bg-white">
                    <img src={selectedReg.signature} alt="Firma" className="max-h-32 mx-auto" />
                  </div>
                </div>
              )}
              {selectedReg.status === 'active' && (
                <Button onClick={() => handleCheckout(selectedReg.id)} disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  {tr.checkout}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tr.documentPhoto}</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex justify-center">
              <img src={selectedPhoto} alt="Documento" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tr.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{tr.deleteConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tr.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">{tr.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

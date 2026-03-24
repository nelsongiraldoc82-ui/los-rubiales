'use client'

import { useState, useEffect, useRef } from 'react'
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
  Download
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

const t = {
  es: {
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
    takePhoto: 'Capturar foto',
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
  const [isDataLoading, setIsDataLoading] = useState(true)
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false }
  })

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
    setIsDataLoading(true)
    try {
      const res = await fetch('/api/apartments')
      if (res.ok) {
        const data = await res.json()
        setApartments(Array.isArray(data) ? data : [])
      }
    } catch { toast.error(tr.errorLoadingApartments) }
    finally { setIsDataLoading(false) }
  }

  const fetchRegistrations = async () => {
    setIsDataLoading(true)
    try {
      const res = await fetch('/api/registrations')
      if (res.ok) {
        const data = await res.json()
        setRegistrations(Array.isArray(data) ? data : [])
      }
    } catch { toast.error(tr.errorLoadingRegistrations) }
    finally { setIsDataLoading(false) }
  }

  const selectApartment = (apt: Apartment) => {
    setSelectedApartment(apt)
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
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartmentId: selectedApartment?.id,
          guests: guests.map(g => ({ ...g, documentPhoto: g.documentPhoto || null })),
          signature,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate?.toISOString() || null
        })
      })
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
      await fetch(`/api/registrations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked_out' })
      })
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
      await fetch(`/api/registrations/${regToDelete}`, { method: 'DELETE' })
      toast.success(tr.registrationDeleted)
      setShowDeleteDialog(false)
      setRegToDelete(null)
      fetchRegistrations()
    } catch { toast.error(tr.deleteError) }
    finally { setIsLoading(false) }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
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

    canvas.width = 800
    canvas.height = 400

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 800, 400)
    ctx.fillStyle = '#166534'
    ctx.fillRect(0, 0, 800, 60)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 24px Arial'
    ctx.fillText(tr.hotelName, 20, 40)

    ctx.fillStyle = '#166534'
    ctx.font = 'bold 18px Arial'
    ctx.fillText(tr.registrationDetails, 20, 100)

    ctx.fillStyle = '#374151'
    ctx.font = '14px Arial'
    ctx.fillText(`${tr.apartment}: ${reg.apartment.name}`, 20, 140)
    ctx.fillText(`${tr.checkIn}: ${format(new Date(reg.checkInDate), 'PPP', { locale: dateLocale })}`, 20, 170)
    ctx.fillText(`${tr.status}: ${reg.status === 'active' ? tr.active : tr.checkedOut}`, 20, 200)
    ctx.fillText(`${tr.guests}:`, 20, 240)

    let y = 270
    for (const g of reg.guests) {
      ctx.fillText(`${g.firstName} ${g.lastName} (${g.documentType}: ${g.documentNumber})`, 40, y)
      y += 25
    }

    if (reg.signature) {
      const img = new window.Image()
      img.src = reg.signature
      await new Promise<void>((r) => { img.onload = () => r(); img.onerror = () => r() })
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 20, y + 10, 200, 60)
      }
    }

    const link = document.createElement('a')
    link.download = `registro-${format(new Date(reg.checkInDate), 'yyyy-MM-dd')}.png`
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
              <SelectTrigger className="w-[70px] sm:w-28 bg-white/10 border-white/30 text-white text-sm">
                <Globe className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline"><SelectValue /></span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">English</SelectItem>
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
              <p className="text-muted-foreground">{tr.selectApartment}</p>
            </div>
            {isDataLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
            ) : apartments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{tr.noApartments}</p>
                <Button onClick={fetchApartments} className="mt-4">Reintentar</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {apartments.map((apt) => (
                  <Card key={apt.id} className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500 bg-white/80 backdrop-blur" onClick={() => selectApartment(apt)}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col items-center gap-3 sm:gap-4">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                          <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        </div>
                        <CardTitle className="text-lg sm:text-xl text-green-800 text-center">{apt.name}</CardTitle>
                      </div>
                    </CardContent>
                  </Card>
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
                          <Label>{tr.firstName} *</Label>
                          <Input {...register('firstName')} placeholder={tr.firstNamePlaceholder} className="border-green-200" />
                          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>{tr.lastName} *</Label>
                          <Input {...register('lastName')} placeholder={tr.lastNamePlaceholder} className="border-green-200" />
                          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{tr.documentType}</Label>
                          <Select value={documentType} onValueChange={(v) => setValue('documentType', v)}>
                            <SelectTrigger className="border-green-200"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="DNI">{tr.dni}</SelectItem>
                              <SelectItem value="Pasaporte">{tr.passport}</SelectItem>
                              <SelectItem value="NIE">{tr.nie}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{tr.documentNumber} *</Label>
                          <Input {...register('documentNumber')} placeholder={tr.documentNumberPlaceholder} className="border-green-200" />
                          {errors.documentNumber && <p className="text-sm text-red-500">{errors.documentNumber.message}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{tr.nationality}</Label>
                          <Input {...register('nationality')} placeholder={tr.nationalityPlaceholder} className="border-green-200" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{tr.email}</Label>
                          <Input type="email" {...register('email')} placeholder={tr.emailPlaceholder} className="border-green-200" />
                        </div>
                        <div className="space-y-2">
                          <Label>{tr.phone}</Label>
                          <Input {...register('phone')} placeholder={tr.phonePlaceholder} className="border-green-200" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{tr.documentPhoto}</Label>
                        <div className="flex items-center gap-4">
                          <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                          <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()}>
                            <Camera className="h-4 w-4 mr-2" />{photoPreview ? tr.changePhoto : tr.takePhoto}
                          </Button>
                          {photoPreview && (
                            <div className="relative">
                              <img src={photoPreview} alt="Preview" className="h-16 w-16 object-cover rounded-md border" />
                              <button type="button" onClick={() => setPhotoPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="isMainGuest" checked={isMainGuest} onCheckedChange={(c) => setValue('isMainGuest', c === true)} />
                        <Label htmlFor="isMainGuest" className="cursor-pointer">{tr.mainGuest}</Label>
                      </div>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
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
                              <Button variant="ghost" size="sm" onClick={() => removeGuest(i)} className="text-red-500">
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
            </div>
            {isDataLoading ? (
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
                {registrations.map((reg) => (
                  <Card key={reg.id} className="bg-white/80 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge className={reg.status === 'active' ? 'bg-green-600' : ''}>{reg.status === 'active' ? tr.active : tr.checkedOut}</Badge>
                          <p className="text-sm mt-2">{tr.checkIn}: {format(new Date(reg.checkInDate), 'PPP', { locale: dateLocale })}</p>
                          <p className="text-sm text-muted-foreground">{reg.apartment.name} - {reg.guests.length} {tr.guests.toLowerCase()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedReg(reg); setShowDetailsModal(true) }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => exportAsImage(reg)} className="border-green-500 text-green-700">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setRegToDelete(reg.id); setShowDeleteDialog(true) }} className="border-red-500 text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  <p className="font-medium">{selectedReg.apartment.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{tr.checkIn}</Label>
                  <p className="font-medium">{format(new Date(selectedReg.checkInDate), 'PPP', { locale: dateLocale })}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-lg font-semibold">{tr.guests}</Label>
                <div className="space-y-3 mt-2">
                  {selectedReg.guests.map((g, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-800">{g.firstName} {g.lastName}</span>
                            {g.isMainGuest && <Badge className="bg-amber-500 text-white text-xs">{tr.principal}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{g.documentType}: {g.documentNumber}</p>
                        </div>
                        {g.documentPhoto && (
                          <img src={g.documentPhoto} alt="Documento" className="h-16 w-16 object-cover rounded-md border cursor-pointer" onClick={() => openPhotoModal(g.documentPhoto!)} />
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

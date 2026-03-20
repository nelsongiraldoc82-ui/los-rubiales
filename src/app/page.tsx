'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast, Toaster } from 'sonner'
import { format } from 'date-fns'
import { es as esLocale, enUS } from 'date-fns/locale'
import {
  Home as HomeIcon,
  Users,
  ArrowLeft,
  Plus,
  Trash2,
  Camera,
  X,
  Eye,
  Edit2,
  Calendar,
  Building2,
  Loader2,
  RotateCcw,
  Globe,
  Download,
  FileText,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { translations, translateApartmentName, type Language } from '@/lib/translations'

// Types
interface Apartment {
  id: string
  name: string
  description: string | null
  capacity: number
  _count?: { registrations: number }
}

interface Guest {
  id?: string
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
}

interface Registration {
  id: string
  apartmentId: string
  apartment: Apartment
  checkInDate: string
  checkOutDate: string | null
  guests: Guest[]
  status: string
  notes: string | null
  signature?: string | null
  createdAt: string
  updatedAt: string
}

// Schema de validación
const createGuestSchema = (t: typeof translations.es) => z.object({
  firstName: z.string().min(1, t.firstNameRequired),
  lastName: z.string().min(1, t.lastNameRequired),
  documentType: z.string().default('DNI'),
  documentNumber: z.string().min(1, t.documentNumberRequired),
  documentPhoto: z.string().optional(),
  nationality: z.string().optional(),
  dateOfBirth: z.string().optional(),
  email: z.string().email(t.emailInvalid).optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  isMainGuest: z.boolean().default(false)
})

type GuestFormData = z.infer<ReturnType<typeof createGuestSchema>>

// Vista actual - Sin login
type View = 'selection' | 'registration' | 'signature' | 'admin'

// Componente de firma
function SignatureCanvas({
  onSignatureChange, label, instruction, clearLabel, placeholder
}: {
  onSignatureChange: (signature: string | null) => void
  label: string
  instruction: string
  clearLabel: string
  placeholder: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      const rect = container.getBoundingClientRect()
      const width = rect.width - 4
      const height = Math.max(150, Math.min(200, window.innerHeight * 0.25))

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = '#1a5f2a'
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.moveTo(20, canvas.height - 30)
        ctx.lineTo(canvas.width - 20, canvas.height - 30)
        ctx.stroke()
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const coords = getCoordinates(e)
    if (!coords) return
    setIsDrawing(true)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) { ctx.beginPath(); ctx.moveTo(coords.x, coords.y) }
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const coords = getCoordinates(e)
    if (!coords) return
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) { ctx.lineTo(coords.x, coords.y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(coords.x, coords.y) }
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (isDrawing && hasSignature) {
      const signatureData = canvasRef.current?.toDataURL('image/png')
      onSignatureChange(signatureData || null)
    }
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.beginPath()
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.moveTo(20, canvas.height - 30)
    ctx.lineTo(canvas.width - 20, canvas.height - 30)
    ctx.stroke()
    ctx.strokeStyle = '#1a5f2a'
    ctx.lineWidth = 2.5
    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-2">
      <Label className="text-base font-semibold text-green-800">{label}</Label>
      <p className="text-sm text-muted-foreground">{instruction}</p>
      <div ref={containerRef} className="relative border-2 border-green-300 rounded-lg overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-40 sm:h-48 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-lg sm:text-xl italic">{placeholder}</span>
          </div>
        )}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={clearSignature} className="border-green-500 text-green-700 hover:bg-green-50">
        <RotateCcw className="h-4 w-4 mr-2" />
        {clearLabel}
      </Button>
    </div>
  )
}

export default function Home() {
  // Estado de idioma
  const [language, setLanguage] = useState<Language>('es')
  const t = translations[language]
  const dateLocale = language === 'es' ? esLocale : enUS
  const guestSchema = createGuestSchema(t)

  // Estados principales - SIN AUTENTICACIÓN
  const [view, setView] = useState<View>('selection')
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<Apartment | null>(null)
  const [guests, setGuests] = useState<GuestFormData[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [signature, setSignature] = useState<string | null>(null)
  const [checkInDate, setCheckInDate] = useState<Date>(new Date())
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined)

  // Filtros de admin
  const [filterApartment, setFilterApartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Modales
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [registrationToDelete, setRegistrationToDelete] = useState<string | null>(null)
  const [editingNotes, setEditingNotes] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors }
  } = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: { firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false }
  })

  // Cargar apartamentos al iniciar
  useEffect(() => {
    fetchApartments()
  }, [])

  // Cargar registros en vista admin
  useEffect(() => {
    if (view === 'admin') fetchRegistrations()
  }, [view, filterApartment, filterStatus])

  const fetchApartments = async () => {
    try {
      const response = await fetch('/api/apartments')
      if (!response.ok) throw new Error()
      const data = await response.json()
      setApartments(data)
    } catch { toast.error(t.errorLoadingApartments) }
    finally { setIsDataLoading(false) }
  }

  const fetchRegistrations = async () => {
    setIsDataLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterApartment !== 'all') params.append('apartmentId', filterApartment)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      const response = await fetch(`/api/registrations?${params.toString()}`)
      if (!response.ok) throw new Error()
      const data = await response.json()
      setRegistrations(data)
    } catch { toast.error(t.errorLoadingRegistrations) }
    finally { setIsDataLoading(false) }
  }

  const selectApartment = (apartment: Apartment) => {
    setSelectedApartment(apartment)
    setGuests([])
    setPhotoPreview(null)
    setSignature(null)
    setCheckInDate(new Date())
    setCheckOutDate(undefined)
    reset({ firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false })
    setView('registration')
  }

  const handleAddGuest = (data: GuestFormData) => {
    const newGuest = { ...data, documentPhoto: photoPreview || undefined }
    if (guests.length === 0) newGuest.isMainGuest = true
    if (newGuest.isMainGuest) setGuests(guests.map(g => ({ ...g, isMainGuest: false })))
    setGuests([...guests, newGuest])
    setPhotoPreview(null)
    reset({ firstName: '', lastName: '', documentType: 'DNI', documentNumber: '', isMainGuest: false })
    toast.success(t.guestAdded)
  }

  const removeGuest = (index: number) => {
    const newGuests = guests.filter((_, i) => i !== index)
    if (guests[index].isMainGuest && newGuests.length > 0) newGuests[0].isMainGuest = true
    setGuests(newGuests)
  }

  const goToSignature = () => {
    if (!selectedApartment) { toast.error(t.selectApartmentError); return }
    if (guests.length === 0) { toast.error(t.addAtLeastOneGuest); return }
    setView('signature')
  }

  const handleSaveRegistration = async () => {
    if (!signature) { toast.error(t.signatureRequired); return }
    setIsLoading(true)
    try {
      const response = await fetch('/api/registrations', {
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
      if (!response.ok) throw new Error()
      toast.success(t.registrationSaved)
      setView('selection')
      setGuests([])
      setSelectedApartment(null)
      setSignature(null)
      setCheckInDate(new Date())
      setCheckOutDate(undefined)
    } catch { toast.error(t.errorSaving) }
    finally { setIsLoading(false) }
  }

  const handleCheckout = async (registrationId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'checked_out' })
      })
      if (!response.ok) throw new Error()
      toast.success(t.checkoutDone)
      setShowDetailsModal(false)
      fetchRegistrations()
    } catch { toast.error(t.checkoutError) }
    finally { setIsLoading(false) }
  }

  const handleDeleteRegistration = async () => {
    if (!registrationToDelete) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/registrations/${registrationToDelete}`, { method: 'DELETE' })
      if (!response.ok) throw new Error()
      toast.success(t.registrationDeleted)
      setShowDeleteDialog(false)
      setRegistrationToDelete(null)
      fetchRegistrations()
    } catch { toast.error(t.deleteError) }
    finally { setIsLoading(false) }
  }

  const handleUpdateNotes = async (registrationId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/registrations/${registrationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editingNotes })
      })
      if (!response.ok) throw new Error()
      toast.success(t.notesUpdated)
      setShowEditModal(false)
      fetchRegistrations()
    } catch { toast.error(t.notesError) }
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

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.append('lang', language)
      if (filterApartment !== 'all') params.append('apartmentId', filterApartment)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      const response = await fetch(`/api/export/pdf?${params.toString()}`)
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registros_los_rubiales_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF exportado')
    } catch { toast.error('Error al exportar PDF') }
    finally { setIsExporting(false) }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams()
      params.append('lang', language)
      if (filterApartment !== 'all') params.append('apartmentId', filterApartment)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      const response = await fetch(`/api/export/excel?${params.toString()}`)
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registros_los_rubiales_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Excel exportado')
    } catch { toast.error('Error al exportar Excel') }
    finally { setIsExporting(false) }
  }

  const documentType = watch('documentType')
  const isMainGuest = watch('isMainGuest')

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col">
      <Toaster position="top-center" richColors />

      {/* Header - SIN LOGIN */}
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight">{t.hotelName}</h1>
              <p className="text-xs sm:text-sm text-green-100 hidden sm:block">{t.hotelSubtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selector de idioma */}
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
                <HomeIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{t.home}</span>
              </Button>
            )}
            
            {/* Botón Admin */}
            <Button variant="ghost" onClick={() => setView('admin')} className="text-white hover:bg-white/10 px-2 sm:px-4">
              <ClipboardList className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.admin}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1">
        <AnimatePresence mode="wait">
          {/* Vista Selección de Apartamento */}
          {view === 'selection' && (
            <motion.div key="selection" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-800 mb-2">{t.welcome}</h2>
                <p className="text-muted-foreground">{t.selectApartment}</p>
              </div>
              {isDataLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {apartments.map((apartment, index) => (
                    <motion.div key={apartment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                      <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500 bg-white/80 backdrop-blur" onClick={() => selectApartment(apartment)}>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex flex-col items-center gap-3 sm:gap-4">
                            <div className="relative">
                              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg">
                                <Building2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                              </div>
                              {apartment._count && apartment._count.registrations > 0 && (
                                <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-amber-500 text-white text-xs px-1.5 sm:px-2">{apartment._count.registrations}</Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg sm:text-xl text-green-800 text-center">{translateApartmentName(apartment.name, language)}</CardTitle>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Vista Formulario de Registro */}
          {view === 'registration' && (
            <motion.div key="registration" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Button variant="ghost" onClick={() => setView('selection')} className="mb-6 text-green-700 hover:text-green-800 hover:bg-green-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToApartments}
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-white/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {selectedApartment?.name}
                      </CardTitle>
                      <CardDescription>{t.addGuestData}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit(handleAddGuest)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t.firstName} *</Label>
                            <Input id="firstName" {...register('firstName')} placeholder={t.firstNamePlaceholder} className="border-green-200 focus:border-green-500" />
                            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">{t.lastName} *</Label>
                            <Input id="lastName" {...register('lastName')} placeholder={t.lastNamePlaceholder} className="border-green-200 focus:border-green-500" />
                            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{t.documentType}</Label>
                            <Select value={documentType} onValueChange={(value) => setValue('documentType', value)}>
                              <SelectTrigger className="border-green-200"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="DNI">{t.dni}</SelectItem>
                                <SelectItem value="Pasaporte">{t.passport}</SelectItem>
                                <SelectItem value="NIE">{t.nie}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="documentNumber">{t.documentNumber} *</Label>
                            <Input id="documentNumber" {...register('documentNumber')} placeholder={t.documentNumberPlaceholder} className="border-green-200 focus:border-green-500" />
                            {errors.documentNumber && <p className="text-sm text-red-500">{errors.documentNumber.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nationality">{t.nationality}</Label>
                            <Input id="nationality" {...register('nationality')} placeholder={t.nationalityPlaceholder} className="border-green-200 focus:border-green-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">{t.email}</Label>
                            <Input id="email" type="email" {...register('email')} placeholder={t.emailPlaceholder} className="border-green-200 focus:border-green-500" />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">{t.phone}</Label>
                            <Input id="phone" {...register('phone')} placeholder={t.phonePlaceholder} className="border-green-200 focus:border-green-500" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t.documentPhoto}</Label>
                          <div className="flex items-center gap-4">
                            <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()} className="border-green-500 text-green-700 hover:bg-green-50">
                              <Camera className="h-4 w-4 mr-2" />
                              {photoPreview ? t.changePhoto : t.takePhoto}
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
                          <Checkbox id="isMainGuest" checked={isMainGuest} onCheckedChange={(checked) => setValue('isMainGuest', checked === true)} />
                          <Label htmlFor="isMainGuest" className="cursor-pointer">{t.mainGuest}</Label>
                        </div>

                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Plus className="h-4 w-4 mr-2" />
                          {t.addGuest}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1">
                  <Card className="bg-white/80 backdrop-blur sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center justify-between">
                        <span>{t.guests}</span>
                        <Badge variant="secondary">{guests.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {guests.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">{t.noGuests}</p>
                      ) : (
                        <ScrollArea className="max-h-96">
                          <div className="space-y-3">
                            {guests.map((guest, index) => (
                              <div key={index} className="flex items-start justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-green-800">{guest.firstName} {guest.lastName}</span>
                                    {guest.isMainGuest && <Badge className="bg-amber-500 text-white text-xs">{t.principal}</Badge>}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{guest.documentType}: {guest.documentNumber}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => removeGuest(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                      <Separator className="my-4" />
                      <Button onClick={goToSignature} disabled={guests.length === 0} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        {t.saveRegistration}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Vista Firma */}
          {view === 'signature' && (
            <motion.div key="signature" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <Button variant="ghost" onClick={() => setView('registration')} className="mb-6 text-green-700 hover:text-green-800 hover:bg-green-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.backToApartments}
              </Button>

              <Card className="max-w-2xl mx-auto bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-green-800">{t.signature}</CardTitle>
                  <CardDescription>{selectedApartment?.name} - {guests.length} {t.guests.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Fechas de estancia */}
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {t.stayDates}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-amber-700">{t.checkInDate} *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start border-amber-300 text-left font-normal">
                              <Calendar className="h-4 w-4 mr-2" />
                              {format(checkInDate, 'PPP', { locale: dateLocale })}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent mode="single" selected={checkInDate} onSelect={(date) => date && setCheckInDate(date)} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-amber-700">{t.checkOutDate}</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start border-amber-300 text-left font-normal">
                              <Calendar className="h-4 w-4 mr-2" />
                              {checkOutDate ? format(checkOutDate, 'PPP', { locale: dateLocale }) : <span className="text-muted-foreground">{t.selectDate}</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <CalendarComponent mode="single" selected={checkOutDate} onSelect={setCheckOutDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Firma */}
                  <SignatureCanvas
                    onSignatureChange={setSignature}
                    label={t.signature}
                    instruction={t.signatureInstruction}
                    clearLabel={t.clear}
                    placeholder={t.signaturePlaceholder}
                  />

                  <Button onClick={handleSaveRegistration} disabled={isLoading || !signature} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    {t.saveRegistration}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Vista Admin */}
          {view === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setView('selection')} className="text-green-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t.backToApartments}
                </Button>
                <h2 className="text-2xl font-bold text-green-800">{t.adminPanel}</h2>
              </div>

              {/* Filtros y exportación */}
              <Card className="bg-white/80 backdrop-blur mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 space-y-2">
                      <Label>{t.filterApartment}</Label>
                      <Select value={filterApartment} onValueChange={setFilterApartment}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.allApartments}</SelectItem>
                          {apartments.map(a => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>{t.filterStatus}</Label>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t.allStatus}</SelectItem>
                          <SelectItem value="active">{t.active}</SelectItem>
                          <SelectItem value="checked_out">{t.checkedOut}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleExportPDF} disabled={isExporting} className="border-green-500 text-green-700">
                        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                        PDF
                      </Button>
                      <Button variant="outline" onClick={handleExportExcel} disabled={isExporting} className="border-green-500 text-green-700">
                        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
                        Excel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de registros */}
              {isDataLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
              ) : registrations.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur">
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">{t.noRegistrations}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {registrations.map((reg) => (
                    <Card key={reg.id} className="bg-white/80 backdrop-blur">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={reg.status === 'active' ? 'default' : 'secondary'} className={reg.status === 'active' ? 'bg-green-600' : ''}>
                                {reg.status === 'active' ? t.active : t.checkedOut}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{reg.apartment.name}</span>
                            </div>
                            <div className="space-y-1">
                              {reg.guests.slice(0, 3).map((guest, i) => (
                                <p key={i} className="text-sm">
                                  {guest.firstName} {guest.lastName} ({guest.documentType}: {guest.documentNumber})
                                  {guest.isMainGuest && <Badge className="ml-2 bg-amber-500 text-white text-xs">{t.principal}</Badge>}
                                </p>
                              ))}
                              {reg.guests.length > 3 && <p className="text-sm text-muted-foreground">+{reg.guests.length - 3} más</p>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              {t.checkIn}: {format(new Date(reg.checkInDate), 'PPP', { locale: dateLocale })}
                              {reg.checkOutDate && ` | ${t.checkOut}: ${format(new Date(reg.checkOutDate), 'PPP', { locale: dateLocale })}`}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setSelectedRegistration(reg); setShowDetailsModal(true) }} className="border-green-500 text-green-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setSelectedRegistration(reg); setEditingNotes(reg.notes || ''); setShowEditModal(true) }} className="border-blue-500 text-blue-700">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setRegistrationToDelete(reg.id); setShowDeleteDialog(true) }} className="border-red-500 text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal de detalles */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.registrationDetails}</DialogTitle>
            <DialogDescription>{selectedRegistration?.apartment.name}</DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">{t.checkInDate}</Label>
                  <p>{format(new Date(selectedRegistration.checkInDate), 'PPP', { locale: dateLocale })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t.checkOutDate}</Label>
                  <p>{selectedRegistration.checkOutDate ? format(new Date(selectedRegistration.checkOutDate), 'PPP', { locale: dateLocale }) : '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">{t.status}</Label>
                <p><Badge variant={selectedRegistration.status === 'active' ? 'default' : 'secondary'} className={selectedRegistration.status === 'active' ? 'bg-green-600' : ''}>{selectedRegistration.status === 'active' ? t.active : t.checkedOut}</Badge></p>
              </div>
              <div>
                <Label className="text-muted-foreground">{t.guests}</Label>
                <div className="space-y-2 mt-2">
                  {selectedRegistration.guests.map((guest, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{guest.firstName} {guest.lastName}</span>
                        {guest.isMainGuest && <Badge className="bg-amber-500 text-white text-xs">{t.principal}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{guest.documentType}: {guest.documentNumber}</p>
                      {guest.nationality && <p className="text-sm text-muted-foreground">{t.nationality}: {guest.nationality}</p>}
                      {guest.email && <p className="text-sm text-muted-foreground">{t.email}: {guest.email}</p>}
                      {guest.phone && <p className="text-sm text-muted-foreground">{t.phone}: {guest.phone}</p>}
                    </div>
                  ))}
                </div>
              </div>
              {selectedRegistration.signature && (
                <div>
                  <Label className="text-muted-foreground">{t.signature}</Label>
                  <img src={selectedRegistration.signature} alt="Firma" className="mt-2 border rounded-lg max-h-32" />
                </div>
              )}
              {selectedRegistration.notes && (
                <div>
                  <Label className="text-muted-foreground">{t.notes}</Label>
                  <p className="text-sm">{selectedRegistration.notes}</p>
                </div>
              )}
              {selectedRegistration.status === 'active' && (
                <Button onClick={() => handleCheckout(selectedRegistration.id)} disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {t.checkout}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de edición */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editNotes}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={editingNotes} onChange={(e) => setEditingNotes(e.target.value)} rows={4} placeholder={t.notesPlaceholder} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>{t.cancel}</Button>
            <Button onClick={() => selectedRegistration && handleUpdateNotes(selectedRegistration.id)} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteConfirmDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRegistration} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Icono Save que falta
function Save({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

// Sistema de traducciones para la aplicación
export type Language = 'es' | 'en'

export const translations = {
  es: {
    // Header
    hotelName: 'Los Rubiales',
    hotelSubtitle: 'Hotel Rural',
    home: 'Inicio',
    admin: 'Admin',
    
    // Apartamentos
    apartment: 'Apartamento',
    apartment1: 'Apartamento 1',
    apartment2: 'Apartamento 2',
    apartment3: 'Apartamento 3',
    
    // Selección de apartamento
    welcome: 'Bienvenido',
    selectApartment: 'Seleccione un apartamento para registrar huéspedes',
    capacity: 'Capacidad',
    people: 'personas',
    active: 'activos',
    
    // Formulario de registro
    backToApartments: 'Volver a apartamentos',
    addGuestData: 'Añada los datos de cada huésped',
    
    // Campos del formulario
    firstName: 'Nombre',
    firstNamePlaceholder: 'Juan',
    lastName: 'Apellidos',
    lastNamePlaceholder: 'García López',
    documentType: 'Tipo de documento',
    documentNumber: 'Número de documento',
    documentNumberPlaceholder: '12345678A',
    nationality: 'Nacionalidad',
    nationalityPlaceholder: 'Española',
    dateOfBirth: 'Fecha de nacimiento',
    email: 'Email',
    emailPlaceholder: 'juan@email.com',
    phone: 'Teléfono',
    phonePlaceholder: '+34 612 345 678',
    address: 'Dirección',
    addressPlaceholder: 'Calle Principal, 123',
    city: 'Ciudad',
    cityPlaceholder: 'Madrid',
    postalCode: 'Código postal',
    postalCodePlaceholder: '28001',
    
    // Documento
    dni: 'DNI',
    passport: 'Pasaporte',
    nie: 'NIE',
    documentPhoto: 'Foto del documento',
    documentPhotos: 'Fotos de documentos',
    takePhoto: 'Capturar foto',
    changePhoto: 'Cambiar foto',
    
    // Huésped principal
    mainGuest: 'Marcar como huésped principal',
    principal: 'Principal',
    
    // Acciones
    addGuest: 'Añadir huésped',
    guests: 'Huéspedes',
    noGuests: 'No hay huéspedes añadidos',
    saveRegistration: 'Guardar registro',
    
    // Firma
    signature: 'Firma del huésped',
    signatureInstruction: 'Por favor, firme en el área de abajo',
    clearSignature: 'Borrar',
    signHere: 'Firme aquí',
    signatureRequired: 'La firma es requerida para completar el registro',
    
    // Fechas de estancia
    stayDates: 'Fechas de estancia',
    checkInDate: 'Fecha de entrada',
    checkOutDate: 'Fecha de salida',
    selectCheckInDate: 'Seleccionar fecha de entrada',
    selectCheckOutDate: 'Seleccionar fecha de salida',
    checkOutDateOptional: '(opcional)',
    clear: 'Limpiar',
    
    // Validación
    firstNameRequired: 'El nombre es requerido',
    lastNameRequired: 'Los apellidos son requeridos',
    documentNumberRequired: 'El número de documento es requerido',
    emailInvalid: 'Email inválido',
    selectApartmentError: 'Selecciona un apartamento',
    addAtLeastOneGuest: 'Añade al menos un huésped',
    
    // Mensajes
    guestAdded: 'Huésped añadido',
    registrationSaved: 'Registro guardado correctamente',
    errorSaving: 'Error al guardar el registro',
    errorLoadingApartments: 'Error al cargar los apartamentos',
    errorLoadingRegistrations: 'Error al cargar los registros',
    
    // Panel de administración
    adminPanel: 'Panel de Administración',
    allApartments: 'Todos los apartamentos',
    status: 'Estado',
    all: 'Todos',
    activeStatus: 'Activos',
    finished: 'Finalizados',
    date: 'Fecha',
    
    // Detalles del registro
    registrationDetails: 'Detalles del Registro',
    checkIn: 'Entrada',
    checkOut: 'Salida',
    guestData: 'Datos del huésped',
    noPhoto: 'Sin foto',
    performCheckOut: 'Realizar checkout',
    checkoutDone: 'Checkout realizado correctamente',
    checkoutError: 'Error al realizar el checkout',
    
    // Notas
    notes: 'Notas',
    editNotes: 'Editar notas',
    notesPlaceholder: 'Añadir notas...',
    saveNotes: 'Guardar notas',
    notesUpdated: 'Notas actualizadas',
    notesError: 'Error al actualizar las notas',
    
    // Eliminar
    deleteRegistration: 'Eliminar registro',
    deleteConfirmation: '¿Está seguro de que desea eliminar este registro?',
    deleteWarning: 'Esta acción no se puede deshacer.',
    deleteConfirmTitle: '¿Eliminar registro?',
    deleteConfirmDescription: 'Esta acción no se puede deshacer. El registro será eliminado permanentemente.',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    registrationDeleted: 'Registro eliminado correctamente',
    deleteError: 'Error al eliminar el registro',
    
    // Footer
    footerTitle: 'Hotel Rural Los Rubiales',
    footerSubtitle: 'Un rincón de paz en plena naturaleza',
    allRightsReserved: 'Todos los derechos reservados.',
    
    // Otros
    noRecords: 'No hay registros que mostrar',
    noApartments: 'No hay apartamentos disponibles',
    noRegistrations: 'No hay registros todavía',
    viewDetails: 'Ver detalles',
    checkedOut: 'Finalizado',
    checkout: 'Realizar checkout',
    selectDate: 'Seleccionar fecha',
    signaturePlaceholder: 'Firme aquí',
    required: '*',
    
    // Login
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    username: 'Usuario',
    password: 'Contraseña',
    usernamePlaceholder: 'Introduce tu usuario',
    passwordPlaceholder: 'Introduce tu contraseña',
    loginButton: 'Entrar',
    loginError: 'Usuario o contraseña incorrectos',
    loginRequired: 'Debes iniciar sesión para continuar',
    welcomeUser: 'Bienvenido',
    userRole: 'Usuario',
    adminRole: 'Administrador',
    noPermission: 'No tienes permiso para acceder a esta sección',
    
    // Exportación
    exportPDF: 'Exportar PDF',
    exportExcel: 'Exportar Excel',
    exportAll: 'Exportar todo',
    exportFiltered: 'Exportar filtrado',
    exporting: 'Exportando...',
  },
  
  en: {
    // Header
    hotelName: 'Los Rubiales',
    hotelSubtitle: 'Rural Hotel',
    home: 'Home',
    admin: 'Admin',
    
    // Apartments
    apartment: 'Apartment',
    apartment1: 'Apartment 1',
    apartment2: 'Apartment 2',
    apartment3: 'Apartment 3',
    
    // Apartment selection
    welcome: 'Welcome',
    selectApartment: 'Select an apartment to register guests',
    capacity: 'Capacity',
    people: 'people',
    active: 'active',
    
    // Registration form
    backToApartments: 'Back to apartments',
    addGuestData: 'Add guest details',
    
    // Form fields
    firstName: 'First Name',
    firstNamePlaceholder: 'John',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Smith',
    documentType: 'Document Type',
    documentNumber: 'Document Number',
    documentNumberPlaceholder: '12345678A',
    nationality: 'Nationality',
    nationalityPlaceholder: 'Spanish',
    dateOfBirth: 'Date of Birth',
    email: 'Email',
    emailPlaceholder: 'john@email.com',
    phone: 'Phone',
    phonePlaceholder: '+34 612 345 678',
    address: 'Address',
    addressPlaceholder: 'Main Street, 123',
    city: 'City',
    cityPlaceholder: 'Madrid',
    postalCode: 'Postal Code',
    postalCodePlaceholder: '28001',
    
    // Document
    dni: 'ID Card',
    passport: 'Passport',
    nie: 'NIE',
    documentPhoto: 'Document Photo',
    documentPhotos: 'Document Photos',
    takePhoto: 'Take photo',
    changePhoto: 'Change photo',
    
    // Main guest
    mainGuest: 'Mark as main guest',
    principal: 'Main',
    
    // Actions
    addGuest: 'Add Guest',
    guests: 'Guests',
    noGuests: 'No guests added',
    saveRegistration: 'Save Registration',
    
    // Signature
    signature: 'Guest Signature',
    signatureInstruction: 'Please sign in the area below',
    clearSignature: 'Clear',
    signHere: 'Sign here',
    signatureRequired: 'Signature is required to complete registration',
    
    // Stay dates
    stayDates: 'Stay Dates',
    checkInDate: 'Check-in Date',
    checkOutDate: 'Check-out Date',
    selectCheckInDate: 'Select check-in date',
    selectCheckOutDate: 'Select check-out date',
    checkOutDateOptional: '(optional)',
    clear: 'Clear',
    
    // Validation
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    documentNumberRequired: 'Document number is required',
    emailInvalid: 'Invalid email',
    selectApartmentError: 'Select an apartment',
    addAtLeastOneGuest: 'Add at least one guest',
    
    // Messages
    guestAdded: 'Guest added',
    registrationSaved: 'Registration saved successfully',
    errorSaving: 'Error saving registration',
    errorLoadingApartments: 'Error loading apartments',
    errorLoadingRegistrations: 'Error loading registrations',
    
    // Admin panel
    adminPanel: 'Admin Panel',
    allApartments: 'All apartments',
    status: 'Status',
    all: 'All',
    activeStatus: 'Active',
    finished: 'Finished',
    date: 'Date',
    
    // Registration details
    registrationDetails: 'Registration Details',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    guestData: 'Guest Data',
    noPhoto: 'No photo',
    performCheckOut: 'Perform check-out',
    checkoutDone: 'Check-out completed successfully',
    checkoutError: 'Error performing check-out',
    
    // Notes
    notes: 'Notes',
    editNotes: 'Edit notes',
    notesPlaceholder: 'Add notes...',
    saveNotes: 'Save notes',
    notesUpdated: 'Notes updated',
    notesError: 'Error updating notes',
    
    // Delete
    deleteRegistration: 'Delete Registration',
    deleteConfirmation: 'Are you sure you want to delete this registration?',
    deleteWarning: 'This action cannot be undone.',
    deleteConfirmTitle: 'Delete registration?',
    deleteConfirmDescription: 'This action cannot be undone. The registration will be permanently deleted.',
    cancel: 'Cancel',
    delete: 'Delete',
    registrationDeleted: 'Registration deleted successfully',
    deleteError: 'Error deleting registration',
    
    // Footer
    footerTitle: 'Los Rubiales Rural Hotel',
    footerSubtitle: 'A peaceful corner in nature',
    allRightsReserved: 'All rights reserved.',
    
    // Others
    noRecords: 'No records to show',
    noApartments: 'No apartments available',
    noRegistrations: 'No registrations yet',
    viewDetails: 'View details',
    checkedOut: 'Finished',
    checkout: 'Check-out',
    selectDate: 'Select date',
    signaturePlaceholder: 'Sign here',
    required: '*',
    
    // Login
    login: 'Login',
    logout: 'Logout',
    username: 'Username',
    password: 'Password',
    usernamePlaceholder: 'Enter your username',
    passwordPlaceholder: 'Enter your password',
    loginButton: 'Login',
    loginError: 'Invalid username or password',
    loginRequired: 'You must login to continue',
    welcomeUser: 'Welcome',
    userRole: 'User',
    adminRole: 'Administrator',
    noPermission: 'You do not have permission to access this section',
    
    // Export
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    exportAll: 'Export all',
    exportFiltered: 'Export filtered',
    exporting: 'Exporting...',
  }
}

export type TranslationKey = keyof typeof translations.es

// Función auxiliar para traducir nombres de apartamentos
export function translateApartmentName(name: string, language: Language): string {
  const apartmentMap: Record<string, Record<Language, string>> = {
    'Apartamento 1': { es: 'Apartamento 1', en: 'Apartment 1' },
    'Apartamento 2': { es: 'Apartamento 2', en: 'Apartment 2' },
    'Apartamento 3': { es: 'Apartamento 3', en: 'Apartment 3' },
  }
  
  return apartmentMap[name]?.[language] || name
}

// Función auxiliar para traducir estados
export function translateStatus(status: string, language: Language): string {
  const statusMap: Record<string, Record<Language, string>> = {
    'active': { es: 'Activo', en: 'Active' },
    'checked_out': { es: 'Finalizado', en: 'Finished' },
  }
  
  return statusMap[status]?.[language] || status
}

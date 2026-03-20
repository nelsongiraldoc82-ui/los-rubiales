# Los Rubiales - Sistema de Registro de Huéspedes

## 🏨 Sistema SIN autenticación

Esta versión **no requiere login**. Acceso directo a todas las funciones.

---

## Despliegue en Netlify

### 1. Variables de Entorno REQUERIDAS

En Netlify, ve a **Site settings > Environment variables** y configura:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `file:./dev.db` |
| `TURSO_DATABASE_URL` | `libsql://los-rubiales-javidesign.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | Tu token de Turso |

⚠️ **IMPORTANTE**: Las 3 variables son obligatorias para que funcione.

### 2. Configuración de Build

- **Build command:** `prisma generate && next build`
- **Publish directory:** `.next`
- **Node version:** 20

### 3. Inicialización

Después del despliegue, visita UNA vez:
```
https://tu-sitio.netlify.app/api/setup
```

Esto creará los 3 apartamentos automáticamente.

---

## Características

- ✅ **Sin login** - Acceso directo
- ✅ Registro de huéspedes con datos personales
- ✅ Foto del documento de identidad
- ✅ Múltiples huéspedes por apartamento
- ✅ Firma digital
- ✅ Panel de administración
- ✅ Exportación a PDF y Excel
- ✅ Multi-idioma (Español/Inglés)
- ✅ Datos guardados en la nube (Turso)
- ✅ Visible desde cualquier dispositivo

---

## Funciones

1. **Registrar huéspedes**: Selecciona apartamento → Añade huéspedes → Firma → Guardar
2. **Ver registros**: Botón "Admin" en el header
3. **Checkout**: En el panel admin, ver detalles → Check-out
4. **Exportar**: PDF o Excel desde el panel admin

---

## Solución de Problemas

### Error: "URL_INVALID"
- Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén configurados correctamente en Netlify

### Error: "No apartments found"
- Visita `/api/setup` para crear los apartamentos

### Las tablas no existen en Turso
Ejecuta localmente con las credenciales de Turso:
```bash
export TURSO_DATABASE_URL="libsql://los-rubiales-javidesign.aws-us-east-1.turso.io"
export TURSO_AUTH_TOKEN="tu-token"
npx prisma db push
```

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables
cp .env.example .env
# Edita .env con tus credenciales de Turso

# Crear tablas locales
npx prisma db push

# Iniciar
npm run dev
```

# Los Rubiales - Sistema de Registro de Huéspedes

## Despliegue en Netlify

### 1. Variables de Entorno Requeridas

En Netlify, ve a **Site settings > Environment variables** y configura:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `file:./dev.db` (o cualquier valor, es requerido por Prisma) |
| `TURSO_DATABASE_URL` | `libsql://los-rubiales-javidesign.aws-us-east-1.turso.io` |
| `TURSO_AUTH_TOKEN` | Tu token de Turso |

### 2. Configuración de Build en Netlify

- **Build command:** `prisma generate && next build`
- **Publish directory:** `.next`
- **Node version:** 20

### 3. Inicialización de la Base de Datos

Una vez desplegado, visita:
```
https://tu-sitio.netlify.app/api/auth/setup
```

Esto creará automáticamente:
- 2 usuarios (admin y usuario)
- 3 apartamentos

### 4. Credenciales de Acceso

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador (puede ver, crear, modificar y eliminar registros) |
| `usuario` | `user123` | Usuario básico (solo puede crear registros) |

## Características

- ✅ Registro de huéspedes con datos personales
- ✅ Foto del documento de identidad
- ✅ Múltiples huéspedes por apartamento
- ✅ Firma digital
- ✅ Exportación a PDF y Excel
- ✅ Multi-idioma (Español/Inglés)
- ✅ Compatible con móviles y tablets

## Solución de Problemas

### Las API routes devuelven 404

1. Verifica que `output: "standalone"` NO esté en `next.config.ts`
2. Verifica que `@netlify/plugin-nextjs` esté en `package.json`
3. En Netlify, asegúrate de que el plugin está en `netlify.toml`

### Error de conexión a la base de datos

1. Verifica que las variables `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén configuradas
2. Asegúrate de que las tablas estén creadas en Turso (ejecuta `prisma db push` localmente con las credenciales de Turso)

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Turso

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor de desarrollo
npm run dev
```

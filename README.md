# Hotel Rural Los Rubiales - Sistema de Registro de Huéspedes

Sistema multiplataforma para el registro de huéspedes del Hotel Rural Los Rubiales.

## 🚀 Despliegue en Netlify

### Requisitos
- Cuenta en [Netlify](https://netlify.com)
- Cuenta en [Turso](https://turso.tech) para la base de datos
- Repositorio en GitHub

### Variables de Entorno en Netlify

Configura estas variables en **Site settings → Environment variables**:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `file:./db/local.db` (opcional) |
| `TURSO_DATABASE_URL` | URL de Turso (ej: `libsql://los-rubiales-xxx.turso.io`) |
| `TURSO_AUTH_TOKEN` | Token de autenticación de Turso |

### Pasos de Despliegue

1. **Subir a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/los-rubiales.git
   git push -u origin main
   ```

2. **Conectar con Netlify**
   - Ve a [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Selecciona tu repositorio de GitHub
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Configurar Variables de Entorno**
   - Añade `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`

4. **Crear Usuarios Iniciales**
   - Después del despliegue, ejecuta:
   ```bash
   curl -X POST https://tu-sitio.netlify.app/api/auth/setup
   ```

## 👥 Usuarios por Defecto

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador (ver/modificar registros) |
| `usuario` | `user123` | Usuario (solo crear registros) |

⚠️ **IMPORTANTE**: Cambia las contraseñas después del primer login.

## 📱 Funcionalidades

- ✅ Selección de apartamento (3 apartamentos)
- ✅ Registro de huéspedes con datos personales
- ✅ Foto del documento de identidad
- ✅ Firma digital
- ✅ Fechas de entrada/salida
- ✅ Multi-idioma (Español/Inglés)
- ✅ Exportación a PDF y Excel
- ✅ Sistema de usuarios con roles

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar base de datos local
npx prisma db push

# Iniciar servidor de desarrollo
npm run dev
```

## 📁 Estructura del Proyecto

```
├── prisma/
│   └── schema.prisma          # Esquema de base de datos
├── scripts/
│   ├── generate_registrations_pdf.py
│   └── generate_registrations_xlsx.py
├── src/
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   └── page.tsx           # Página principal
│   └── lib/
│       ├── prisma.ts          # Cliente de base de datos
│       └── translations.ts    # Traducciones
├── netlify.toml               # Configuración Netlify
└── package.json
```

---

**Hotel Rural Los Rubiales** - Sistema de Registro de Huéspedes

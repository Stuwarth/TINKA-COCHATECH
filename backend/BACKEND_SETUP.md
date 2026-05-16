# TINKA Backend API

API REST para la herramienta de registro de ventas de emprendedores Tinka - Banco FIE.

## 🚀 Características

- ✅ Registro de ventas con validación
- ✅ Dashboard con resumen de ventas (últimos 7 días)
- ✅ Reportes por período, método de pago y diarios
- ✅ Coach IA para consultas sobre ventas
- ✅ Integración con Supabase
- ✅ Escalable y modular con NestJS

## 📋 Requisitos previos

- Node.js 18+
- npm o yarn
- Cuenta en [Supabase](https://supabase.com)

## ⚙️ Configuración

### 1. Clonar y instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y completa tus valores:

```bash
cp .env.example .env
```

Completa los valores en `.env`:

```env
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-secret-key-here-min-32-chars-long!
JWT_EXPIRATION=24h

# Groq API (opcional, para Coach IA mejorado)
GROQ_API_KEY=your-groq-api-key-here
```

### 3. Crear la base de datos en Supabase

1. Entra a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor**
3. Crea una nueva query y ejecuta el contenido de `src/database/init.sql`

### 4. Iniciar el servidor

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

El servidor iniciará en `http://localhost:3000`

## 📚 Endpoints principales

### Ventas

**POST /sales** - Crear nueva venta
```json
{
  "product_name": "Combo Jugo + Salteña",
  "amount": 15.00,
  "payment_method": "QR",
  "location": "Tienda"
}
```

**GET /sales** - Listar ventas
```
GET /sales?from=2026-05-10&to=2026-05-16
```

**GET /sales/today** - Ventas de hoy

**GET /sales/summary** - Resumen del dashboard
```json
{
  "total_week": 1450.00,
  "health_status": "Excelente",
  "percentage_up": 15,
  "last_5_days": [
    { "day": "Lun", "amount": 250 },
    { "day": "Mar", "amount": 450 }
  ]
}
```

### Reportes

**GET /reports/summary** - Reporte resumido
```
GET /reports/summary?from=2026-05-01&to=2026-05-31
```

**GET /reports/by-payment** - Desglose por método de pago
```
GET /reports/by-payment?from=2026-05-01&to=2026-05-31
```

**GET /reports/daily** - Reporte diario
```
GET /reports/daily?from=2026-05-01&to=2026-05-31
```

### Coach IA

**POST /coach/chat** - Consultar al coach
```json
{
  "message": "¿Cómo estuvieron mis ventas hoy?",
  "userId": "optional-user-id"
}
```

Respuesta:
```json
{
  "message": "¿Cómo estuvieron mis ventas hoy?",
  "response": "¡Excelente trabajo! Hoy vendiste Bs. 400.00 con 5 transacciones...",
  "timestamp": "2026-05-16T10:30:00Z"
}
```

## 🏗️ Estructura del proyecto

```
src/
├── modules/
│   ├── sales/          # Módulo de ventas
│   ├── reports/        # Módulo de reportes
│   ├── coach/          # Módulo del coach IA
│   └── auth/           # (Futuro) Módulo de autenticación
├── common/             # Utilidades, decoradores, guards
├── config/             # Configuración (Supabase, JWT, etc)
├── database/           # Scripts SQL
└── app.module.ts       # Módulo principal
```

## 🧪 Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Dependencias principales

- `@nestjs/common` - Framework NestJS
- `@supabase/supabase-js` - Cliente de Supabase
- `class-validator` - Validación de DTOs
- `class-transformer` - Transformación de datos
- `@nestjs/jwt` - Autenticación con JWT
- `passport` - Estrategias de autenticación

## 🚢 Despliegue

### Heroku

```bash
git push heroku main
```

### Railway

```bash
railway deploy
```

### AWS/DigitalOcean

```bash
npm run build
npm run start:prod
```

## 📞 Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.

## 📄 Licencia

Proyecto privado - Banco FIE


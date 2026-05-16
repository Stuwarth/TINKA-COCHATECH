# 🚀 Quick Start - TINKA Backend

## Pasos rápidos para empezar (5 minutos)

### 1. Configurar Supabase

1. Ve a https://supabase.com y crea un proyecto nuevo
2. En **SQL Editor**, ejecuta el contenido de `src/database/init.sql`
3. Copia tu `SUPABASE_URL` y `SUPABASE_ANON_KEY`

### 2. Configurar variables de entorno

Edita el archivo `.env` y reemplaza:

```env
SUPABASE_URL=tu-url-de-supabase
SUPABASE_KEY=tu-anon-key
```

### 3. Instalar y ejecutar

```bash
# Instalar dependencias (si aún no lo hiciste)
npm install

# Ejecutar en modo desarrollo
npm run start:dev
```

✅ El servidor estará en: `http://localhost:3000/api`

---

## Endpoints para probar inmediatamente

### 1. Crear una venta
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "5 Empanadas",
    "amount": 25.50,
    "payment_method": "QR",
    "location": "Feria"
  }'
```

### 2. Ver resumen del dashboard
```bash
curl http://localhost:3000/api/sales/summary
```

### 3. Obtener reportes
```bash
curl "http://localhost:3000/api/reports/by-payment?from=2026-05-01&to=2026-05-31"
```

---

## Estructura creada

```
✅ src/modules/
  ✅ auth/         - Autenticación (login, registro)
  ✅ sales/        - CRUD de ventas + dashboard
  ✅ reports/      - Reportes por período y método de pago

✅ src/common/
  ✅ decorators/   - @CurrentUser
  ✅ filters/      - Manejo global de excepciones
  ✅ guards/       - JWT Authentication
  ✅ utils/        - Funciones auxiliares

✅ src/config/
  ✅ supabase.config.ts - Configuración de Supabase

✅ src/database/
  ✅ init.sql - Script para crear tablas
```

---

## Próximos pasos

1. **Implementar Auth completo** - Validar usuarios contra Supabase
2. **Integrar Groq IA** - Mejorar el Coach IA con respuestas inteligentes
3. **Agregar rate limiting** - Proteger endpoints
4. **Tests** - Escribir tests unitarios y e2e
5. **Documentación OpenAPI** - Agregar Swagger

---

## 🐛 Troubleshooting

**Error: Cannot find module '@supabase/supabase-js'**
```bash
npm install @supabase/supabase-js
```

**Error: SUPABASE_URL or SUPABASE_KEY not found**
- Verifica que el `.env` esté correctamente configurado
- Reinicia el servidor: `npm run start:dev`

**Error: Cannot POST /api/sales**
- Asegúrate de que Supabase está configurado correctamente
- Verifica que la tabla `sales` existe en tu proyecto Supabase

---

## 📚 Documentación completa

Ver `BACKEND_SETUP.md` para información más detallada.


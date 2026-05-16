# 📋 Configuración de Bruno para Endpoints de Ventas

## 1️⃣ GET /api/sales (Listar todas las ventas)

### Paso 1: Nueva petición en Bruno
- Click en `+ New Request`
- Nombre: `Listar Todas las Ventas`
- Carpeta: `HACKATHON_CBBA_BACK` → `GET Listar 1`

### Paso 2: Configuración
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/sales`

### Paso 3: Headers
```
No agregar Content-Type (GET sin body)
```

### Paso 4: Body
```
VACÍO - NO AGREGUES NADA AQUÍ
```

### Paso 5: Enviar
- Click en el botón **Send** ▶️

**Resultado esperado:**
```json
[]
```
o si hay ventas:
```json
[
  {
    "id": "uuid-aqui",
    "user_id": "uuid-aqui",
    "product_name": "5 Empanadas",
    "amount": 25.50,
    "payment_method": "QR",
    "location": "Tienda",
    "created_at": "2026-05-16T10:30:00Z",
    "updated_at": "2026-05-16T10:30:00Z"
  }
]
```

---

## 2️⃣ GET /api/sales/summary (Resumen del Dashboard)

### Paso 1: Nueva petición
- Click en `+ New Request`
- Nombre: `Resumen Dashboard`
- Carpeta: `HACKATHON_CBBA_BACK`

### Paso 2: Configuración
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/sales/summary`

### Paso 3: Headers
```
Sin headers especiales
```

### Paso 4: Body
```
VACÍO
```

### Paso 5: Enviar
- Click en **Send** ▶️

**Resultado esperado:**
```json
{
  "total_week": 0,
  "health_status": "Bueno",
  "percentage_up": 0,
  "last_5_days": [
    { "day": "Lun", "amount": 0 },
    { "day": "Mar", "amount": 0 },
    { "day": "Mié", "amount": 0 },
    { "day": "Jue", "amount": 0 },
    { "day": "Hoy", "amount": 0 }
  ]
}
```

---

## 3️⃣ GET /api/sales/today (Ventas de hoy)

### Paso 1: Nueva petición
- Nombre: `Ventas Hoy`

### Paso 2: Configuración
- **Método:** `GET`
- **URL:** `http://localhost:3000/api/sales/today`

### Paso 3: Body
```
VACÍO
```

### Paso 4: Enviar

**Resultado esperado:**
```json
[]
```

---

## 4️⃣ POST /api/sales (Crear una venta)

### Paso 1: Nueva petición
- Nombre: `Crear Venta`

### Paso 2: Configuración
- **Método:** `POST`
- **URL:** `http://localhost:3000/api/sales`

### Paso 3: Headers
```
Content-Type: application/json
```

### Paso 4: Body (Tab: JSON)
```json
{
  "product_name": "5 Empanadas",
  "amount": 25.50,
  "payment_method": "QR",
  "location": "Tienda"
}
```

### Paso 5: Enviar
- Click en **Send** ▶️

**Resultado esperado:**
```json
{
  "id": "abc123-uuid-aqui",
  "user_id": null,
  "product_name": "5 Empanadas",
  "amount": 25.50,
  "payment_method": "QR",
  "location": "Tienda",
  "created_at": "2026-05-16T14:30:45Z",
  "updated_at": "2026-05-16T14:30:45Z"
}
```

---

## 5️⃣ GET /api/sales con filtros por fecha (Opcional)

### Si quieres filtrar por rango de fechas:

- **Método:** `GET`
- **URL:** `http://localhost:3000/api/sales?from=2026-05-01&to=2026-05-16`

**Notas:**
- `from` y `to` deben ser fechas ISO válidas
- Ambos son **opcionales**
- Si no los incluyes, devuelve todas las ventas

---

## ⚠️ ERRORES COMUNES

### ❌ Error: `Unexpected token 'n', "null" is not valid JSON`
**Causa:** Estás enviando `null` en el Body de un GET

**Solución:**
1. Abre la petición GET
2. Ve a la pestaña **Body**
3. Borra cualquier contenido
4. Deja completamente vacío

### ❌ Error: `Could not find the table 'public.sales'`
**Causa:** La tabla no existe en Supabase

**Solución:**
1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. SQL Editor
4. Copia y pega el script de `src/database/init.sql`
5. Click en **Run**

### ❌ Error: `400 Bad Request`
**Causa:** Los query params están mal formados

**Solución:**
- Usa formato ISO: `2026-05-16T00:00:00Z`
- No uses comillas en la URL

---

## ✅ CHECKLIST ANTES DE PROBAR

- [ ] El backend está corriendo (`npm start`)
- [ ] En Bruno, pusiste la URL correcta (`localhost:3000`, no `localhost:3001`)
- [ ] El endpoint tiene el prefijo `/api/` (ya está en el código)
- [ ] Para GET: **NO hay Body**
- [ ] Para POST: Body es JSON válido
- [ ] La tabla `sales` existe en Supabase

---

## 🚀 PRÓXIMOS PASOS

1. **Primero:** prueba `GET /api/sales` (debería devolver `[]`)
2. **Luego:** prueba `POST /api/sales` con datos de ejemplo
3. **Después:** prueba `GET /api/sales` de nuevo (debería devolver la venta)
4. **Finalmente:** prueba `GET /api/sales/summary` (debería mostrar datos)

---

¿Problemas? Dimelo y te ayudo a debuggear.


# 🚀 ARQUITECTURA BACKEND - TINKA COACH IA (NestJS + Supabase)

Hola Backend Lead! Aquí está tu mapa de ruta para las próximas horas. 
Nuestro objetivo es mantenerlo SIMPLE, RÁPIDO y FUNCIONAL. Nada de sobre-ingeniería.

## 1. BASE DE DATOS (Supabase)
Entra a Supabase, crea un nuevo proyecto y corre este SQL en el SQL Editor para crear nuestra tabla principal:

```sql
-- Tabla de Ventas
create table sales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid, -- Por ahora puede ser null si no implementamos Auth completo hoy
  product_name text not null, -- ej: "5 Empanadas"
  amount decimal(10,2) not null, -- ej: 25.50
  payment_method text not null, -- "Efectivo", "QR", "Transferencia"
  location text, -- "Feria", "Tienda", "Delivery"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS pero hacerla pública temporalmente para ir rápido en el Hackathon
alter table sales enable row level security;
create policy "Permitir todo temporalmente" on sales for all using (true);
```

## 2. ENDPOINTS (NestJS)

Necesito que levantes tu NestJS e instales Supabase:
`npm install @supabase/supabase-js`

Deberás crear estos 3 Endpoints REST (usa un `SalesController` y un `CoachController`):

### A. Crear Venta
*   **Ruta:** `POST /sales`
*   **Body esperado (JSON):**
    ```json
    {
      "product_name": "Combo Jugo + Salteña",
      "amount": 15.00,
      "payment_method": "QR",
      "location": "Tienda"
    }
    ```
*   **Acción:** Guardar esto en Supabase usando su SDK.

### B. Resumen del Dashboard (P0 para Frontend)
*   **Ruta:** `GET /sales/summary`
*   **Respuesta esperada (JSON):**
    ```json
    {
      "total_week": 1450.00,
      "health_status": "Excelente",
      "percentage_up": 15,
      "last_5_days": [
        { "day": "Lun", "amount": 250 },
        { "day": "Mar", "amount": 450 },
        { "day": "Mié", "amount": 150 },
        { "day": "Jue", "amount": 300 },
        { "day": "Hoy", "amount": 400 }
      ]
    }
    ```
*   **Acción:** Hacer un `SELECT` a Supabase de los últimos 7 días y sumarizar. (Si no te da tiempo de hacer la lógica SQL compleja, **devuelve estos datos falsos quemados** para la demo visual de las primeras 24h).

### C. El Coach IA (Conectar con Groq)
*   **Ruta:** `POST /coach/chat`
*   **Body esperado:**
    ```json
    {
      "message": "¿Cómo estuvieron mis ventas hoy?"
    }
    ```
*   **Acción:** 
    1. Haces un SELECT a Supabase para sacar el total del día de Doña María.
    2. Le mandas a la API de Groq el Prompt: *"Eres Coach Tinka. El usuario vendió Bs. 400 hoy. Respóndele a su mensaje: '¿Cómo estuvieron mis ventas hoy?'"*
    3. Devuelves el string que te responde Groq al Frontend.

## 3. PASOS INMEDIATOS PARA TI:
1. Crea tu rama `git checkout jhunior` (o cual sea tu nombre).
2. Configura tu `.env` con las variables de Supabase `SUPABASE_URL` y `SUPABASE_KEY`.
3. Haz el endpoint `GET /sales/summary` aunque sea con datos falsos (mockeados) para que el Frontend ya pueda conectarse hoy mismo.

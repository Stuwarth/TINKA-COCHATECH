# 📱 GUÍA TÉCNICA: INTEGRACIÓN OMNICANAL WHATSAPP + GROQ

Esta guía es para el equipo encargado de la Inteligencia Artificial y la integración del Bot de WhatsApp. Su misión es el "Efecto WOW" del proyecto.

## 🎯 El Flujo Exacto (El Escenario de Doña María)
1. **El Input:** Doña María manda un audio por WhatsApp diciendo: *"Vendí 2 empanadas a 10 bolivianos en efectivo"*.
2. **El Webhook:** El bot de WhatsApp (Twilio o Meta) recibe ese audio y se lo envía a nuestro Backend en NestJS.
3. **Transcripción (Speech-to-Text):** NestJS usa la API de Groq (modelo Whisper) para pasar ese audio a texto en milisegundos.
4. **Extracción (LLaMA 3):** NestJS toma el texto y se lo da a Groq (LLaMA 3) pidiéndole que extraiga los datos clave y los convierta en un objeto JSON estructurado.
5. **Base de Datos:** NestJS guarda ese JSON en Supabase.
6. **El Resultado:** Cuando Doña María abre su App web, sus gráficos ya están actualizados sin haber tocado la pantalla.

---

## 🛠️ Pasos Técnicos para Implementar esto AHORA

### PASO 1: Configurar el Bot de WhatsApp
Para un Hackathon, la forma más fácil y rápida (sin aprobaciones de Meta) es usar **Twilio Sandbox for WhatsApp**.
- Creen una cuenta gratuita en Twilio.
- Activen el Sandbox de WhatsApp.
- Configuren el Webhook de Twilio para que apunte a la URL de su backend (necesitarán usar `ngrok` para exponer su `localhost:3000` a internet).

### PASO 2: El Endpoint del Webhook en NestJS
El equipo Backend debe crear un endpoint que reciba los mensajes de Twilio:
`POST /whatsapp/webhook`

Cuando llega el mensaje, sacan el texto (o el link del audio).

### PASO 3: El Prompt Mágico para Groq (LLaMA 3)
El "secreto" para que la IA funcione como registradora de ventas es darle un **System Prompt** muy estricto para que siempre devuelva JSON. 

Ejemplo de código para enviar a la API de Groq:

```javascript
// El prompt que deben usar
const systemPrompt = `
Eres un asistente de extracción de datos para Banco FIE. 
El usuario te dirá qué vendió y debes extraer la venta.
DEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO. SIN TEXTO EXTRA.
Las claves del JSON deben ser:
- "product_name": string (lo que vendió)
- "amount": number (monto total numérico)
- "payment_method": string (puede ser "Efectivo", "QR", "Transferencia")

Ejemplo:
User: "vendí 3 jugos por 15 pesitos me pagaron con qr"
Assistant: { "product_name": "3 Jugos", "amount": 15, "payment_method": "QR" }
`;

// Mensaje de Doña María (Ya transcrito a texto)
const userMessage = "Vendí 2 empanadas a 10 bolivianos en efectivo";

// Aquí hacen el fetch a la API de Groq usando LLaMA 3
```

### PASO 4: Guardar en Supabase
1. Reciben el JSON que generó Groq: `{ "product_name": "2 empanadas", "amount": 10, "payment_method": "Efectivo" }`
2. Usan `@supabase/supabase-js` para hacer un simple `INSERT` en la tabla `sales` que creamos en el archivo `BACKEND_ARCHITECTURE.md`.

---

## 💡 Alternativa "Humo y Espejos" (Estrategia de Hackathon)
Si ven que falta tiempo y Twilio/WhatsApp es muy difícil de configurar en 36 horas:
Hagan una **Simulación Visual en la presentación**. 
- Abran el WhatsApp Web normal.
- Muestren cómo le envían un mensaje a un "contacto" que se llame Tinka.
- Tengan un script corriendo en el backend que escuche peticiones simples desde Postman que simulen ser el mensaje de WhatsApp. Lo importante es demostrar que **Groq puede estructurar el texto en una base de datos de manera automática**. El jurado evalúa la idea y la arquitectura de la IA, no si aprobaron una cuenta comercial de Meta.

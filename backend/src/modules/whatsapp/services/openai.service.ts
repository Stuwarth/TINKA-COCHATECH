import { Injectable, Logger } from '@nestjs/common';

export interface OpenAIResponse {
  intent: 'sale' | 'chat';
  saleData?: {
    product_name: string;
    quantity: number;
    amount: number;
    payment_method: 'Efectivo' | 'QR' | 'Transferencia' | 'Tarjeta';
  };
  chatResponse?: string;
}

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly apiUrl = 'https://models.inference.ai.azure.com/chat/completions';
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('⚠️ OPENAI_API_KEY (GitHub Models Token) no configurada en las variables de entorno.');
    }
  }

  /**
   * Envía el mensaje del usuario a la IA de GitHub Models (gpt-4o-mini).
   * Clasifica la intención: "sale" (registro de venta) o "chat" (pregunta general / coach).
   * @param text Mensaje de texto del usuario
   * @param businessContext Información sobre el negocio y sus ventas de hoy
   * @returns OpenAIResponse con la intención clasificada y los datos correspondientes
   */
  async classifyAndProcess(text: string, businessContext: { businessName: string; todaySales: any[] }): Promise<OpenAIResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('OPENAI_API_KEY no está configurada.');
      }

      // Convertir ventas de hoy a un formato legible para el prompt
      const salesSummaryText = businessContext.todaySales.length > 0
        ? businessContext.todaySales.map(s => `- ${s.quantity}x ${s.product_name} por Bs. ${s.amount} (${s.payment_method})`).join('\n')
        : 'No se han registrado ventas hoy todavía.';

      const totalAmountToday = businessContext.todaySales.reduce((sum, s) => sum + s.amount, 0);

      const systemPrompt = `Eres Tinka, la Coach de Inteligencia Artificial para microemprendedores y pequeños negocios de Banco FIE en Bolivia.
Estás hablando con el dueño del negocio "${businessContext.businessName}" a través de WhatsApp.

Tu misión es entender si el usuario quiere REGISTRAR UNA VENTA (intent: "sale") o si quiere HACER UNA PREGUNTA / CONVERSAR (intent: "chat").

DEBES RESPONDER ÚNICAMENTE CON UN OBJETO JSON VÁLIDO.
El JSON debe seguir esta estructura exacta:
{
  "intent": "sale" | "chat",
  "saleData": { // SOLO si "intent" es "sale"
    "product_name": string (ej: "Empanada de carne". NO incluyas cantidades aquí, solo el nombre del producto en singular/plural),
    "quantity": number (cantidad vendida, por defecto 1 si no se especifica),
    "amount": number (monto TOTAL en bolivianos de esta venta, ej: si vendió 2 a 5bs c/u, el monto total es 10),
    "payment_method": "Efectivo" | "QR" | "Transferencia" | "Tarjeta" (por defecto "Efectivo" si no se especifica)
  },
  "chatResponse": string // SOLO si "intent" es "chat". Tu respuesta conversacional, motivadora, y amable como Tinka Coach de Banco FIE.
}

---
CONTEXTO DEL NEGOCIO HOY:
* Negocio: "${businessContext.businessName}"
* Ventas del día de hoy:
${salesSummaryText}
* Total acumulado hoy: Bs. ${totalAmountToday}
---

REGLAS DE CLASIFICACIÓN:
1. Si el usuario describe claramente una transacción comercial o venta (ej: "vendí una salteña a 8 bolivianos", "registra un refresco de 5 bs por qr", "2 empanadas 10 pesos"), clasifica como "sale".
2. Si el usuario te saluda, te hace una pregunta general, te pide un consejo, o te pregunta sobre sus ventas (ej: "hola", "¿cuánto vendí hoy?", "¿qué consejos me das?", "cómo voy?"), clasifica como "chat".
3. En las respuestas conversacionales ("chatResponse"), sé extremadamente empático, usa modismos bolivianos amables de forma sutil y profesional ("¡Hola!", "¡Excelente!", "fuerza emprendedor/a"), mantén las respuestas concisas (ideales para leer en WhatsApp) y usa emojis de forma agradable.
4. Si te preguntan sobre las ventas de hoy, usa los datos del CONTEXTO DEL NEGOCIO HOY para darles un resumen detallado y motivador.`;

      this.logger.log(`Enviando mensaje a GitHub Models gpt-4o-mini...`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        this.logger.error(`Error en la API de GitHub Models: Status ${response.status} | ${errorDetails}`);
        throw new Error(`API de GitHub Models falló con estado ${response.status}`);
      }

      const responseData = await response.json();
      const rawContent = responseData.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new Error('Respuesta vacía recibida del modelo.');
      }

      this.logger.log(`Respuesta raw de OpenAI: ${rawContent}`);
      const parsedResponse = JSON.parse(rawContent) as OpenAIResponse;

      return parsedResponse;
    } catch (error) {
      this.logger.error(`Error en classifyAndProcess: ${error.message}`);
      // Respuesta de fallback segura
      return {
        intent: 'chat',
        chatResponse: '¡Hola! Disculpa, estoy teniendo un pequeño problema para conectarme con mis sistemas. ¿Podrías volver a intentar enviarme tu mensaje en un momento? 🚀',
      };
    }
  }
}

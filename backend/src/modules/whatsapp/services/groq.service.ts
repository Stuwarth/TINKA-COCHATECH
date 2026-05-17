import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

export interface ExtractedSaleData {
  product_name: string;
  quantity: number;
  amount: number;
  payment_method: string;
  location: string;
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly groq: Groq;

  constructor() {
    // Evitar que el constructor de Groq falle al inicio si la API key está comentada/vacía
    const apiKey = process.env.GROQ_API_KEY || 'DUMMY_KEY_NOT_CONFIGURED';
    this.groq = new Groq({
      apiKey,
    });
  }

  /**
   * Transcribe un audio usando Groq Whisper (whisper-large-v3-turbo).
   * @param audioBuffer Buffer del archivo de audio
   * @param filename Nombre del archivo (ej: "audio.ogg")
   * @returns Texto transcrito
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    filename = 'audio.ogg',
  ): Promise<string> {
    try {
      const file = new File([new Uint8Array(audioBuffer)], filename, {
        type: 'audio/ogg',
      });

      const transcription = await this.groq.audio.transcriptions.create({
        file: file,
        model: 'whisper-large-v3-turbo',
        language: 'es',
        response_format: 'text',
      });

      let text = '';
      if (typeof transcription === 'string') {
        text = transcription;
      } else if (transcription && typeof transcription === 'object') {
        text = String((transcription as unknown as { text?: unknown }).text || '');
      }

      this.logger.log(`Audio transcrito: "${text.substring(0, 100)}..."`);
      return text.trim();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error en transcripción: ${errorMessage}`);
      throw new Error(`Error al transcribir audio: ${errorMessage}`);
    }
  }

  /**
   * Extrae datos de venta estructurados desde texto usando Groq Llama 3.
   * @param text Texto del usuario (transcrito o directo)
   * @returns Datos de venta extraídos como JSON
   */
  async extractSaleData(text: string): Promise<ExtractedSaleData> {
    try {
      const systemPrompt = `Eres un asistente de registro de ventas para microemprendedores en Bolivia.
El usuario te dirá qué vendió. Extrae los datos y responde ÚNICAMENTE con un objeto JSON válido.
NO incluyas markdown, texto extra, ni explicaciones. SOLO el JSON.

Claves del JSON:
- "product_name": string (qué vendió, incluye cantidad en el nombre, ej: "2 Empanadas")
- "quantity": number (cantidad de items vendidos, si no se menciona asume 1)
- "amount": number (monto total numérico en bolivianos)
- "payment_method": string (debe ser exactamente uno de: "Efectivo", "QR", "Transferencia", "Tarjeta". Deduce de palabras clave: "efectivo", "cash" = Efectivo; "qr", "código qr" = QR; "transferencia", "banco" = Transferencia; "tarjeta", "débito" = Tarjeta. Por defecto "Efectivo")
- "location": string (debe ser exactamente uno de: "Tienda", "Feria", "Delivery". Deduce de palabras clave: "feria", "mercado" = Feria; "delivery", "a domicilio", "envío", "entregué", "para llevar" = Delivery; "tienda", "local", "negocio", "bodega" = Tienda. Por defecto "Tienda")

Reglas:
- Si no se menciona método de pago, asume "Efectivo".
- Si no se menciona ubicación, asume "Tienda".
- Si no se menciona cantidad, asume 1.
- Si el usuario dice "pesitos", "bolivianos", "bs", son bolivianos.
- Siempre devuelve el monto como número, sin simbolos.

Ejemplo:
User: "vendí 3 jugos por 15 pesitos me pagaron con qr en la feria"
Assistant: {"product_name":"3 Jugos","quantity":3,"amount":15,"payment_method":"QR","location":"Feria"}`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 256,
      });

      const rawResponse = chatCompletion.choices[0]?.message?.content || '';
      this.logger.log(`Respuesta Groq raw: ${rawResponse}`);

      // Sanitizar: extraer JSON de la respuesta (por si la IA agrega texto extra)
      const jsonString = this.extractJsonFromResponse(rawResponse);
      const parsed = JSON.parse(jsonString) as ExtractedSaleData;

      // Validar campos requeridos
      if (!parsed.product_name || typeof parsed.amount !== 'number') {
        throw new Error('JSON incompleto: falta product_name o amount');
      }

      // Valores por defecto
      parsed.quantity = parsed.quantity || 1;
      parsed.payment_method = parsed.payment_method || 'Efectivo';
      parsed.location = parsed.location || 'Tienda';

      this.logger.log(
        `Venta extraída: ${parsed.product_name} - Bs.${parsed.amount} (${parsed.payment_method}) [${parsed.location}]`,
      );

      return parsed;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error extrayendo datos de venta: ${errorMessage}`);
      throw new Error(
        `No pude entender la venta. Intenta de nuevo con más detalle.`,
      );
    }
  }

  /**
   * Extrae el primer objeto JSON válido de un string que puede contener texto extra.
   */
  private extractJsonFromResponse(response: string): string {
    // Intentar primero con el string completo (caso ideal)
    const trimmed = response.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed;
    }

    // Buscar JSON con regex
    const jsonMatch = response.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    throw new Error('No se encontró JSON válido en la respuesta de la IA');
  }
}

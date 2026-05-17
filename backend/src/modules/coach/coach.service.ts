import { Injectable, Logger } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';
import Groq from 'groq-sdk';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);
  private readonly groq: Groq;

  constructor(private readonly salesService: SalesService) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({ apiKey });
    }
  }

  async getChatResponse(userId: string, userMessage: string): Promise<string> {
    try {
      if (!this.groq) {
        return "⚠️ Configuración: Falta GROQ_API_KEY en tu archivo .env del backend.";
      }

      // 1. Obtener historial de ventas
      const sales = await this.salesService.listSales(undefined, undefined, userId);
      const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
      const totalCount = sales.length;
      
      const salesContext = `
El usuario tiene un negocio y tú eres su asesor.
Historial de ventas registrado: ${totalCount} transacciones.
Ingreso total acumulado: Bs. ${totalSales.toFixed(2)}.
Ventas recientes (últimas 5): ${JSON.stringify(sales.slice(0, 5).map(s => ({ producto: s.product_name, monto: s.amount, metodo: s.payment_method })))}
`;

      const systemPrompt = `Eres Tinka, el Coach Financiero experto impulsado por Inteligencia Artificial para Banco FIE (Bolivia).
Tu objetivo es analizar las ventas del emprendedor y dar consejos estratégicos y motivadores en español boliviano.
Debes responder amablemente a cualquier pregunta (incluso si no es de finanzas, como sobre "Rayo McQueen" o "Michael Jackson"), pero siempre conectándolo con algún consejo de éxito, ventas o ahorro.
Responde usando formato Markdown (viñetas, negritas).

Contexto financiero actual del usuario:
${salesContext}`;

      // 2. Llamada a Groq con el SDK oficial
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000,
      });

      return chatCompletion.choices[0]?.message?.content || "No pude procesar tu mensaje.";

    } catch (error) {
      this.logger.error(`Error detallado en CoachService: ${error.message}`);
      return `¡Uy! Tuve un error de conexión con mi IA central (Detalle: ${error.message}). Por favor, avísale al administrador.`;
    }
  }
}

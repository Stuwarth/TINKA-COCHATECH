import { Injectable, Logger } from '@nestjs/common';
import { WhatsappService } from '../../../common/services/whatsapp.service';
import { BusinessesService } from '../../businesses/businesses.service';
import { SalesService } from '../../sales/sales.service';
import { GroqService } from './groq.service';
import { OpenaiService } from './openai.service';
import { WhatsAppMessage } from '../types/whatsapp.types';

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly businessesService: BusinessesService,
    private readonly salesService: SalesService,
    private readonly groqService: GroqService,
    private readonly openaiService: OpenaiService,
  ) {}

  /**
   * Procesa un mensaje entrante de WhatsApp.
   * Flujo:
   * 1. Si es mensaje de activación (ACTIVAR:token:nombre) → vincular número
   * 2. Si el número está vinculado → procesar venta
   * 3. Si no está registrado → rechazar
   */
  async processIncomingMessage(
    senderPhone: string,
    message: WhatsAppMessage,
    senderName?: string,
  ): Promise<void> {
    const cleanPhone = senderPhone.replace(/\D/g, '');
    this.logger.log(
      `Mensaje recibido de ${cleanPhone} | Tipo: ${message.type}`,
    );

    // Marcar como leído inmediatamente para mejorar la UX
    this.whatsappService.markAsRead(message.id).catch(() => {});

    // === PASO 1: ¿Es un mensaje de activación? ===
    if (message.type === 'text' && message.text?.body?.startsWith('ACTIVAR:')) {
      await this.handleActivation(cleanPhone, message.text.body);
      return;
    }

    // === PASO 2: ¿El número está vinculado a un negocio? ===
    const business =
      await this.businessesService.findByWhatsAppPhone(cleanPhone);

    if (!business) {
      this.logger.warn(`Número no registrado: ${cleanPhone}`);
      await this.whatsappService.sendMessage(
        cleanPhone,
        '⚠️ Este número no está registrado en Tinka.\n\nRegistra tu negocio en nuestra app y vincula tu WhatsApp para empezar a registrar ventas.\n\n🌐 https://tinka.app',
      );
      return;
    }

    // === PASO 3: Procesar la venta ===
    await this.handleSaleMessage(cleanPhone, message, business);
  }

  /**
   * Maneja el flujo de activación: ACTIVAR:token:NombreNegocio
   */
  private async handleActivation(
    phone: string,
    messageText: string,
  ): Promise<void> {
    try {
      // Parsear: ACTIVAR:ABC12345:Mi Negocio
      const parts = messageText.split(':');
      if (parts.length < 2) {
        await this.whatsappService.sendMessage(
          phone,
          '❌ Formato de activación inválido. Usa el link que recibiste al registrarte.',
        );
        return;
      }

      const token = parts[1].trim();
      this.logger.log(`Intento de activación: token=${token} phone=${phone}`);

      // Buscar negocio por token
      const business =
        await this.businessesService.findByActivationToken(token);

      if (!business) {
        await this.whatsappService.sendMessage(
          phone,
          '❌ Token de activación inválido o expirado.\n\nSi necesitas un nuevo token, regístrate nuevamente en la app.',
        );
        return;
      }

      // Verificar expiración
      if (business.activation_expires_at) {
        const expiresAt = new Date(business.activation_expires_at);
        if (expiresAt < new Date()) {
          await this.whatsappService.sendMessage(
            phone,
            '❌ Tu token de activación ha expirado.\n\nRegistra tu negocio nuevamente para obtener uno nuevo.',
          );
          return;
        }
      }

      // ¡Activar el negocio!
      await this.businessesService.activateBusiness(business.id, phone);

      await this.whatsappService.sendMessage(
        phone,
        `✅ *¡Negocio vinculado exitosamente!*\n\n` +
          `📍 *Negocio:* ${business.name}\n` +
          `📱 *WhatsApp:* Este número\n\n` +
          `Ahora puedes registrar ventas enviándome:\n` +
          `💬 Un *texto* → "Vendí 2 empanadas a 10bs"\n` +
          `🎤 Un *audio* → Describiendo tu venta\n\n` +
          `¡Empecemos! 🚀`,
      );

      this.logger.log(
        `✅ Negocio "${business.name}" activado con número ${phone}`,
      );
    } catch (error) {
      this.logger.error(`Error en activación: ${error.message}`);
      await this.whatsappService.sendMessage(
        phone,
        '❌ Ocurrió un error al activar tu negocio. Inténtalo de nuevo.',
      );
    }
  }

  /**
   * Maneja un mensaje de venta (audio o texto) de un negocio activo.
   */
  private async handleSaleMessage(
    phone: string,
    message: WhatsAppMessage,
    business: any,
  ): Promise<void> {
    try {
      let text: string;
      let source: string;

      // Obtener el texto según el tipo de mensaje
      if (message.type === 'audio' && message.audio) {
        source = 'whatsapp_audio';
        this.logger.log(`Descargando audio ${message.audio.id}...`);

        if (!process.env.GROQ_API_KEY) {
          await this.whatsappService.sendMessage(
            phone,
            '🎤 Disculpa, la transcripción de audios no está disponible temporalmente porque no se ha configurado la API de transcripción. Por favor, escríbeme tu venta en un mensaje de texto. 📝',
          );
          return;
        }

        const audioBuffer = await this.whatsappService.downloadMedia(
          message.audio.id,
        );
        text = await this.groqService.transcribeAudio(audioBuffer);

        if (!text || text.trim().length === 0) {
          await this.whatsappService.sendMessage(
            phone,
            '🎤 No pude entender el audio. ¿Puedes intentar de nuevo o escribirme la venta?',
          );
          return;
        }
      } else if (message.type === 'text' && message.text?.body) {
        source = 'whatsapp_text';
        text = message.text.body;
      } else if (message.type === 'interactive' && message.interactive) {
        source = 'whatsapp_interactive';
        text =
          message.interactive.button_reply?.title ||
          message.interactive.list_reply?.title ||
          '';

        if (!text) {
          await this.whatsappService.sendMessage(
            phone,
            '⚠️ Opción interactiva no válida o vacía. Por favor escribe tu mensaje.',
          );
          return;
        }
      } else {
        await this.whatsappService.sendMessage(
          phone,
          '📝 Solo puedo procesar *textos*, *audios* y *opciones interactivas* para registrar ventas o conversar conmigo.\n\nEjemplo: "Vendí 3 jugos a 15bs por QR" o pregúntame "¿Cuánto vendí hoy?"',
        );
        return;
      }

      // Obtener ventas del día actual del negocio para el contexto de la IA
      const todaySales = await this.salesService.getSalesToday(business.id);

      // Clasificar y procesar con OpenAI (GitHub Models)
      const aiResponse = await this.openaiService.classifyAndProcess(text, {
        businessName: business.name,
        todaySales: todaySales,
      });

      if (aiResponse.intent === 'sale' && aiResponse.saleData) {
        const saleData = aiResponse.saleData;

        // Guardar en la base de datos
        const sale = await this.salesService.createSale(
          {
            product_name: saleData.product_name,
            amount: saleData.amount,
            payment_method: saleData.payment_method,
            quantity: saleData.quantity,
            location: saleData.location || 'Tienda',
            business_id: business.id,
            source: source,
            raw_message: text,
          },
          business.user_id,
        );

        // Enviar confirmación
        await this.whatsappService.sendMessage(
          phone,
          `✅ *Venta registrada*\n\n` +
            `📦 *Producto:* ${saleData.product_name}\n` +
            `💰 *Monto:* Bs. ${saleData.amount}\n` +
            `💳 *Pago:* ${saleData.payment_method}\n` +
            `📍 *Ubicación:* ${saleData.location || 'Tienda'}\n` +
            `📊 *Cantidad:* ${saleData.quantity}\n\n` +
            `📱 Revisa tus reportes en la app de Tinka.`,
        );

        this.logger.log(
          `✅ Venta registrada para "${business.name}": ${saleData.product_name} - Bs.${saleData.amount} [${saleData.location || 'Tienda'}]`,
        );
      } else if (aiResponse.intent === 'chat' && aiResponse.chatResponse) {
        // Responder directamente con la respuesta del chatbot conversacional
        await this.whatsappService.sendMessage(phone, aiResponse.chatResponse);
      }
    } catch (error) {
      this.logger.error(`Error procesando mensaje: ${error.message}`);
      await this.whatsappService.sendMessage(
        phone,
        `❌ No pude procesar tu mensaje.\n\n` +
          `Intenta de nuevo con algo como:\n` +
          `"Vendí 2 empanadas a 10 bolivianos en efectivo" o pregúntame "¿Cuánto he vendido hoy?"`,
      );
    }
  }
}

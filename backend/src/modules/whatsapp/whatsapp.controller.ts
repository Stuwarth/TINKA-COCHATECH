import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  HttpCode,
  Logger,
  Res,
  RawBodyRequest,
} from '@nestjs/common';
import { WhatsappWebhookService } from './services/whatsapp-webhook.service';

@Controller('webhook/whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly webhookService: WhatsappWebhookService) {}

  /**
   * GET /webhook/whatsapp
   * Verificación del webhook de Meta.
   * Meta envía un challenge para confirmar que el endpoint es válido.
   */
  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: any,
  ) {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

    this.logger.log(`Webhook verification: mode=${mode}, token=${token}`);

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verificado correctamente');
      return res.status(200).send(challenge);
    }

    this.logger.warn('❌ Webhook verification failed');
    return res.status(403).send('Forbidden');
  }

  /**
   * POST /webhook/whatsapp
   * Recibe los mensajes entrantes de WhatsApp.
   * Meta espera siempre un 200 OK como respuesta.
   */
  @Post()
  @HttpCode(200)
  async handleWebhook(@Body() payload: any) {
    try {
      // Verificar que es un evento de WhatsApp
      if (payload.object !== 'whatsapp_business_account') {
        this.logger.warn(`Evento ignorado: object=${payload.object}`);
        return { status: 'ignored' };
      }

      // Procesar cada entrada del webhook
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          const value = change.value;

          // Solo procesar mensajes (ignorar statuses, errors, etc.)
          if (!value.messages || value.messages.length === 0) {
            continue;
          }

          for (const message of value.messages) {
            const senderPhone = message.from;

            // Procesar en background para no bloquear la respuesta a Meta
            this.webhookService
              .processIncomingMessage(senderPhone, message)
              .catch((error) => {
                this.logger.error(
                  `Error procesando mensaje de ${senderPhone}: ${error.message}`,
                );
              });
          }
        }
      }

      return { status: 'ok' };
    } catch (error) {
      this.logger.error(`Error en webhook: ${error.message}`);
      // Siempre retornar 200 a Meta para evitar reintentos
      return { status: 'error' };
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class WhatsappService {
  private twilioClient;
  private readonly logger = new Logger(WhatsappService.name);

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      this.logger.warn(
        'Credenciales de Twilio no configuradas. Los mensajes de WhatsApp no se enviarán.',
      );
    }

    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendCredentials(
    whatsappNumber: string,
    userEmail: string,
    token: string,
    businessName: string,
  ): Promise<void> {
    try {
      const message = `
🎉 *¡Registrado exitosamente en TINKA!*

Hola! Tu negocio "${businessName}" ha sido registrado exitosamente.

📧 *Email:* ${userEmail}
🔐 *Token de acceso:* ${token}

⚠️ Guarda este token en un lugar seguro.

Accede a la aplicación: https://tinka.app

¡Bienvenido a TINKA! 🚀
      `.trim();

      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

      await this.twilioClient.messages.create({
        from: `whatsapp:${twilioPhoneNumber}`,
        to: `whatsapp:+591${whatsappNumber}`,
        body: message,
      });

      this.logger.log(`Credenciales enviadas a WhatsApp: +591${whatsappNumber}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar mensaje de WhatsApp: ${error.message}`,
        error.stack,
      );
      // No lanzar el error para no interrumpir el flujo de registro
    }
  }
}


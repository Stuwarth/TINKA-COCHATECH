import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly graphApiUrl: string;
  private readonly accessToken: string;
  private readonly botPhone: string;

  constructor() {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    this.botPhone = process.env.WHATSAPP_BOT_PHONE || '';
    this.graphApiUrl = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

    if (!phoneNumberId || !this.accessToken) {
      this.logger.warn(
        'Credenciales de WhatsApp (Meta) no configuradas. Los mensajes no se enviarán.',
      );
    }
  }

  /**
   * Envía credenciales por WhatsApp
   * @param phone Número de teléfono
   * @param email Email del usuario
   * @param token Token JWT
   * @param businessName Nombre del negocio
   */
  async sendCredentials(
    phone: string,
    email: string,
    token: string,
    businessName: string,
  ): Promise<string> {
    try {
      const message = `🎉 ¡Bienvenido a TINKA, ${businessName}!\n\nTus credenciales:\nEmail: ${email}\nToken: ${token}\n\nAccede a: https://tinka.app`;
      await this.sendMessage(phone, message);
      return this.buildActivationLink('activation', businessName);
    } catch (error) {
      this.logger.error(`Error enviando credenciales: ${error.message}`);
      return this.buildActivationLink('activation', businessName);
    }
  }

  /**
   * Envía un mensaje de texto por WhatsApp usando la Meta Cloud API.
   * @param to Número del destinatario con código de país (ej: "59170000000")
   * @param body Texto del mensaje
   */
  async sendMessage(to: string, body: string): Promise<void> {
    try {
      // Limpiar el número: solo dígitos
      const cleanPhone = to.replace(/\D/g, '');

      const response = await fetch(this.graphApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`Error Meta API: ${JSON.stringify(errorData)}`);
        throw new Error(`WhatsApp send failed: ${response.status}`);
      }

      this.logger.log(`Mensaje enviado a ${cleanPhone}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar mensaje de WhatsApp: ${error.message}`,
        error.stack,
      );
      // No lanzar el error para no interrumpir el flujo principal
    }
  }

  /**
   * Descarga un archivo multimedia de WhatsApp (audio, imagen, etc).
   * Paso 1: Obtener la URL del media con el media_id.
   * Paso 2: Descargar el archivo binario.
   * @param mediaId ID del medio proporcionado por el webhook
   * @returns Buffer con el contenido del archivo
   */
  async downloadMedia(mediaId: string): Promise<Buffer> {
    // Paso 1: Obtener URL del media
    const mediaInfoResponse = await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!mediaInfoResponse.ok) {
      throw new Error(`Error al obtener info del media: ${mediaInfoResponse.status}`);
    }

    const mediaInfo = await mediaInfoResponse.json();
    const mediaUrl = mediaInfo.url;

    // Paso 2: Descargar el archivo binario
    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!mediaResponse.ok) {
      throw new Error(`Error al descargar media: ${mediaResponse.status}`);
    }

    const arrayBuffer = await mediaResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Construye el link wa.me con mensaje pre-llenado para activar un negocio.
   * El usuario abre este link → WhatsApp se abre → él envía el mensaje.
   * @param activationToken Token de activación del negocio
   * @param businessName Nombre del negocio
   * @returns URL completa de wa.me
   */
  buildActivationLink(activationToken: string, businessName: string): string {
    const message = `ACTIVAR:${activationToken}:${businessName}`;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${this.botPhone}?text=${encodedMessage}`;
  }
}

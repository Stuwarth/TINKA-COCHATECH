/**
 * Tipos para el payload del webhook de Meta WhatsApp Cloud API.
 * Ref: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */

export interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppEntry[];
}

export interface WhatsAppEntry {
  id: string;
  changes: WhatsAppChange[];
}

export interface WhatsAppChange {
  value: WhatsAppChangeValue;
  field: string;
}

export interface WhatsAppChangeValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: WhatsAppContact[];
  messages?: WhatsAppMessage[];
  statuses?: any[];
}

export interface WhatsAppContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsAppMessage {
  from: string;
  id: string;
  timestamp: string;
  type:
    | 'text'
    | 'audio'
    | 'image'
    | 'document'
    | 'video'
    | 'location'
    | 'reaction'
    | 'interactive';
  text?: {
    body: string;
  };
  audio?: {
    id: string;
    mime_type: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
}

export interface ExtractedSaleData {
  product_name: string;
  quantity: number;
  amount: number;
  payment_method: string;
}

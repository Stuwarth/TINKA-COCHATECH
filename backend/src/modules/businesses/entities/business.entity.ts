export interface Business {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category?: string;
  phone?: string;
  location?: string;
  whatsapp_phone?: string;
  activation_token?: string;
  activation_expires_at?: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

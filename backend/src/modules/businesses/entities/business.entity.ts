<<<<<<< HEAD
export interface Business {
=======
export class Business {
>>>>>>> fd2912acf944c76fc84688c4c623721f9cb0768c
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category?: string;
  phone?: string;
  location?: string;
<<<<<<< HEAD
  whatsapp_phone?: string;
  activation_token?: string;
  activation_expires_at?: string;
  status: 'pending' | 'active' | 'suspended';
  created_at: string;
  updated_at: string;
=======
  status: string;
  created_at?: Date;
  updated_at?: Date;
>>>>>>> fd2912acf944c76fc84688c4c623721f9cb0768c
}

export interface Sale {
  id: string;
  user_id?: string;
  business_id?: string;
  product_name: string;
  quantity: number;
  amount: number;
  payment_method: string;
  location?: string;
  source?: string;
  raw_message?: string;
  created_at: string;
}

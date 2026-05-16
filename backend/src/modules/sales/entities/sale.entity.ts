export interface Sale {
  id: string;
  user_id?: string;
  product_name: string;
  amount: number;
  payment_method: string;
  location?: string;
  created_at: string;
}


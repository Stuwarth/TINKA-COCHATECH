import { Injectable } from '@nestjs/common';
import { supabase } from '../../config/supabase.config';
import { CreateSaleDto } from './dto/create-sale.dto';
import { Sale } from './entities/sale.entity';

type SupabaseError = { message: string };

type SingleSaleResponse = {
  data: Sale | null;
  error: SupabaseError | null;
};

type ListSalesResponse = {
  data: Sale[] | null;
  error: SupabaseError | null;
};

@Injectable()
export class SalesService {
  async createSale(
    createSaleDto: CreateSaleDto,
    userId?: string,
  ): Promise<Sale> {
    const response = (await supabase
      .from('sales')
      .insert([
        {
          user_id: userId,
          business_id: createSaleDto.business_id,
          product_name: createSaleDto.product_name,
          quantity: createSaleDto.quantity || 1,
          amount: createSaleDto.amount,
          payment_method: createSaleDto.payment_method,
          location: createSaleDto.location || 'Tienda',
          source: createSaleDto.source || 'web',
          raw_message: createSaleDto.raw_message,
        },
      ])
      .select()
      .single()) as SingleSaleResponse;

    const { data, error } = response;

    if (error) {
      throw new Error(`Error creating sale: ${error.message}`);
    }

    if (!data) {
      throw new Error('Error creating sale: no data returned');
    }

    return data;
  }

  async listSales(
    from?: string,
    to?: string,
    userId?: string,
  ): Promise<Sale[]> {
    let query = supabase.from('sales').select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (from) {
      query = query.gte('created_at', new Date(from).toISOString());
    }

    if (to) {
      query = query.lte('created_at', new Date(to).toISOString());
    }

    const response = (await query.order('created_at', {
      ascending: false,
    })) as ListSalesResponse;

    const { data, error } = response;

    if (error) {
      throw new Error(`Error listing sales: ${error.message}`);
    }

    return data ?? [];
  }

  async getSalesToday(userId?: string): Promise<Sale[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.listSales(today.toISOString(), tomorrow.toISOString(), userId);
  }

  async getSalesLastWeek(userId?: string): Promise<Sale[]> {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.listSales(weekAgo.toISOString(), today.toISOString(), userId);
  }

  async getTotalSales(
    from: string,
    to: string,
    userId?: string,
  ): Promise<number> {
    const sales = await this.listSales(from, to, userId);
    return sales.reduce((sum, sale) => sum + sale.amount, 0);
  }

  async getSalesByPaymentMethod(
    from: string,
    to: string,
    userId?: string,
  ): Promise<Array<{ payment_method: string; amount: number }>> {
    const sales = await this.listSales(from, to, userId);
    const grouped = sales.reduce<Record<string, number>>((acc, sale) => {
      const method = sale.payment_method;
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += sale.amount;
      return acc;
    }, {});

    return Object.entries(grouped).map(([method, amount]) => ({
      payment_method: method,
      amount,
    }));
  }
}

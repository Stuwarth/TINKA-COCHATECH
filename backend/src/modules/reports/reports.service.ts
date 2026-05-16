import { Injectable } from '@nestjs/common';
import { SalesService } from '../sales/sales.service';

@Injectable()
export class ReportsService {
  constructor(private readonly salesService: SalesService) {}

  async getSummaryReport(from: string, to: string, userId?: string) {
    const sales = await this.salesService.listSales(from, to, userId);
    const totalAmount = sales.reduce((sum, sale) => sum + sale.amount, 0);

    return {
      period: {
        from,
        to,
      },
      total_amount: totalAmount,
      total_transactions: sales.length,
      average_transaction: sales.length > 0 ? totalAmount / sales.length : 0,
      sales,
    };
  }

  async getPaymentMethodReport(from: string, to: string, userId?: string) {
    const byPaymentMethod = await this.salesService.getSalesByPaymentMethod(
      from,
      to,
      userId,
    );

    const total = byPaymentMethod.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    return {
      period: {
        from,
        to,
      },
      total_amount: total,
      by_payment_method: byPaymentMethod.map((item) => ({
        ...item,
        percentage: ((item.amount / total) * 100).toFixed(2),
      })),
    };
  }

  async getDailyReport(from: string, to: string, userId?: string) {
    const sales = await this.salesService.listSales(from, to, userId);

    const byDay = {};
    sales.forEach((sale) => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      if (!byDay[date]) {
        byDay[date] = {
          date,
          total: 0,
          transactions: 0,
          details: [],
        };
      }
      byDay[date].total += sale.amount;
      byDay[date].transactions += 1;
      byDay[date].details.push(sale);
    });

    return {
      period: {
        from,
        to,
      },
      daily_totals: Object.values(byDay),
    };
  }
}


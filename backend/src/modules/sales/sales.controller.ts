import { Body, Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ListSalesDto } from './dto/list-sales.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@Request() req, @Query() query: ListSalesDto) {
    const sales = await this.salesService.listSales(query.from, query.to, req.user.sub);
    return sales || [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('today')
  async today(@Request() req) {
    const sales = await this.salesService.getSalesToday(req.user.sub);
    return sales || [];
  }

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async summary(@Request() req) {
    const salesLastWeek = await this.salesService.getSalesLastWeek(req.user.sub);
    const totalWeek = salesLastWeek.reduce((sum, sale) => sum + sale.amount, 0);

    // Preparar datos para los últimos 5 días
    const last5Days: Array<{ day: string; amount: number }> = [];
    const daysNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const daySales = salesLastWeek.filter(
        (sale) =>
          new Date(sale.created_at).getTime() >= date.getTime() &&
          new Date(sale.created_at).getTime() < nextDate.getTime(),
      );

      const dayTotal = daySales.reduce((sum, sale) => sum + sale.amount, 0);

      last5Days.push({
        day: daysNames[date.getDay()],
        amount: dayTotal,
      });
    }

    // Determinar salud basada en trending
    let healthStatus = 'Bueno';
    if (totalWeek > 1500) {
      healthStatus = 'Excelente';
    } else if (totalWeek < 500) {
      healthStatus = 'Necesita atención';
    }

    // Calcular porcentaje de aumento (comparar últimos 2 días)
    const today = last5Days[last5Days.length - 1]?.amount || 0;
    const yesterday = last5Days[last5Days.length - 2]?.amount || 1;
    const percentageUp = ((today - yesterday) / yesterday) * 100;

    return {
      total_week: totalWeek,
      health_status: healthStatus,
      percentage_up: Math.round(percentageUp),
      last_5_days: last5Days,
    };
  }
}

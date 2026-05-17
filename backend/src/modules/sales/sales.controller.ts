import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ListSalesDto } from './dto/list-sales.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { supabase } from '../../config/supabase.config';

@ApiTags('Sales')
@ApiBearerAuth('JWT-auth')
@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  private async validateBusinessOwnership(
    businessId: string | undefined,
    userId: string,
  ): Promise<void> {
    if (!businessId) {
      throw new ForbiddenException(
        'Negocio no especificado (x-business-id header requerido)',
      );
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('id', businessId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new ForbiddenException(
        'No tienes acceso a este negocio o el negocio no existe',
      );
    }
  }

  @Post()
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio (requerido)',
  })
  @ApiOperation({
    summary: 'Registrar nueva venta',
    description:
      'Crea un nuevo registro de venta. Requiere el header x-business-id.',
  })
  @ApiResponse({ status: 201, description: 'Venta registrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado al negocio' })
  @ApiBody({ type: CreateSaleDto })
  async create(
    @Request() req,
    @Headers('x-business-id') businessId: string,
    @Body() createSaleDto: CreateSaleDto,
  ) {
    const userId = req.user.sub;
    const finalBusinessId = businessId || createSaleDto.business_id;
    await this.validateBusinessOwnership(finalBusinessId, userId);
    return this.salesService.createSale(
      {
        ...createSaleDto,
        business_id: finalBusinessId,
      },
      userId,
    );
  }

  @Get()
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio (requerido)',
  })
  @ApiOperation({
    summary: 'Listar ventas',
    description: 'Obtiene lista de ventas con filtros por período',
  })
  @ApiQuery({ type: ListSalesDto })
  @ApiResponse({ status: 200, description: 'Lista de ventas' })
  async list(
    @Request() req,
    @Headers('x-business-id') businessId: string,
    @Query() query: ListSalesDto,
  ) {
    const userId = req.user.sub;
    await this.validateBusinessOwnership(businessId, userId);
    const sales = await this.salesService.listSales(
      query.from,
      query.to,
      businessId,
    );
    return sales || [];
  }

  @Get('today')
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio (requerido)',
  })
  @ApiOperation({
    summary: 'Ventas de hoy',
    description: 'Obtiene las ventas registradas el día de hoy',
  })
  @ApiResponse({ status: 200, description: 'Lista de ventas del día' })
  async today(@Request() req, @Headers('x-business-id') businessId: string) {
    const userId = req.user.sub;
    await this.validateBusinessOwnership(businessId, userId);
    const sales = await this.salesService.getSalesToday(businessId);
    return sales || [];
  }

  @Get('summary')
  @ApiHeader({
    name: 'x-business-id',
    description: 'ID del negocio (requerido)',
  })
  @ApiOperation({
    summary: 'Resumen de ventas',
    description:
      'Obtiene estadísticas completas: total, última semana, estado de salud, gráfico de últimos 5 días',
  })
  @ApiResponse({ status: 200, description: 'Resumen de ventas' })
  async summary(@Request() req, @Headers('x-business-id') businessId: string) {
    const userId = req.user.sub;
    await this.validateBusinessOwnership(businessId, userId);

    const salesLastWeek = await this.salesService.getSalesLastWeek(businessId);
    const totalWeek = salesLastWeek.reduce((sum, sale) => sum + sale.amount, 0);

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

    let healthStatus = 'Bueno';
    if (totalWeek > 1500) {
      healthStatus = 'Excelente';
    } else if (totalWeek < 500) {
      healthStatus = 'Necesita atención';
    }

    const today = last5Days[last5Days.length - 1]?.amount || 0;
    const yesterday = last5Days[last5Days.length - 2]?.amount || 1;
    const percentageUp = ((today - yesterday) / yesterday) * 100;

    const allSales = await this.salesService.listSales(
      undefined,
      undefined,
      businessId,
    );
    const totalBalanceEver = allSales.reduce(
      (sum, sale) => Number(sum) + Number(sale.amount),
      0,
    );

    return {
      total_balance: totalBalanceEver,
      total_week: totalWeek,
      health_status: healthStatus,
      percentage_up: Math.round(percentageUp),
      last_5_days: last5Days,
    };
  }
}

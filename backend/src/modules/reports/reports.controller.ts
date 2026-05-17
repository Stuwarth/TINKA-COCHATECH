import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('userId') userId?: string,
  ) {
    return this.reportsService.getSummaryReport(from, to, userId);
  }

  @Get('by-payment')
  async getByPaymentMethod(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('userId') userId?: string,
  ) {
    return this.reportsService.getPaymentMethodReport(from, to, userId);
  }

  @Get('daily')
  async getDaily(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('userId') userId?: string,
  ) {
    return this.reportsService.getDailyReport(from, to, userId);
  }
}

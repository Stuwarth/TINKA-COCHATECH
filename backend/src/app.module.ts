import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BusinessesModule } from './modules/businesses/businesses.module';

@Module({
  imports: [AuthModule, SalesModule, ReportsModule, BusinessesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [AuthModule, SalesModule, ReportsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

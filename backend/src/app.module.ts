import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';

@Module({
  imports: [AuthModule, SalesModule, ReportsModule, BusinessesModule, WhatsappModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

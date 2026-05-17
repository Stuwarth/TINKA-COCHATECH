import { Module } from '@nestjs/common';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { SalesModule } from '../sales/sales.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [SalesModule, AuthModule],
  controllers: [CoachController],
  providers: [CoachService],
})
export class CoachModule {}

import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappWebhookService } from './services/whatsapp-webhook.service';
import { GroqService } from './services/groq.service';
import { OpenaiService } from './services/openai.service';
import { WhatsappService } from '../../common/services/whatsapp.service';
import { SalesModule } from '../sales/sales.module';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [SalesModule, BusinessesModule],
  controllers: [WhatsappController],
  providers: [
    WhatsappWebhookService,
    GroqService,
    OpenaiService,
    WhatsappService,
  ],
  exports: [WhatsappWebhookService, GroqService, OpenaiService],
})
export class WhatsappModule {}
